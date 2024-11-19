-- CreateTable
CREATE TABLE "test_suite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "test_suite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TestCaseToTestSuite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TestCaseToTestSuite_A_fkey" FOREIGN KEY ("A") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TestCaseToTestSuite_B_fkey" FOREIGN KEY ("B") REFERENCES "test_suite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "test_suite_projectId_idx" ON "test_suite"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "_TestCaseToTestSuite_AB_unique" ON "_TestCaseToTestSuite"("A", "B");

-- CreateIndex
CREATE INDEX "_TestCaseToTestSuite_B_index" ON "_TestCaseToTestSuite"("B");
