import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';

// Define the TestRunResult type locally since it's not exported from @/types
interface TestRunResult {
  testCaseId: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';
  notes?: string;
  evidenceUrls?: string[];
}

interface WebSocketMessage {
  type: 'TEST_RUN_UPDATE' | 'CONFLICT_DETECTED';
  payload: {
    results?: TestRunResult[];
    error?: string;
    timestamp?: number;
  };
}

interface WebSocketError {
  code: number;
  reason: string;
}

export function useTestRunWebSocket(
  projectId: string,
  testRunId: string,
  onConflict: (serverChanges: TestRunResult[]) => void
) {
  const { showErrorToast } = useToast();

  const connectWebSocket = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.error('WebSocket URL not configured');
      return null;
    }

    const ws = new WebSocket(
      `${wsUrl}/projects/${projectId}/test-runs/${testRunId}`
    );

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        
        switch (message.type) {
          case 'CONFLICT_DETECTED':
            if (message.payload.results) {
              onConflict(message.payload.results);
            }
            break;
          case 'TEST_RUN_UPDATE':
            // Handle other updates if needed
            break;
          default:
            console.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onerror = (event: Event) => {
      const error = event as unknown as WebSocketError;
      showErrorToast(
        error.reason || 'Lost connection to server. Some features may be unavailable.'
      );
    };

    ws.onclose = (event) => {
      if (!event.wasClean) {
        showErrorToast('Connection lost. Attempting to reconnect...');
        // Attempt to reconnect after a delay
        setTimeout(() => {
          connectWebSocket();
        }, 5000);
      }
    };

    return ws;
  }, [projectId, testRunId, onConflict, showErrorToast]);

  useEffect(() => {
    const ws = connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close(1000, 'Component unmounted');
      }
    };
  }, [connectWebSocket]);

  // Return cleanup function for manual disconnection if needed
  return {
    disconnect: useCallback(() => {
      const ws = connectWebSocket();
      if (ws) {
        ws.close(1000, 'Manual disconnection');
      }
    }, [connectWebSocket]),
  };
} 