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
            className="h-screen relative overflow-hidden flex flex-col bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
            {/* Pitch Black Background */}
            <motion.div 
                className="absolute inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            />

            {/* Animated Star Field */}
            <motion.div 
                className="absolute inset-0 z-10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
            >
                {Array.from({ length: 100 }, (_, i) => {
                    const star = {
                        id: i,
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                        size: Math.random() * 2 + 1,
                        opacity: Math.random() * 0.8 + 0.2,
                        animationDelay: Math.random() * 5,
                        animationDuration: Math.random() * 8 + 4
                    };
                    return (
                        <motion.div
                            key={star.id}
                            className="absolute rounded-full bg-white"
                            style={{
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                opacity: star.opacity,
                                boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.5})`
                            }}
                            animate={{
                                opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: star.animationDuration,
                                delay: star.animationDelay,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    );
                })}
            </motion.div>
            
            {/* Content */}
            <motion.div 
                className="relative z-30 flex flex-col h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
                <motion.div
                    className="flex justify-center px-6 pt-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="w-full max-w-4xl">
                        <Appbar />
                    </div>
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
                        className="flex-1 flex flex-col bg-black/90 border border-gray-800/50 rounded-xl backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden h-full"
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
                                            className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm"
                                            whileHover={{ scale: 1.01, borderColor: "rgba(59, 130, 246, 0.5)" }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="text-sm font-medium text-blue-300 mb-2">Prompt:</div>
                                            <div className="text-white">{msg.prompt}</div>
                                        </motion.div>
                                        <motion.div 
                                            className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm"
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
                                            className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm"
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
                                            className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm mt-3"
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
                            className="border-t border-gray-800/40 p-4"
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
                                    className="flex-1 px-4 py-3 text-white placeholder-gray-500 bg-black/80 border border-gray-800/50 rounded-lg backdrop-blur-sm resize-none outline-none focus:border-blue-500/50 focus:bg-black/90 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
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
                                        className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500/90 hover:to-purple-500/90 disabled:from-gray-600/50 disabled:to-gray-600/50 border border-gray-700/50 backdrop-blur-sm transition-all duration-300 shadow-lg text-white"
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
                                className="flex items-center gap-2 text-xs mt-3 px-3 py-2 rounded-xl bg-black/80 backdrop-blur-sm border border-gray-800/40"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 1.4 }}
                            >
                                <div className={`w-2 h-2 rounded-full ${
                                    isConnected 
                                        ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' 
                                        : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                                }`}></div>
                                <span className={`${isConnected ? 'text-green-300' : 'text-red-300'} font-medium`}>
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                    
                    {/* Video panel */}
                    <motion.div 
                        className="w-1/2 bg-black/90 border border-gray-800/50 rounded-xl backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden h-full"
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1.1, ease: [0.23, 1, 0.32, 1], type: "spring", stiffness: 120, damping: 20 }}
                    >
                        <div className="p-4 h-full flex flex-col">
                            <motion.h2 
                                className="text-xl font-semibold text-gray-200 mb-4"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 1.3 }}
                            >
                                Generated Video
                            </motion.h2>
                            
                            <motion.div 
                                className="flex-1 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 1.4 }}
                            >
                                {loading ? (
                                    <motion.div 
                                        className="text-center text-gray-400"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        Loading project...
                                    </motion.div>
                                ) : error ? (
                                    <motion.div 
                                        className="text-center text-red-300 bg-red-900/20 rounded-lg p-6 border border-red-800/30"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        Error: {error}
                                    </motion.div>
                                ) : videoUrl ? (
                                    <motion.div 
                                        className="w-full h-full"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <VideoPlayer src={videoUrl} projectId={projectId as string} />
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        className="text-center text-gray-400"
                                        animate={{ opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        No video generated yet.
                                        <br />
                                        <span className="text-sm text-gray-500">Send a prompt to generate your animation!</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}