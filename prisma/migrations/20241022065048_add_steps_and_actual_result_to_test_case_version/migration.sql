/*
  Warnings:

  - A unique constraint covering the columns `[testCaseId,versionNumber]` on the table `TestCaseVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN "actualResult" TEXT;
ALTER TABLE "TestCase" ADD COLUMN "steps" TEXT;

-- AlterTable
ALTER TABLE "TestCaseVersion" ADD COLUMN "actualResult" TEXT;
ALTER TABLE "TestCaseVersion" ADD COLUMN "steps" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TestCaseVersion_testCaseId_versionNumber_key" ON "TestCaseVersion"("testCaseId", "versionNumber");
