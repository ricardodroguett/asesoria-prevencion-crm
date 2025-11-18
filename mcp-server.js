#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

const PROJECT_ROOT = '/Applications/MAMP/htdocs/asesoria-prevencion-crm';

// Lista blanca de comandos permitidos
const ALLOWED_COMMANDS = [
  'ls', 'cat', 'grep', 'find', 'pwd', 'whoami',
  'npm', 'npx', 'node',
  'git',
  'php', 'composer'
];

// Comandos peligrosos bloqueados
const BLOCKED_COMMANDS = ['rm', 'rmdir', 'del', 'format', 'dd', 'mkfs', 'sudo', 'chmod', 'chown'];

function isCommandAllowed(command) {
  const cmd = command.trim().split(' ')[0];
  
  if (BLOCKED_COMMANDS.includes(cmd)) {
    return { allowed: false, reason: `Comando bloqueado por seguridad: ${cmd}` };
  }
  
  if (!ALLOWED_COMMANDS.includes(cmd)) {
    return { allowed: false, reason: `Comando no permitido: ${cmd}` };
  }
  
  return { allowed: true };
}

const tools = [
  {
    name: 'read_file',
    description: 'Lee el contenido de un archivo del proyecto',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Ruta relativa del archivo'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'list_directory',
    description: 'Lista archivos y directorios',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Ruta del directorio (vacío = raíz del proyecto)'
        }
      }
    }
  },
  {
    name: 'search_code',
    description: 'Busca texto en archivos del proyecto',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Texto a buscar'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'write_file',
    description: 'Crea o modifica un archivo (crea backup automático)',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Ruta del archivo'
        },
        content: {
          type: 'string',
          description: 'Contenido del archivo'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'delete_file',
    description: 'Elimina un archivo (crea backup antes)',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Ruta del archivo a eliminar'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'execute_terminal',
    description: 'Ejecuta comandos de terminal (lista blanca: ls, cat, grep, find, php, node, npm, git, df, du). Comandos peligrosos bloqueados: rm, sudo, chmod',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Comando a ejecutar'
        },
        workingDir: {
          type: 'string',
          description: 'Directorio de trabajo (default: PROJECT_ROOT)'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'git_status',
    description: 'Obtiene el estado de Git',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'git_add',
    description: 'Agrega archivos al staging de Git',
    inputSchema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de archivos (vacío = todos)'
        }
      }
    }
  },
  {
    name: 'git_commit',
    description: 'Hace commit de cambios',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensaje del commit'
        }
      },
      required: ['message']
    }
  },
  {
    name: 'git_push',
    description: 'Sube cambios a GitHub',
    inputSchema: {
      type: 'object',
      properties: {
        branch: {
          type: 'string',
          description: 'Rama (default: main)'
        }
      }
    }
  },
  {
    name: 'git_pull',
    description: 'Descarga cambios del repositorio remoto',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'project_info',
    description: 'Información general del proyecto',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'run_script',
    description: 'Ejecuta un script PHP/JS del proyecto',
    inputSchema: {
      type: 'object',
      properties: {
        script: {
          type: 'string',
          description: 'Ruta del script'
        },
        language: {
          type: 'string',
          enum: ['php', 'node'],
          description: 'Lenguaje (php o node)'
        }
      },
      required: ['script']
    }
  }
];

async function handleToolCall(toolName, args) {
  try {
    switch (toolName) {
      case 'read_file': {
        const filePath = path.join(PROJECT_ROOT, args.path);
        const content = await fs.readFile(filePath, 'utf-8');
        return { content };
      }

      case 'list_directory': {
        const dirPath = args.path ? path.join(PROJECT_ROOT, args.path) : PROJECT_ROOT;
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const items = entries.map(entry => ({
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          path: path.relative(PROJECT_ROOT, path.join(dirPath, entry.name))
        }));
        return { items };
      }

      case 'search_code': {
        const { stdout } = await execPromise(
          `grep -r "${args.query}" --include="*.ts" --include="*.js" --include="*.json" --include="*.prisma" .`,
          { cwd: PROJECT_ROOT }
        );
        return { results: stdout };
      }

      case 'write_file': {
        const filePath = path.join(PROJECT_ROOT, args.path);
        
        // Backup si existe
        try {
          const exists = await fs.access(filePath).then(() => true).catch(() => false);
          if (exists) {
            const backupPath = `${filePath}.backup.${Date.now()}`;
            await fs.copyFile(filePath, backupPath);
          }
        } catch (e) {}
        
        await fs.writeFile(filePath, args.content, 'utf-8');
        return { success: true, path: args.path };
      }

      case 'delete_file': {
        const filePath = path.join(PROJECT_ROOT, args.path);
        
        // Backup antes de eliminar
        const backupPath = `${filePath}.deleted.${Date.now()}`;
        await fs.copyFile(filePath, backupPath);
        await fs.unlink(filePath);
        
        return { success: true, backup: backupPath };
      }

      case 'execute_terminal': {
        const check = isCommandAllowed(args.command);
        if (!check.allowed) {
          return { error: check.reason };
        }

        const cwd = args.workingDir ? path.join(PROJECT_ROOT, args.workingDir) : PROJECT_ROOT;
        const { stdout, stderr } = await execPromise(args.command, { cwd, maxBuffer: 1024 * 1024 * 10 });
        return { stdout, stderr };
      }

      case 'git_status': {
        const { stdout } = await execPromise('git status --porcelain', { cwd: PROJECT_ROOT });
        return { status: stdout };
      }

      case 'git_add': {
        const files = args.files && args.files.length > 0 ? args.files.join(' ') : '.';
        const { stdout } = await execPromise(`git add ${files}`, { cwd: PROJECT_ROOT });
        return { success: true, output: stdout };
      }

      case 'git_commit': {
        const { stdout } = await execPromise(`git commit -m "${args.message}"`, { cwd: PROJECT_ROOT });
        return { success: true, output: stdout };
      }

      case 'git_push': {
        const branch = args.branch || 'main';
        const { stdout } = await execPromise(`git push origin ${branch}`, { cwd: PROJECT_ROOT });
        return { success: true, output: stdout };
      }

      case 'git_pull': {
        const { stdout } = await execPromise('git pull', { cwd: PROJECT_ROOT });
        return { success: true, output: stdout };
      }

      case 'project_info': {
        const packageJson = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, 'package.json'), 'utf-8'));
        return {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          root: PROJECT_ROOT
        };
      }

      case 'run_script': {
        const lang = args.language || (args.script.endsWith('.php') ? 'php' : 'node');
        const cmd = lang === 'php' ? `php ${args.script}` : `node ${args.script}`;
        const { stdout, stderr } = await execPromise(cmd, { cwd: PROJECT_ROOT });
        return { stdout, stderr };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    return { error: error.message };
  }
}

// Servidor MCP
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    
    if (request.method === 'tools/list') {
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result: { tools }
      };
      console.log(JSON.stringify(response));
    } else if (request.method === 'tools/call') {
      const { name, arguments: args } = request.params;
      const result = await handleToolCall(name, args || {});
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      };
      console.log(JSON.stringify(response));
    } else if (request.method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'asesoria-prevencion-crm-mcp',
            version: '1.0.0'
          }
        }
      };
      console.log(JSON.stringify(response));
    }
  } catch (error) {
    const response = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: error.message
      }
    };
    console.log(JSON.stringify(response));
  }
});

process.on('SIGINT', () => {
  process.exit(0);
});


