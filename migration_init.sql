-- MIGRACIÓN INICIAL ASESORÍA PREVENCIÓN CRM
-- Ejecutar este SQL en Supabase SQL Editor

-- Crear ENUMs
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CEO', 'DIR_TECNICO', 'DIR_COMERCIAL', 'COMERCIAL', 'PREVENCIONISTA', 'CLIENTE');
CREATE TYPE "Segment" AS ENUM ('PYME', 'COLEGIO', 'CONTRATISTA', 'MEDIANA', 'OTRA');
CREATE TYPE "Phase" AS ENUM ('F1', 'F2', 'F3', 'F4');
CREATE TYPE "CompanyStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'PAUSED', 'CLOSED');
CREATE TYPE "PipelineStage" AS ENUM ('PROSPECCION', 'DIAGNOSTICO', 'PROPUESTA', 'SEGUIMIENTO', 'CIERRE_G', 'CIERRE_P');
CREATE TYPE "ActivityType" AS ENUM ('LLAMADA', 'WHATSAPP', 'EMAIL', 'REUNION_ONLINE', 'VISITA_TERRENO');
CREATE TYPE "TaskStatus" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'OMITIDA');
CREATE TYPE "ProposalStatus" AS ENUM ('BORRADOR', 'ENVIADA', 'ACEPTADA', 'RECHAZADA');

-- Tabla users
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "UserRole" DEFAULT 'COMERCIAL' NOT NULL,
    "active" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla companies
CREATE TABLE "companies" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "businessName" VARCHAR(255) NOT NULL,
    "tradeName" VARCHAR(255),
    "rut" VARCHAR(20) UNIQUE,
    "industry" VARCHAR(100),
    "segment" "Segment",
    "workersCount" INTEGER,
    "address" VARCHAR(255),
    "commune" VARCHAR(100),
    "region" VARCHAR(50),
    "adminBody" VARCHAR(50),
    "website" VARCHAR(255),
    "mainContactName" VARCHAR(255),
    "mainContactRole" VARCHAR(100),
    "mainContactEmail" VARCHAR(255),
    "mainContactPhone" VARCHAR(50),
    "currentPhase" "Phase",
    "currentServices" TEXT,
    "startDate" TIMESTAMP,
    "renewalDate" TIMESTAMP,
    "status" "CompanyStatus" DEFAULT 'PROSPECT' NOT NULL,
    "accountOwnerId" INTEGER REFERENCES "users"("id"),
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla opportunities
CREATE TABLE "opportunities" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "companyId" INTEGER NOT NULL REFERENCES "companies"("id"),
    "origin" VARCHAR(100),
    "segment" "Segment",
    "recommendedPhase" "Phase",
    "pipelineStage" "PipelineStage" DEFAULT 'PROSPECCION' NOT NULL,
    "probabilityPercent" INTEGER DEFAULT 0,
    "estimatedAmountCLP" DECIMAL(15,2),
    "proposalSentAt" TIMESTAMP,
    "expectedCloseDate" TIMESTAMP,
    "closedAt" TIMESTAMP,
    "lostReason" VARCHAR(255),
    "ownerId" INTEGER REFERENCES "users"("id"),
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla activities
CREATE TABLE "activities" (
    "id" SERIAL PRIMARY KEY,
    "companyId" INTEGER REFERENCES "companies"("id"),
    "opportunityId" INTEGER REFERENCES "opportunities"("id"),
    "activityType" "ActivityType" NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "activityDatetime" TIMESTAMP NOT NULL,
    "outcome" VARCHAR(100),
    "nextStep" VARCHAR(255),
    "nextStepDate" TIMESTAMP,
    "createdById" INTEGER NOT NULL REFERENCES "users"("id"),
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla task_templates
CREATE TABLE "task_templates" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "funnelStage" VARCHAR(50) NOT NULL,
    "phaseScope" VARCHAR(20),
    "mandatory" BOOLEAN DEFAULT true NOT NULL,
    "slaDays" INTEGER,
    "roleResponsible" VARCHAR(50),
    "frequency" VARCHAR(50),
    "automatable" BOOLEAN DEFAULT false NOT NULL,
    "active" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla opportunity_tasks
CREATE TABLE "opportunity_tasks" (
    "id" SERIAL PRIMARY KEY,
    "opportunityId" INTEGER NOT NULL REFERENCES "opportunities"("id"),
    "taskTemplateId" INTEGER NOT NULL REFERENCES "task_templates"("id"),
    "status" "TaskStatus" DEFAULT 'PENDIENTE' NOT NULL,
    "dueDate" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "assignedToId" INTEGER REFERENCES "users"("id"),
    "notes" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla proposals
CREATE TABLE "proposals" (
    "id" SERIAL PRIMARY KEY,
    "companyId" INTEGER NOT NULL,
    "opportunityId" INTEGER NOT NULL REFERENCES "opportunities"("id"),
    "subtotal" DECIMAL(12,2) NOT NULL,
    "iva" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "status" "ProposalStatus" DEFAULT 'BORRADOR' NOT NULL,
    "version" INTEGER DEFAULT 1 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabla proposal_items
CREATE TABLE "proposal_items" (
    "id" SERIAL PRIMARY KEY,
    "proposalId" INTEGER NOT NULL REFERENCES "proposals"("id") ON DELETE CASCADE,
    "itemCode" VARCHAR(50) NOT NULL,
    "itemName" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPriceCLP" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "phase" VARCHAR(10)
);

-- Crear índices para mejor performance
CREATE INDEX "idx_companies_code" ON "companies"("code");
CREATE INDEX "idx_companies_status" ON "companies"("status");
CREATE INDEX "idx_opportunities_code" ON "opportunities"("code");
CREATE INDEX "idx_opportunities_pipeline" ON "opportunities"("pipelineStage");
CREATE INDEX "idx_opportunities_company" ON "opportunities"("companyId");
CREATE INDEX "idx_activities_company" ON "activities"("companyId");
CREATE INDEX "idx_activities_opportunity" ON "activities"("opportunityId");
CREATE INDEX "idx_proposals_opportunity" ON "proposals"("opportunityId");
