import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';

interface TestAppDB extends DBSchema {
  'test-results': {
    key: string;
    value: {
      id: string;
      testCaseId: string;
      status: string;
      notes?: string;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'test-app-db';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase<TestAppDB>> {
  return openDB<TestAppDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const testResultsStore = db.createObjectStore('test-results', {
        keyPath: 'id'
      });
      testResultsStore.createIndex('by-timestamp', 'timestamp');
    }
  });
}

export async function addTestResult(result: TestAppDB['test-results']['value']) {
  const db = await initDB();
  return db.add('test-results', result);
}

export async function getTestResults() {
  const db = await initDB();
  return db.getAllFromIndex('test-results', 'by-timestamp');
}

export async function clearTestResults() {
  const db = await initDB();
  return db.clear('test-results');
} 