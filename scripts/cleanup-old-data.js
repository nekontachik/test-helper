/**
 * Script to clean up old data from the database
 * 
 * This script removes:
 * 1. Soft-deleted records older than 90 days
 * 2. Audit logs older than 180 days
 * 3. Old test run results older than 365 days (unless marked as important)
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

// Parse days arguments
const getArgValue = (argName: string, defaultValue: number): number => {
  const argIndex = args.findIndex(arg => arg.startsWith(`--${argName}=`));
  if (argIndex !== -1) {
    const value = args[argIndex].split('=')[1];
    return parseInt(value, 10);
  }
  return defaultValue;
};

const deletedRecordsDays = getArgValue('deleted-days', 90);
const auditLogsDays = getArgValue('audit-days', 180);
const testRunsDays = getArgValue('test-run-days', 365);

// Calculate cutoff dates
const now = new Date();
const deletedRecordsCutoff = new Date(now.getTime() - deletedRecordsDays * 24 * 60 * 60 * 1000);
const auditLogsCutoff = new Date(now.getTime() - auditLogsDays * 24 * 60 * 60 * 1000);
const testRunsCutoff = new Date(now.getTime() - testRunsDays * 24 * 60 * 60 * 1000);

// Log configuration
console.log('Cleanup Configuration:');
console.log(`- Dry Run: ${dryRun ? 'Yes' : 'No'}`);
console.log(`- Verbose: ${verbose ? 'Yes' : 'No'}`);
console.log(`- Deleted Records Cutoff: ${deletedRecordsCutoff.toISOString()} (${deletedRecordsDays} days)`);
console.log(`- Audit Logs Cutoff: ${auditLogsCutoff.toISOString()} (${auditLogsDays} days)`);
console.log(`- Test Runs Cutoff: ${testRunsCutoff.toISOString()} (${testRunsDays} days)`);
console.log('');

async function cleanupSoftDeletedRecords(): Promise<void> {
  console.log('Cleaning up soft-deleted records...');
  
  // Find soft-deleted projects
  const deletedProjects = await prisma.project.findMany({
    where: {
      deleted: true,
      updatedAt: {
        lt: deletedRecordsCutoff
      }
    }
  });
  
  if (verbose) {
    console.log(`Found ${deletedProjects.length} soft-deleted projects to remove`);
  }
  
  // Find soft-deleted test cases
  const deletedTestCases = await prisma.testCase.findMany({
    where: {
      deleted: true,
      updatedAt: {
        lt: deletedRecordsCutoff
      }
    }
  });
  
  if (verbose) {
    console.log(`Found ${deletedTestCases.length} soft-deleted test cases to remove`);
  }
  
  // Find soft-deleted test runs
  const deletedTestRuns = await prisma.testRun.findMany({
    where: {
      deleted: true,
      updatedAt: {
        lt: deletedRecordsCutoff
      }
    }
  });
  
  if (verbose) {
    console.log(`Found ${deletedTestRuns.length} soft-deleted test runs to remove`);
  }
  
  if (!dryRun) {
    // Perform actual deletion
    if (deletedTestRuns.length > 0) {
      const deletedTestRunIds = deletedTestRuns.map(run => run.id);
      
      // Delete test run results first (foreign key constraint)
      await prisma.testRunResult.deleteMany({
        where: {
          testRunId: {
            in: deletedTestRunIds
          }
        }
      });
      
      // Delete test runs
      await prisma.testRun.deleteMany({
        where: {
          id: {
            in: deletedTestRunIds
          }
        }
      });
    }
    
    // Delete test cases
    if (deletedTestCases.length > 0) {
      const deletedTestCaseIds = deletedTestCases.map(testCase => testCase.id);
      
      await prisma.testCase.deleteMany({
        where: {
          id: {
            in: deletedTestCaseIds
          }
        }
      });
    }
    
    // Delete projects
    if (deletedProjects.length > 0) {
      const deletedProjectIds = deletedProjects.map(project => project.id);
      
      await prisma.project.deleteMany({
        where: {
          id: {
            in: deletedProjectIds
          }
        }
      });
    }
  }
  
  console.log(`Removed ${deletedProjects.length} projects, ${deletedTestCases.length} test cases, and ${deletedTestRuns.length} test runs`);
}

async function cleanupAuditLogs(): Promise<void> {
  console.log('Cleaning up old audit logs...');
  
  // Find old audit logs
  const oldAuditLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        lt: auditLogsCutoff
      }
    }
  });
  
  if (verbose) {
    console.log(`Found ${oldAuditLogs.length} old audit logs to remove`);
  }
  
  if (!dryRun && oldAuditLogs.length > 0) {
    // Delete old audit logs
    await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: auditLogsCutoff
        }
      }
    });
  }
  
  console.log(`Removed ${oldAuditLogs.length} audit logs`);
}

async function cleanupOldTestRuns(): Promise<void> {
  console.log('Cleaning up old test runs...');
  
  // Find old test runs that are not marked as important
  const oldTestRuns = await prisma.testRun.findMany({
    where: {
      createdAt: {
        lt: testRunsCutoff
      },
      important: false,
      deleted: false
    }
  });
  
  if (verbose) {
    console.log(`Found ${oldTestRuns.length} old test runs to remove`);
  }
  
  if (!dryRun && oldTestRuns.length > 0) {
    const oldTestRunIds = oldTestRuns.map(run => run.id);
    
    // Delete test run results first (foreign key constraint)
    await prisma.testRunResult.deleteMany({
      where: {
        testRunId: {
          in: oldTestRunIds
        }
      }
    });
    
    // Soft delete test runs
    await prisma.testRun.updateMany({
      where: {
        id: {
          in: oldTestRunIds
        }
      },
      data: {
        deleted: true,
        updatedAt: new Date()
      }
    });
  }
  
  console.log(`Soft-deleted ${oldTestRuns.length} old test runs`);
}

async function main(): Promise<void> {
  try {
    console.log('Starting database cleanup...');
    
    await cleanupSoftDeletedRecords();
    await cleanupAuditLogs();
    await cleanupOldTestRuns();
    
    console.log('Database cleanup completed successfully!');
    
    if (dryRun) {
      console.log('This was a dry run. No actual data was deleted.');
    }
  } catch (error) {
    console.error('Error during database cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 