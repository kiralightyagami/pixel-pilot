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

export const useWebSocketSimple = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [streamingExplanation, setStreamingExplanation] = useState('');
  const [finalExplanation, setFinalExplanation] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log('useWebSocketSimple: Creating connection...');
    
    
    const ws = new WebSocket(WORKER_WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('useWebSocketSimple: Connected');
      setIsConnected(true);
      setError(null);
    };
    
    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('useWebSocketSimple: Message received:', data);

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
        console.error('useWebSocketSimple: Error parsing message:', err);
      }
    };
    
    ws.onclose = (event) => {
      console.log('useWebSocketSimple: Connection closed:', event.code, event.reason);
      setIsConnected(false);
      setIsProcessing(false);
    };
    
    ws.onerror = (error) => {
      console.log('useWebSocketSimple: Error:', error);
      setError('WebSocket connection error');
      setIsConnected(false);
      setIsProcessing(false);
    };
    
    
    return () => {
      console.log('useWebSocketSimple: Cleaning up...');
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
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