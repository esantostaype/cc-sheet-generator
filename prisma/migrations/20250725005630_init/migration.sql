-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('S', 'A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('TO_DO', 'IN_PROGRESS', 'ON_APPROVAL', 'COMPLETE');

-- CreateTable
CREATE TABLE "tier_list" (
    "id" SERIAL NOT NULL,
    "name" "Tier" NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tier_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVacation" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVacation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spaceId" TEXT,
    "folderId" TEXT,
    "teamId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "defaultStatus" "Status" NOT NULL DEFAULT 'TO_DO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'TO_DO',
    "priority" "Priority" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "timeEstimate" INTEGER,
    "customDuration" DOUBLE PRECISION,
    "points" INTEGER,
    "tags" TEXT,
    "url" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "typeId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TaskType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "tierId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "brandId" TEXT,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityIntId" INTEGER,
    "entityStringId" TEXT,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "clickupResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "dataType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "group" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tier_list_name_key" ON "tier_list"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserVacation_userId_startDate_endDate_key" ON "UserVacation"("userId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_id_key" ON "Brand"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_key" ON "Task"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_userId_taskId_key" ON "TaskAssignment"("userId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskType_name_key" ON "TaskType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "task_category_name_typeId_key" ON "task_category"("name", "typeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_typeId_brandId_key" ON "UserRole"("userId", "typeId", "brandId");

-- CreateIndex
CREATE INDEX "SystemSettings_group_order_idx" ON "SystemSettings"("group", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_category_key_key" ON "SystemSettings"("category", "key");

-- AddForeignKey
ALTER TABLE "UserVacation" ADD CONSTRAINT "UserVacation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TaskType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "task_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_category" ADD CONSTRAINT "task_category_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TaskType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_category" ADD CONSTRAINT "task_category_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "tier_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TaskType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
