import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  console.log('Loading environment variables from .env file');
  dotenv.config();
} else {
  console.log('No .env file found. Using default environment variables.');
}
