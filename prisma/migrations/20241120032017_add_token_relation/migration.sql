/*
  Warnings:

  - Added the required column `updatedAt` to the `WebAuthnCredential` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestRun" ADD COLUMN "completedAt" DATETIME;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "currentChallenge" TEXT;

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WebAuthnCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transportsData" TEXT NOT NULL,
    "lastUsed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WebAuthnCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WebAuthnCredential" ("counter", "createdAt", "credentialID", "credentialPublicKey", "id", "lastUsed", "transportsData", "userId") SELECT "counter", "createdAt", "credentialID", "credentialPublicKey", "id", "lastUsed", "transportsData", "userId" FROM "WebAuthnCredential";
DROP TABLE "WebAuthnCredential";
ALTER TABLE "new_WebAuthnCredential" RENAME TO "WebAuthnCredential";
CREATE UNIQUE INDEX "WebAuthnCredential_credentialID_key" ON "WebAuthnCredential"("credentialID");
CREATE INDEX "WebAuthnCredential_userId_idx" ON "WebAuthnCredential"("userId");
CREATE INDEX "WebAuthnCredential_credentialID_idx" ON "WebAuthnCredential"("credentialID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE INDEX "Token_userId_idx" ON "Token"("userId");

-- CreateIndex
CREATE INDEX "Token_token_idx" ON "Token"("token");
