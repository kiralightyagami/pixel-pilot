"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL, WORKER_URL } from "@/config";
import { useWebSocketSimple as useWebSocket } from "@/lib/useWebSocketSimple";
import { Appbar } from "@/components/Appbar";
import { Button } from "@/components/ui/button";
import { Send, Download } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function ProjectPage() {
    const { projectId } = useParams();
    const { getToken } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chat, setChat] = useState<{ prompt: string; explanation: string }[]>([]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    
    const {
        sendPrompt: wsSendPrompt,
        isConnected,
        isProcessing,
        status,
        streamingExplanation,
        finalExplanation,
        videoUrl,
        error: wsError
    } = useWebSocket();

    useEffect(() => {
        async function fetchProject() {
            try {
                const token = await getToken();
                const res = await axios.get(`${BACKEND_URL}/projects/${projectId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProject(res.data);
                
                
                await fetchLatestAnimation();
                
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }
        fetchProject();
    }, [projectId, getToken]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [chat, finalExplanation]); 

    
    const [lastSentPrompt, setLastSentPrompt] = useState<string>("");
    
    
    useEffect(() => {
        if (finalExplanation && !isProcessing && lastSentPrompt) {
            setChat((prev) => {
                
                const exists = prev.some(item => item.explanation === finalExplanation);
                if (!exists) {
                    return [...prev, { prompt: lastSentPrompt, explanation: finalExplanation }];
                }
                return prev;
            });
            setLastSentPrompt(""); 
        }
    }, [finalExplanation, isProcessing, lastSentPrompt]);

    const fetchLatestAnimation = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${BACKEND_URL}/projects/${projectId}/animations/latest`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
           
        } catch (err: any) {
            
            if (err.response?.status !== 404) {
                console.error("Error fetching latest animation:", err);
            }
        }
    };

    const sendPrompt = (prompt: string) => {
        if (isConnected && projectId) {
            wsSendPrompt(prompt, projectId as string);
        } else {
            setError('WebSocket not connected');
        }
    };

   
    useEffect(() => {
        const shouldAutoProcess = project && 
                                 project.description && 
                                 isConnected && 
                                 !isProcessing && 
                                 chat.length === 0; 
        
        if (shouldAutoProcess) {
            console.log('Auto-processing initial project description:', project.description);
            setLastSentPrompt(project.description);
            sendPrompt(project.description);
        }
    }, [project, isConnected, isProcessing, chat.length]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const prompt = input.trim();
        setLastSentPrompt(prompt);
        sendPrompt(prompt);
        setInput("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e as any);
        }
    };

    return (
        <div className="h-screen relative overflow-hidden flex flex-col">
            {/* Same beautiful background as home page */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#2a2a4a] pointer-events-none" />
            
            <div className="absolute top-0 left-0 right-0 h-96 z-20 pointer-events-none">
                {/* Wide background glow */}
                <div 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse 100% 80% at center top, rgba(147, 51, 234, 0.4) 0%, rgba(59, 130, 246, 0.3) 40%, rgba(147, 51, 234, 0.2) 70%, transparent 100%)',
                        filter: 'blur(40px)'
                    }}
                />
                
                {/* Intense central glow */}
                <div 
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-64 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse 80% 100% at center top, rgba(59, 130, 246, 0.6) 0%, rgba(147, 51, 234, 0.5) 30%, rgba(59, 130, 246, 0.3) 60%, transparent 90%)',
                        filter: 'blur(30px)'
                    }}
                />
                
                {/* Core central glow */}
                <div 
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-48 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse 70% 100% at center top, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.7) 40%, rgba(147, 51, 234, 0.4) 70%, transparent 100%)',
                        filter: 'blur(20px)'
                    }}
                />
            </div>

            {/* Eclipse Dot Pattern Overlay */}
            <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
                <div 
                    className="w-full max-w-5xl h-full opacity-35 pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.9) 1px, transparent 0),
                            radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.7) 1px, transparent 0),
                            radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.6) 1px, transparent 0)
                        `,
                        backgroundSize: '30px 20px, 45px 30px, 60px 40px',
                        backgroundPosition: '0 0, 15px 10px, 30px 20px',
                        maskImage: 'radial-gradient(ellipse 95% 45% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 95% 45% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)'
                    }}
                />
            </div>

            {/* Additional eclipse dot layer with stretched pattern */}
            <div className="absolute inset-0 z-14 flex items-center justify-center pointer-events-none">
                <div 
                    className="w-full max-w-7xl h-full opacity-25 pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.8) 1px, transparent 0),
                            radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.6) 1px, transparent 0)
                        `,
                        backgroundSize: '70px 35px, 100px 50px',
                        backgroundPosition: '35px 17px, 50px 25px',
                        maskImage: 'radial-gradient(ellipse 85% 35% at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 75%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 85% 35% at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 75%, transparent 90%)'
                    }}
                />
            </div>

            {/* Outer eclipse layer for extended spread */}
            <div className="absolute inset-0 z-13 flex items-center justify-center pointer-events-none">
                <div 
                    className="w-full max-w-8xl h-full opacity-15 pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 1px 1px, rgba(147, 197, 253, 0.9) 1px, transparent 0)
                        `,
                        backgroundSize: '120px 60px',
                        backgroundPosition: '60px 30px',
                        maskImage: 'radial-gradient(ellipse 90% 25% at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 85%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 90% 25% at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 85%)'
                    }}
                />
            </div>
            
            {/* Large curved glow effect - positioned at bottom center */}
            <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[1400px] h-[700px] pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 100% 100% at center, 
                        rgba(147, 197, 253, 0.8) 0%,
                        rgba(99, 102, 241, 0.6) 20%,
                        rgba(139, 92, 246, 0.4) 40%,
                        rgba(168, 85, 247, 0.2) 60%,
                        transparent 80%
                    )`,
                    filter: 'blur(20px)'
                }}
            />
            
            {/* Additional bright center */}
            <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 100% 100% at center, 
                        rgba(219, 234, 254, 0.9) 0%,
                        rgba(147, 197, 253, 0.7) 30%,
                        rgba(99, 102, 241, 0.5) 60%,
                        transparent 80%
                    )`,
                    filter: 'blur(10px)'
                }}
            />
            
            {/* Content */}
            <div className="relative z-30 flex flex-col h-full">
                <Appbar />
                
                {/* Main content */}
                <div className="flex-1 flex gap-4 p-4 h-[calc(100vh-80px)]">
                    {/* Chat panel */}
                    <div className="flex-1 flex flex-col bg-white/10 border border-white/20 rounded-xl backdrop-blur-md shadow-lg overflow-hidden h-full"
                         style={{
                             backdropFilter: 'blur(10px)',
                             WebkitBackdropFilter: 'blur(10px)',
                         }}>
                        {/* Chat messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
                            {chat.map((msg, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 backdrop-blur-md">
                                        <div className="text-sm font-medium text-blue-300 mb-2">Prompt:</div>
                                        <div className="text-white">{msg.prompt}</div>
                                    </div>
                                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 backdrop-blur-md">
                                        <div className="text-sm font-medium text-green-300 mb-2">Explanation:</div>
                                        <div className="text-white">{msg.explanation}</div>
                                    </div>
                                </div>
                            ))}
                            {/* Reserved space for dynamic content to prevent layout shifts */}
                            <div className="min-h-[100px]">
                                {isProcessing && (
                                    <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 backdrop-blur-md">
                                        <div className="text-sm font-medium text-yellow-300 mb-2">Status:</div>
                                        <div className="text-white italic">{status}</div>
                                    </div>
                                )}
                                {streamingExplanation && (
                                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 backdrop-blur-md mt-3">
                                        <div className="text-sm font-medium text-green-300 mb-2">Explanation (streaming):</div>
                                        <div className="text-white italic max-h-[200px] overflow-y-auto">{streamingExplanation}</div>
                                    </div>
                                )}
                            </div>
                            <div ref={chatEndRef} />
                        </div>
                        
                        {/* Input form */}
                        <div className="border-t border-white/20 p-4">
                            <form onSubmit={handleSend} className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type a prompt... (Press Enter to send, Shift+Enter for new line)"
                                    className="flex-1 px-4 py-3 text-white placeholder-gray-400 bg-white/10 border border-white/20 rounded-lg backdrop-blur-md resize-none outline-none focus:border-blue-400/50 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                                    style={{
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)',
                                    }}
                                    disabled={isProcessing}
                                />
                                <Button
                                    type="submit"
                                    disabled={isProcessing || !input.trim()}
                                    className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/90 hover:to-purple-600/90 disabled:from-gray-500/50 disabled:to-gray-500/50 border border-white/30 backdrop-blur-md transition-all duration-300 shadow-lg text-white"
                                    style={{
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)',
                                    }}
                                >
                                    {isProcessing ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </form>

                            {/* Connection status */}
                            <div className="flex items-center gap-2 text-xs mt-3">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className={`${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Video panel */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-white/10 border border-white/20 rounded-xl backdrop-blur-md shadow-lg relative h-full"
                         style={{
                             backdropFilter: 'blur(10px)',
                             WebkitBackdropFilter: 'blur(10px)',
                         }}>
                        {loading && (
                            <div className="text-white text-lg">Loading...</div>
                        )}
                        
                        {!isConnected && (
                            <div className="text-orange-300 mb-4">WebSocket disconnected - trying to reconnect...</div>
                        )}
                        
                        {(error || wsError) && (
                            <div className="text-red-300 mb-4">Error: {error || wsError}</div>
                        )}
                        
                        {videoUrl ? (
                            <VideoPlayer src={videoUrl} projectId={projectId as string} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                                    <svg className="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="text-gray-300 text-lg font-medium">No video generated yet</div>
                                <div className="text-gray-400 text-sm text-center max-w-md">
                                    Your animation will appear here once the generation process is complete.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}