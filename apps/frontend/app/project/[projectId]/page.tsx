"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL, WORKER_URL } from "@/config";
import { useWebSocketSimple as useWebSocket } from "@/lib/useWebSocketSimple";

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
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat, isProcessing, streamingExplanation]);

    
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
                                 chat.length === 0; // No previous chat history
        
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

    return (
        <div style={{ display: "flex", height: "80vh", border: "1px solid #eee", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px #0001", margin: 24 }}>
                
                <div style={{ flex: 1, background: "#fafbfc", display: "flex", flexDirection: "column", borderRight: "1px solid #eee" }}>
                <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                    {chat.map((msg, i) => (
                        <div key={i} style={{ marginBottom: 24 }}>
                            <div style={{ fontWeight: 600, color: "#333" }}>Prompt:</div>
                            <div style={{ background: "#f0f4f8", padding: 12, borderRadius: 6, marginBottom: 6 }}>{msg.prompt}</div>
                            <div style={{ fontWeight: 600, color: "#333" }}>Explanation:</div>
                            <div style={{ background: "#e8f5e9", padding: 12, borderRadius: 6 }}>{msg.explanation}</div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontWeight: 600, color: "#333" }}>Status:</div>
                            <div style={{ background: "#fff3cd", padding: 12, borderRadius: 6, fontStyle: "italic" }}>{status}</div>
                        </div>
                    )}
                    {streamingExplanation && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontWeight: 600, color: "#333" }}>Explanation (streaming):</div>
                            <div style={{ background: "#e8f5e9", padding: 12, borderRadius: 6, fontStyle: "italic" }}>{streamingExplanation}</div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSend} style={{ display: "flex", borderTop: "1px solid #eee", padding: 16, background: "#fff" }}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a prompt..."
                        style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }}
                        disabled={isProcessing}
                    />
                    <button type="submit" style={{ marginLeft: 12, padding: "10px 20px", borderRadius: 6, border: "none", background: "#1976d2", color: "#fff", fontWeight: 600, fontSize: 16, cursor: isProcessing ? "not-allowed" : "pointer" }} disabled={isProcessing}>Send</button>
                </form>
            </div>
            
            <div style={{ flex: 1.2, position: "relative", background: "#f7f9fa", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                {loading && <div>Loading...</div>}
                {!isConnected && <div style={{ color: "orange", marginBottom: 10 }}>WebSocket disconnected - trying to reconnect...</div>}
                {(error || wsError) && <div style={{ color: "red" }}>Error: {error || wsError}</div>}
                {videoUrl ? (
                    <>
                        <video src={videoUrl} controls style={{ width: "90%", maxHeight: 400, borderRadius: 12, boxShadow: "0 2px 8px #0002" }} />
                        <a
                            href={videoUrl}
                            download={`project_${projectId}_video.mp4`}
                            style={{
                                position: "absolute",
                                right: 32,
                                bottom: 32,
                                background: "#1976d2",
                                color: "#fff",
                                padding: "12px 24px",
                                borderRadius: 8,
                                textDecoration: "none",
                                fontWeight: 600,
                                boxShadow: "0 2px 8px #0002",
                                fontSize: 16,
                            }}
                        >
                            Download Video
                        </a>
                    </>
                ) : (
                    <div style={{ color: "#888", fontSize: 18 }}>No video yet.</div>
                )}
            </div>
        </div>
    );
}