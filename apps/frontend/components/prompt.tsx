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
  
  
  const placeholderText = useMemo(() => {
    if (prompt.length > 0) return "";
    return displayedText + (showCursor ? '|' : ' ');
  }, [displayedText, showCursor, prompt.length]);
  
  
  useEffect(() => {
    
    if (prompt.length > 0) {
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
  }, [prompt.length]);
  
  
  useEffect(() => {
    
    if (prompt.length > 0) {
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
          
          if (prompt.length > 0) {
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
          
          if (prompt.length > 0) {
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
  }, [currentPlaceholderIndex, placeholderExamples, prompt.length]);
  
  
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
        
        setPrompt("");
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
        router.push(`/project/${currentProjectId}`);
      }, 1000); 
    }

    return (
        <div className="flex flex-col gap-4">
          {/* Enhanced Apple Glass effect textarea container */}
          <div className="relative group">
            {/* Background glass layer */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-transparent backdrop-blur-[20px] border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:border-white/[0.2] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]" 
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            />
            
            {/* Inner highlight border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.15] via-transparent to-transparent opacity-50 pointer-events-none" />
            
            <textarea 
              placeholder={placeholderText}
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              onKeyDown={handleKeyPress}
              disabled={isProcessing}
              className="relative w-full h-24 px-5 py-4 pr-16 text-white placeholder-gray-400 bg-transparent border-0 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 selection:bg-blue-400/20 z-10"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            />
            
            {/* Enhanced glass effect submit button positioned inside */}
            <div className="absolute bottom-3 right-3 z-20">
              <div className="relative group/button">
                {/* Button background glass layer */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/[0.6] via-purple-500/[0.5] to-blue-600/[0.4] backdrop-blur-[12px] border border-white/[0.2] shadow-[0_4px_16px_rgba(59,130,246,0.3)] transition-all duration-300 group-hover/button:shadow-[0_6px_20px_rgba(59,130,246,0.4)] group-hover/button:border-white/[0.25]"
                  style={{
                    backdropFilter: 'blur(12px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                  }}
                />
                
                {/* Button inner highlight */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.2] via-transparent to-transparent opacity-60 pointer-events-none" />
                
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
          
          {/* Enhanced Connection status indicator with glass effect */}
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-white/[0.05] backdrop-blur-[12px] border border-white/[0.1]"
            style={{
              backdropFilter: 'blur(12px) saturate(150%)',
              WebkitBackdropFilter: 'blur(12px) saturate(150%)',
            }}
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}></div>
            <span className={`${isConnected ? 'text-green-300' : 'text-red-300'} font-medium`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
         
          {isProcessing && (
            <div className="relative group">
              {/* Processing container background glass layer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-transparent backdrop-blur-[20px] border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                style={{
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                }}
              />
              
              {/* Inner highlight border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.1] via-transparent to-transparent opacity-50 pointer-events-none" />
              
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
              {/* Error container background glass layer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/[0.1] via-red-600/[0.05] to-transparent backdrop-blur-[20px] border border-red-400/[0.3] shadow-[0_8px_32px_rgba(239,68,68,0.15)]"
                style={{
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                }}
              />
              
              {/* Inner highlight border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-400/[0.15] via-transparent to-transparent opacity-50 pointer-events-none" />
              
              <div className="relative text-sm text-red-300 p-4 font-medium z-10">
                {wsError}
              </div>
            </div>
          )}
        </div>
    )
}