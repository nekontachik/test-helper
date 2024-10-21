import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const logFilePath = path.join(process.cwd(), 'logs', 'combined.log');
      const logs = fs.readFileSync(logFilePath, 'utf-8');
      const recentLogs = logs.split('\n').slice(-100).join('\n'); // Get last 100 lines
      res.status(200).json({ logs: recentLogs });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving logs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
