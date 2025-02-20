import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import type { TestResult } from '@/types/testResults';

const MAX_RECONNECT_ATTEMPTS = 5;

export function useTestRunWebSocket(
  projectId: string,
  testRunId: string,
  onConflict: (changes: TestResult[]) => void
) {
  const { showErrorToast } = useToast();

  const connect = useCallback(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/projects/${projectId}/test-runs/${testRunId}`
    );

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'conflict') {
          onConflict(data.changes);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (event: Event) => {
      const error = event as unknown as { reason?: string };
      showErrorToast(
        error.reason || 'Lost connection to server. Some features may be unavailable.'
      );
    };

    let reconnectAttempts = 0;

    ws.onclose = (event) => {
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        showErrorToast('Connection lost. Attempting to reconnect...');
        reconnectAttempts++;
        setTimeout(() => {
          connect();
        }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000));
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        showErrorToast('Unable to reconnect. Please refresh the page.');
      }
    };

    return ws;
  }, [projectId, testRunId, onConflict, showErrorToast]);

  useEffect(() => {
    const ws = connect();
    return () => ws.close();
  }, [connect]);

  return {
    disconnect: () => {
      // Implementation if needed
    }
  };
} 