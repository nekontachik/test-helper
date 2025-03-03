/**
 * Script to clean up old log files
 * 
 * This script removes log files older than the specified number of days.
 * Usage: node scripts/cleanup-logs.js --days=30
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

// Get command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

// Parse days argument
const daysArg = args.find(arg => arg.startsWith('--days='));
const days = daysArg ? parseInt(daysArg.split('=')[1], 10) : 30;

// Calculate cutoff date
const now = new Date();
const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

// Log directories to clean
const logDirectories = [
  path.join(__dirname, '..', 'logs'),
  path.join(__dirname, '..', 'src', 'logs')
];

// Log file extensions to clean
const logExtensions = ['.log', '.txt', '.json'];

async function cleanupLogs() {
  console.log('Cleanup Configuration:');
  console.log(`- Dry Run: ${dryRun ? 'Yes' : 'No'}`);
  console.log(`- Verbose: ${verbose ? 'Yes' : 'No'}`);
  console.log(`- Cutoff Date: ${cutoffDate.toISOString()} (${days} days)`);
  console.log(`- Log Directories: ${logDirectories.join(', ')}`);
  console.log(`- Log Extensions: ${logExtensions.join(', ')}`);
  console.log('');
  
  let totalFilesRemoved = 0;
  let totalBytesRemoved = 0;
  
  for (const directory of logDirectories) {
    try {
      // Check if directory exists
      if (!fs.existsSync(directory)) {
        if (verbose) {
          console.log(`Directory does not exist: ${directory}`);
        }
        continue;
      }
      
      console.log(`Cleaning logs in ${directory}...`);
      
      // Get all files in the directory
      const files = await readdir(directory);
      
      for (const file of files) {
        const filePath = path.join(directory, file);
        
        try {
          // Get file stats
          const fileStat = await stat(filePath);
          
          // Skip directories
          if (fileStat.isDirectory()) {
            continue;
          }
          
          // Check if file extension matches
          const fileExt = path.extname(file).toLowerCase();
          if (!logExtensions.includes(fileExt)) {
            continue;
          }
          
          // Check if file is older than cutoff date
          if (fileStat.mtime < cutoffDate) {
            if (verbose) {
              console.log(`Removing old log file: ${filePath} (${fileStat.size} bytes, modified ${fileStat.mtime.toISOString()})`);
            }
            
            if (!dryRun) {
              await unlink(filePath);
            }
            
            totalFilesRemoved++;
            totalBytesRemoved += fileStat.size;
          }
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${directory}:`, error.message);
    }
  }
  
  // Format bytes to human-readable format
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  console.log('');
  console.log('Cleanup Summary:');
  console.log(`- Total files removed: ${totalFilesRemoved}`);
  console.log(`- Total space freed: ${formatBytes(totalBytesRemoved)}`);
  
  if (dryRun) {
    console.log('This was a dry run. No actual files were deleted.');
  }
}

// Run the cleanup
cleanupLogs().catch(error => {
  console.error('Error during log cleanup:', error);
  process.exit(1);
}); 