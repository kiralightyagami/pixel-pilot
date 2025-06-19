import { useEffect, useRef, useState } from 'react';
import { WORKER_WS_URL } from '@/config';

interface WebSocketMessage {
  type: 'status' | 'explanation_chunk' | 'explanation_final' | 'video_ready' | 'complete' | 'error';
  message?: string;
  content?: string;
  videoUrl?: string;
  code?: string;
  explanation?: string;
}

interface UseWebSocketReturn {
  sendPrompt: (prompt: string, projectId: string) => void;
  isConnected: boolean;
  isProcessing: boolean;
  status: string;
  streamingExplanation: string;
  finalExplanation: string;
  videoUrl: string | null;
  error: string | null;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [streamingExplanation, setStreamingExplanation] = useState('');
  const [finalExplanation, setFinalExplanation] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let connectAttempts = 0;
    const maxConnectAttempts = 1;
    
    const connectWebSocket = () => {
      if (!isMounted || isConnectingRef.current || connectAttempts >= maxConnectAttempts) return;
      
     
      if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
        console.log('WebSocket already connecting/connected, skipping...');
        return;
      }
      
      console.log('useWebSocket: Attempting to connect...');
      isConnectingRef.current = true;
      connectAttempts++;
      
      try {
        const ws = new WebSocket(WORKER_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('useWebSocket: Connected successfully');
          isConnectingRef.current = false;
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log('WebSocket message received:', data);

            switch (data.type) {
              case 'status':
                setStatus(data.message || '');
                break;
              case 'explanation_chunk':
                setStreamingExplanation(data.content || '');
                break;
              case 'explanation_final':
                setFinalExplanation(data.content || '');
                setStreamingExplanation('');
                break;
              case 'video_ready':
                setVideoUrl(data.videoUrl || null);
                break;
              case 'complete':
                setIsProcessing(false);
                setStatus('Complete');
                break;
              case 'error':
                setError(data.message || 'Unknown error occurred');
                setIsProcessing(false);
                break;
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onclose = (event) => {
          console.log('useWebSocket: Disconnected:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
          isConnectingRef.current = false;
          setIsConnected(false);
          setIsProcessing(false);
          
          
          if (!event.wasClean && isMounted && connectAttempts < maxConnectAttempts) {
            console.log('useWebSocket: Will NOT auto-reconnect to prevent loops');
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          isConnectingRef.current = false;
          setError(`WebSocket connection error - make sure the worker server is running on port 8080`);
          setIsConnected(false);
          setIsProcessing(false);
        };
      } catch (err) {
        console.error('Failed to create WebSocket connection:', err);
        isConnectingRef.current = false;
        setError('Failed to connect to server');
      }
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendPrompt = (prompt: string, projectId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsProcessing(true);
      setError(null);
      setStreamingExplanation('');
      setFinalExplanation('');
      setVideoUrl(null);
      setStatus('Sending prompt...');
      
      wsRef.current.send(JSON.stringify({
        type: 'prompt',
        prompt,
        projectId
      }));
    } else {
      setError('WebSocket not connected');
    }
  };

  return {
    sendPrompt,
    isConnected,
    isProcessing,
    status,
    streamingExplanation,
    finalExplanation,
    videoUrl,
    error
  };
}; 