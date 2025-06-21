"use client";
import { Button } from "./ui/button";
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

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    
    if (videoUrl && currentProjectId) {
      setTimeout(() => {
        router.push(`/project/${currentProjectId}`);
      }, 1000); 
    }

    return (
        <div className="flex flex-col gap-4">
          {/* Glass effect textarea container */}
          <div className="relative">
            <textarea 
              placeholder="Enter your prompt here (Press Enter to submit, Shift+Enter for new line)" 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              onKeyDown={handleKeyPress}
              disabled={isProcessing}
              className="w-full h-24 px-4 py-3 pr-16 text-white placeholder-gray-400 bg-white/10 border border-white/20 rounded-xl backdrop-blur-md resize-none outline-none focus:border-blue-400/50 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 shadow-lg hover:border-white/30"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            />
            
            {/* Glass effect submit button positioned inside */}
            <div className="absolute bottom-3 right-3">
              <Button 
                onClick={handleSubmit}
                disabled={!prompt.trim() || !isConnected || isProcessing}
                size="sm"
                className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/90 hover:to-purple-600/90 disabled:from-gray-500/50 disabled:to-gray-500/50 border border-white/30 backdrop-blur-md transition-all duration-300 shadow-lg text-white"
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Connection status indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={`${isConnected ? 'text-green-300' : 'text-red-300'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
         
          {isProcessing && (
            <div className="space-y-2 p-4 bg-white/10 border border-white/20 rounded-xl backdrop-blur-md shadow-lg">
              <div className="text-sm font-medium text-blue-300">
                {status || 'Processing...'}
              </div>
              {streamingExplanation && (
                <div className="text-xs text-gray-300 max-h-20 overflow-y-auto custom-scrollbar">
                  {streamingExplanation}
                </div>
              )}
              {videoUrl && (
                <div className="text-sm font-medium text-green-300">
                  ✅ Video generated! Redirecting to project...
                </div>
              )}
            </div>
          )}
          
          {wsError && (
            <div className="text-sm text-red-300 p-3 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-md shadow-lg">
              {wsError}
            </div>
          )}
        </div>
    )
}