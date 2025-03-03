import { v4 as uuidv4 } from 'uuid';

export interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private storageKey = 'offline_request_queue';

  constructor() {
    this.loadQueue();
    window.addEventListener('online', this.processQueue.bind(this));
  }

  private loadQueue(): void {
    const savedQueue = localStorage.getItem(this.storageKey);
    if (savedQueue) {
      this.queue = JSON.parse(savedQueue);
    }
  }

  private saveQueue(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
  }

  enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): void {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: uuidv4(),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.queue.push(queuedRequest);
    this.saveQueue();

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const requests = [...this.queue];
      for (const request of requests) {
        try {
          await fetch(request.url, {
            method: request.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: request.data ? JSON.stringify(request.data) : undefined,
          });

          // Remove successful request from queue
          this.queue = this.queue.filter(r => r.id !== request.id);
          this.saveQueue();
        } catch (error: unknown) {
          console.error(`Failed to process request ${request.id}:`, error);
          request.retryCount++;
          if (request.retryCount >= request.maxRetries) {
            // Remove failed request after max retries
            this.queue = this.queue.filter(r => r.id !== request.id);
            this.saveQueue();
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

export const requestQueue = new RequestQueue(); 