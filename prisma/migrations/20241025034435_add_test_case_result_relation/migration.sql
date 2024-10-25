/*
  Warnings:

  - You are about to drop the column `description` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TestReport` table. All the data in the column will be lost.
  - You are about to drop the column `testRunId` on the `TestReport` table. All the data in the column will be lost.
  - Made the column `steps` on table `TestCase` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `TestCaseVersion` table without a default value. This is not possible if the table is not empty.
  - Made the column `steps` on table `TestCaseVersion` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `content` to the `TestReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `TestReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "expectedResult" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testCaseId" TEXT NOT NULL,
    CONSTRAINT "Version_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdAt", "id", "name", "updatedAt", "userId") SELECT "createdAt", "id", "name", "updatedAt", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_TestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "steps" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "actualResult" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestCase" ("actualResult", "createdAt", "description", "expectedResult", "id", "priority", "projectId", "status", "steps", "title", "updatedAt", "version") SELECT "actualResult", "createdAt", "description", "expectedResult", "id", "priority", "projectId", "status", "steps", "title", "updatedAt", "version" FROM "TestCase";
DROP TABLE "TestCase";
ALTER TABLE "new_TestCase" RENAME TO "TestCase";
CREATE INDEX "TestCase_projectId_idx" ON "TestCase"("projectId");
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCaseVersion_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestCaseVersion" ("actualResult", "createdAt", "description", "expectedResult", "id", "priority", "status", "steps", "testCaseId", "title", "versionNumber") SELECT "actualResult", "createdAt", "description", "expectedResult", "id", "priority", "status", "steps", "testCaseId", "title", "versionNumber" FROM "TestCaseVersion";
DROP TABLE "TestCaseVersion";
ALTER TABLE "new_TestCaseVersion" RENAME TO "TestCaseVersion";
CREATE INDEX "TestCaseVersion_testCaseId_idx" ON "TestCaseVersion"("testCaseId");
CREATE UNIQUE INDEX "TestCaseVersion_testCaseId_versionNumber_key" ON "TestCaseVersion"("testCaseId", "versionNumber");
CREATE TABLE "new_TestReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "TestReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestReport" ("createdAt", "id", "projectId", "updatedAt") SELECT "createdAt", "id", "projectId", "updatedAt" FROM "TestReport";
DROP TABLE "TestReport";
ALTER TABLE "new_TestReport" RENAME TO "TestReport";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Version_testCaseId_idx" ON "Version"("testCaseId");

-- CreateIndex
CREATE INDEX "TestCaseResult_testRunId_idx" ON "TestCaseResult"("testRunId");

-- CreateIndex
CREATE INDEX "TestCaseResult_testCaseId_idx" ON "TestCaseResult"("testCaseId");

-- CreateIndex
CREATE INDEX "TestRun_projectId_idx" ON "TestRun"("projectId");

-- CreateIndex
CREATE INDEX "TestSuite_projectId_idx" ON "TestSuite"("projectId");
