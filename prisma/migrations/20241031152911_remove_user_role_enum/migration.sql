/*
  Warnings:

  - You are about to drop the `TestCaseAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestCaseComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestCaseVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestRunNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestSuite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Version` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TestCaseToTestRun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TestCaseToTestSuite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `completedAt` on the `TestRun` table. All the data in the column will be lost.
  - Added the required column `userId` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `TestCase` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expectedResult` on table `TestCase` required. This step will fail if there are existing NULL values in that column.
  - Made the column `steps` on table `TestCase` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `TestRun` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TestCaseAttachment_uploadedBy_idx";

-- DropIndex
DROP INDEX "TestCaseAttachment_testCaseId_idx";

-- DropIndex
DROP INDEX "TestCaseComment_userId_idx";

-- DropIndex
DROP INDEX "TestCaseComment_testCaseId_idx";

-- DropIndex
DROP INDEX "TestCaseVersion_testCaseId_versionNumber_key";

-- DropIndex
DROP INDEX "TestCaseVersion_testCaseId_idx";

-- DropIndex
DROP INDEX "TestRunNote_userId_idx";

-- DropIndex
DROP INDEX "TestRunNote_testRunId_idx";

-- DropIndex
DROP INDEX "TestSuite_projectId_idx";

-- DropIndex
DROP INDEX "Version_testCaseId_idx";

-- DropIndex
DROP INDEX "_TestCaseToTestRun_B_index";

-- DropIndex
DROP INDEX "_TestCaseToTestRun_AB_unique";

-- DropIndex
DROP INDEX "_TestCaseToTestSuite_B_index";

-- DropIndex
DROP INDEX "_TestCaseToTestSuite_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestCaseAttachment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestCaseComment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestCaseVersion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestReport";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestRunNote";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestSuite";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Version";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TestCaseToTestRun";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TestCaseToTestSuite";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("createdAt", "id", "name", "updatedAt", "userId") SELECT "createdAt", "id", "name", "updatedAt", "userId" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE INDEX "Project_userId_idx" ON "Project"("userId");
CREATE TABLE "new_TestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "actualResult" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestCase" ("createdAt", "description", "expectedResult", "id", "priority", "projectId", "status", "steps", "title", "updatedAt") SELECT "createdAt", "description", "expectedResult", "id", "priority", "projectId", "status", "steps", "title", "updatedAt" FROM "TestCase";
DROP TABLE "TestCase";
ALTER TABLE "new_TestCase" RENAME TO "TestCase";
CREATE INDEX "TestCase_projectId_idx" ON "TestCase"("projectId");
CREATE INDEX "TestCase_userId_idx" ON "TestCase"("userId");
CREATE TABLE "new_TestCaseResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "testCaseId" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCaseResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestCaseResult_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TestCaseResult" ("createdAt", "id", "notes", "status", "testCaseId", "testRunId", "updatedAt") SELECT "createdAt", "id", "notes", "status", "testCaseId", "testRunId", "updatedAt" FROM "TestCaseResult";
DROP TABLE "TestCaseResult";
ALTER TABLE "new_TestCaseResult" RENAME TO "TestCaseResult";
CREATE INDEX "TestCaseResult_testCaseId_idx" ON "TestCaseResult"("testCaseId");
CREATE INDEX "TestCaseResult_testRunId_idx" ON "TestCaseResult"("testRunId");
CREATE TABLE "new_TestRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestRun" ("createdAt", "id", "name", "projectId", "status", "updatedAt") SELECT "createdAt", "id", "name", "projectId", "status", "updatedAt" FROM "TestRun";
DROP TABLE "TestRun";
ALTER TABLE "new_TestRun" RENAME TO "TestRun";
CREATE INDEX "TestRun_projectId_idx" ON "TestRun"("projectId");
CREATE INDEX "TestRun_userId_idx" ON "TestRun"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
