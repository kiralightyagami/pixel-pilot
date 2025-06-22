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
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectPage() {
    const { projectId } = useParams();
    const { getToken } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chat, setChat] = useState<{ prompt: string; explanation: string }[]>([]);
    const [input, setInput] = useState("");
    const [isVisible, setIsVisible] = useState(false);
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

    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div 
            className="h-screen relative overflow-hidden flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
            {/* Same beautiful background as home page */}
            <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#2a2a4a] pointer-events-none"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            />
            
            <motion.div 
                className="absolute top-0 left-0 right-0 h-96 z-20 pointer-events-none"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
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
            </motion.div>

            {/* Eclipse Dot Pattern Overlay */}
            <motion.div 
                className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
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
            </motion.div>

            {/* Additional eclipse dot layer with stretched pattern */}
            <motion.div 
                className="absolute inset-0 z-14 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
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
            </motion.div>

            {/* Outer eclipse layer for extended spread */}
            <motion.div 
                className="absolute inset-0 z-13 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
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
            </motion.div>
            
            {/* Large curved glow effect - positioned at bottom center */}
            <motion.div 
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
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            />
            
            {/* Additional bright center */}
            <motion.div 
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
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
            />
            
            {/* Content */}
            <motion.div 
                className="relative z-30 flex flex-col h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7, ease: [0.23, 1, 0.32, 1] }}
                >
                    <Appbar />
                </motion.div>
                
                {/* Main content */}
                <motion.div 
                    className="flex-1 flex gap-4 p-4 h-[calc(100vh-80px)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                >
                    {/* Chat panel */}
                    <motion.div 
                        className="flex-1 flex flex-col bg-white/10 border border-white/20 rounded-xl backdrop-blur-md shadow-lg overflow-hidden h-full"
                        style={{
                             backdropFilter: 'blur(10px)',
                             WebkitBackdropFilter: 'blur(10px)',
                        }}
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1.0, ease: [0.23, 1, 0.32, 1], type: "spring", stiffness: 120, damping: 20 }}
                    >
                        {/* Chat messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {chat.map((msg, i) => (
                                    <motion.div 
                                        key={`chat-${i}-${msg.prompt.slice(0, 20)}`}
                                        className="space-y-3"
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                                        layout
                                    >
                                        <motion.div 
                                            className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 backdrop-blur-md"
                                            whileHover={{ scale: 1.01, borderColor: "rgba(59, 130, 246, 0.5)" }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="text-sm font-medium text-blue-300 mb-2">Prompt:</div>
                                            <div className="text-white">{msg.prompt}</div>
                                        </motion.div>
                                        <motion.div 
                                            className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 backdrop-blur-md"
                                            whileHover={{ scale: 1.01, borderColor: "rgba(34, 197, 94, 0.5)" }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="text-sm font-medium text-green-300 mb-2">Explanation:</div>
                                            <div className="text-white">{msg.explanation}</div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {/* Reserved space for dynamic content to prevent layout shifts */}
                            <div className="min-h-[100px]">
                                <AnimatePresence>
                                    {isProcessing && (
                                        <motion.div 
                                            key="processing-status"
                                            className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 backdrop-blur-md"
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="text-sm font-medium text-yellow-300 mb-2">Status:</div>
                                            <div className="text-white italic">{status}</div>
                                        </motion.div>
                                    )}
                                    {streamingExplanation && (
                                        <motion.div 
                                            key="streaming-explanation"
                                            className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 backdrop-blur-md mt-3"
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="text-sm font-medium text-green-300 mb-2">Explanation (streaming):</div>
                                            <div className="text-white italic max-h-[200px] overflow-y-auto">{streamingExplanation}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div ref={chatEndRef} />
                        </div>
                        
                        {/* Input form */}
                        <motion.div 
                            className="border-t border-white/20 p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 1.2, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <form onSubmit={handleSend} className="flex gap-3">
                                <motion.input
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
                                    whileFocus={{ scale: 1.01 }}
                                    transition={{ duration: 0.2 }}
                                />
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
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
                                </motion.div>
                            </form>

                            {/* Connection status */}
                            <motion.div 
                                className="flex items-center gap-2 text-xs mt-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 1.4 }}
                            >
                                <motion.div 
                                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
                                    animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                                />
                                <span className={`${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                    
                    {/* Video panel */}
                    <motion.div 
                        className="flex-1 flex flex-col items-center justify-center bg-white/10 border border-white/20 rounded-xl backdrop-blur-md shadow-lg relative h-full"
                        style={{
                             backdropFilter: 'blur(10px)',
                             WebkitBackdropFilter: 'blur(10px)',
                        }}
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1.1, ease: [0.23, 1, 0.32, 1], type: "spring", stiffness: 120, damping: 20 }}
                    >
                        <AnimatePresence mode="wait">
                            {loading && (
                                <motion.div 
                                    key="loading"
                                    className="text-white text-lg"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    Loading...
                                </motion.div>
                            )}
                            
                            {!isConnected && (
                                <motion.div 
                                    key="disconnected"
                                    className="text-orange-300 mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    WebSocket disconnected - trying to reconnect...
                                </motion.div>
                            )}
                            
                            {(error || wsError) && (
                                <motion.div 
                                    key="error"
                                    className="text-red-300 mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    Error: {error || wsError}
                                </motion.div>
                            )}
                            
                            {videoUrl ? (
                                <motion.div
                                    key="video-player"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                    className="w-full h-full"
                                >
                                    <VideoPlayer src={videoUrl} projectId={projectId as string} />
                                </motion.div>
                            ) : (
                                <motion.div 
                                    className="flex flex-col items-center justify-center h-full space-y-4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                    key="no-video"
                                >
                                    <motion.div 
                                        className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border border-white/20"
                                        whileHover={{ scale: 1.05, borderColor: "rgba(255, 255, 255, 0.3)" }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <svg className="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </motion.div>
                                    <motion.div 
                                        className="text-gray-300 text-lg font-medium"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                    >
                                        No video generated yet
                                    </motion.div>
                                    <motion.div 
                                        className="text-gray-400 text-sm text-center max-w-md"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    >
                                        Your animation will appear here once the generation process is complete.
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}