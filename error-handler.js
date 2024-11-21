process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  // Ignore worker.js module not found error during development
  if (error.code === 'MODULE_NOT_FOUND' && 
      error.message.includes('vendor-chunks/lib/worker.js')) {
    return;
  }
  
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
