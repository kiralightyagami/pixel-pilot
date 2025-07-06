"use client";
import { Button } from "./ui/button";
import { Send} from "lucide-react";
import axios from "axios";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL } from "@/config";
import { useRouter } from "next/navigation";
import { useWebSocketSimple } from "@/lib/useWebSocketSimple";

interface PromptProps {
  onGenerationStart?: () => void;
}

export function Prompt({ onGenerationStart }: PromptProps) {
  const [prompt, setPrompt] = useState("");
  const { getToken } = useAuth();
  const router = useRouter();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const cursorRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  
  const placeholderExamples = useMemo(() => [
    "create a square from four lines",
    "draw a circle with pen", 
    "draw a linear graph"
  ], []);
  
  

  
  
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setCurrentPlaceholderIndex(0);
    }, 500);
    
    return () => clearTimeout(initTimer);
  }, []);
  
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      if (cursorRef.current) {
        clearTimeout(cursorRef.current);
      }
    };
  }, []);
  
  
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
  
  const placeholderText = useMemo(() => {
    if (prompt.length > 0 || isProcessing) return "";
    return displayedText + (showCursor ? '|' : ' ');
  }, [displayedText, showCursor, prompt.length, isProcessing]);
  
  // Cursor blinking effect
  useEffect(() => {
    if (prompt.length > 0 || isProcessing) {
      setShowCursor(false);
      return;
    }
    
    const blinkCursor = () => {
      setShowCursor(prev => !prev);
      cursorRef.current = setTimeout(blinkCursor, 600);
    };
    
    cursorRef.current = setTimeout(blinkCursor, 600);
    
    return () => {
      if (cursorRef.current) {
        clearTimeout(cursorRef.current);
      }
    };
  }, [prompt.length, isProcessing]);
  
  // Text typing animation effect
  useEffect(() => {
    if (prompt.length > 0 || isProcessing) {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      isAnimatingRef.current = false;
      return;
    }
    
    if (isAnimatingRef.current) return;
    
    const runAnimation = () => {
      isAnimatingRef.current = true;
      const currentExample = placeholderExamples[currentPlaceholderIndex];
      
      const typeText = () => {
        let charIndex = 0;
        const typeChar = () => {
          if (prompt.length > 0 || isProcessing) {
            isAnimatingRef.current = false;
            return;
          }
          
          if (charIndex <= currentExample.length) {
            setDisplayedText(currentExample.slice(0, charIndex));
            charIndex++;
            animationRef.current = setTimeout(typeChar, 80);
          } else {
            animationRef.current = setTimeout(deleteText, 2000);
          }
        };
        typeChar();
      };
      
      const deleteText = () => {
        let charIndex = currentExample.length;
        const deleteChar = () => {
          if (prompt.length > 0 || isProcessing) {
            isAnimatingRef.current = false;
            return;
          }
          
          if (charIndex > 0) {
            setDisplayedText(currentExample.slice(0, charIndex - 1));
            charIndex--;
            animationRef.current = setTimeout(deleteChar, 50);
          } else {
            setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
            isAnimatingRef.current = false;
          }
        };
        deleteChar();
      };
      
      typeText();
    };
    
    animationRef.current = setTimeout(runAnimation, 100);
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      isAnimatingRef.current = false;
    };
  }, [currentPlaceholderIndex, placeholderExamples, prompt.length, isProcessing]);
    
    const handleSubmit = async () => {
      if (!prompt.trim() || !isConnected) return;
      
      try {
        
        onGenerationStart?.();
        
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
      } catch (error) {
        console.error('Error creating project:', error);
      }
    };

    
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    
    if (videoUrl && currentProjectId) {
      setTimeout(() => {
        setPrompt(""); // Clear prompt before redirecting
        router.push(`/project/${currentProjectId}`);
      }, 1000); 
    }

    return (
        <div className="flex flex-col gap-4">
          {/* Enhanced input container with pitch black theme */}
          <div className="relative group">
            {/* Background layer */}
            <div className="absolute inset-0 rounded-2xl bg-black/90 backdrop-blur-sm border border-gray-800/50 shadow-2xl shadow-black/50 transition-all duration-300 group-hover:border-gray-700/60" />
            
            <textarea 
              placeholder={placeholderText}
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              onKeyDown={handleKeyPress}
              disabled={isProcessing}
              className="relative w-full h-24 px-5 py-4 pr-16 text-white placeholder-gray-500 bg-transparent border-0 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 selection:bg-blue-400/20 z-10"
            />
            
            {/* Submit button positioned inside */}
            <div className="absolute bottom-3 right-3 z-20">
              <div className="relative group/button">
                {/* Button background */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 transition-all duration-300 group-hover/button:from-blue-500/90 group-hover/button:to-purple-500/90 shadow-lg shadow-blue-500/25" />
                
                <Button 
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || !isConnected || isProcessing}
                  size="sm"
                  className="relative bg-transparent hover:bg-transparent disabled:bg-transparent border-0 shadow-none hover:shadow-none transition-all duration-300 text-white font-medium z-10"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Connection status indicator */}
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-black/80 backdrop-blur-sm border border-gray-800/40">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}></div>
            <span className={`${isConnected ? 'text-green-300' : 'text-red-300'} font-medium`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
         
          {isProcessing && (
            <div className="relative group">
              {/* Processing container background */}
              <div className="absolute inset-0 rounded-2xl bg-black/90 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/30" />
              
              <div className="relative space-y-3 p-5 z-10">
                <div className="text-sm font-medium text-blue-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  {status || 'Processing...'}
                </div>
                {streamingExplanation && (
                  <div className="text-xs text-gray-300 max-h-20 overflow-y-auto custom-scrollbar leading-relaxed">
                    {streamingExplanation}
                  </div>
                )}
                {videoUrl && (
                  <div className="text-sm font-medium text-green-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                    ✅ Video generated! Redirecting to project...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {wsError && (
            <div className="relative group">
              {/* Error container background */}
              <div className="absolute inset-0 rounded-2xl bg-black/90 backdrop-blur-sm border border-red-800/50 shadow-xl shadow-red-900/20" />
              
              <div className="relative text-sm text-red-300 p-4 font-medium z-10">
                {wsError}
              </div>
            </div>
          )}
        </div>
    )
}