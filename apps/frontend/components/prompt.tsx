"use client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send} from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL } from "@/config";
import { useRouter } from "next/navigation";
import { useWebSocketSimple } from "@/lib/useWebSocketSimple";

export function Prompt() {
  const [prompt, setPrompt] = useState("");
  const { getToken } = useAuth();
  const router = useRouter();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  
  const {
    sendPrompt: wsSendPrompt,
    isConnected,
    isProcessing,
    status,
    streamingExplanation,
    finalExplanation,
    videoUrl,
    error: wsError
  } = useWebSocketSimple();
    const handleSubmit = async () => {
      if (!prompt.trim() || !isConnected) return;
      
      try {
        
        const token = await getToken();
        const response = await axios.post(`${BACKEND_URL}/project`, {
          prompt: prompt
        }, {
          headers: {
            "Authorization": `Bearer ${token}`
          } 
        });
        
        const projectId = response.data.projectId;
        setCurrentProjectId(projectId);
        
        
        wsSendPrompt(prompt, projectId);
        
        setPrompt("");
      } catch (error) {
        console.error('Error creating project:', error);
      }
    };

    
    if (videoUrl && currentProjectId) {
      setTimeout(() => {
        router.push(`/project/${currentProjectId}`);
      }, 1000); 
    }

    return (
        <div className="flex flex-col gap-2">
          <Textarea 
            placeholder="Enter your prompt here" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            className="w-full h-20"
            disabled={isProcessing}
          />
          
         
          {isProcessing && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium text-blue-600">
                {status || 'Processing...'}
              </div>
              {streamingExplanation && (
                <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                  {streamingExplanation}
                </div>
              )}
              {videoUrl && (
                <div className="text-sm font-medium text-green-600">
                  ✅ Video generated! Redirecting to project...
                </div>
              )}
            </div>
          )}
          
          {wsError && (
            <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
              {wsError}
            </div>
          )}
          
          <div className="flex justify-end pt-2">
            <Button 
              onClick={handleSubmit}
              disabled={!prompt.trim() || !isConnected || isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <Send />
              )}
            </Button>
          </div>
        </div>
    )
}