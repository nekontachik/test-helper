import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('.env file exists');
} else {
  console.log('.env file does not exist');
}
