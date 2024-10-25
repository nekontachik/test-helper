/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `TestCaseVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TestRun" ADD COLUMN "completedAt" DATETIME;

-- CreateTable
CREATE TABLE "TestCaseAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testCaseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCaseAttachment_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TestCaseAttachment_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestRunNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testRunId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestRunNote_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TestRunNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TestCaseVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testCaseId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "steps" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "actualResult" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestCaseVersion_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestCaseVersion" ("actualResult", "createdAt", "description", "expectedResult", "id", "priority", "status", "steps", "testCaseId", "title", "versionNumber") SELECT "actualResult", "createdAt", "description", "expectedResult", "id", "priority", "status", "steps", "testCaseId", "title", "versionNumber" FROM "TestCaseVersion";
DROP TABLE "TestCaseVersion";
ALTER TABLE "new_TestCaseVersion" RENAME TO "TestCaseVersion";
CREATE INDEX "TestCaseVersion_testCaseId_idx" ON "TestCaseVersion"("testCaseId");
CREATE UNIQUE INDEX "TestCaseVersion_testCaseId_versionNumber_key" ON "TestCaseVersion"("testCaseId", "versionNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TestCaseAttachment_testCaseId_idx" ON "TestCaseAttachment"("testCaseId");

-- CreateIndex
CREATE INDEX "TestCaseAttachment_uploadedBy_idx" ON "TestCaseAttachment"("uploadedBy");

-- CreateIndex
CREATE INDEX "TestRunNote_testRunId_idx" ON "TestRunNote"("testRunId");

-- CreateIndex
CREATE INDEX "TestRunNote_userId_idx" ON "TestRunNote"("userId");
