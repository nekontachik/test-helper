/*
  Warnings:

  - You are about to drop the column `actualResult` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `TestCase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Version" ADD COLUMN "steps" TEXT;

-- CreateTable
CREATE TABLE "TestCaseComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCaseComment_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TestCaseComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "steps" TEXT,
    "expectedResult" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TestCase" ("createdAt", "description", "expectedResult", "id", "priority", "projectId", "status", "steps", "title", "updatedAt") SELECT "createdAt", "description", "expectedResult", "id", "priority", "projectId", "status", "steps", "title", "updatedAt" FROM "TestCase";
DROP TABLE "TestCase";
ALTER TABLE "new_TestCase" RENAME TO "TestCase";
CREATE INDEX "TestCase_projectId_idx" ON "TestCase"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TestCaseComment_testCaseId_idx" ON "TestCaseComment"("testCaseId");

-- CreateIndex
CREATE INDEX "TestCaseComment_userId_idx" ON "TestCaseComment"("userId");
