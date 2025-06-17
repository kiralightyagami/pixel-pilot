"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BACKEND_URL, WORKER_URL } from "@/config";

export default function ProjectPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chat, setChat] = useState<{ prompt: string; explanation: string }[]>([]);
    const [input, setInput] = useState("");
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [streaming, setStreaming] = useState(false);
    const [currentExplanation, setCurrentExplanation] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/projects/${projectId}`).then((res) => {
            setProject(res.data);
            setLoading(false);
        }).catch((err) => {
            setError(err.message);
            setLoading(false);
        });
    }, [projectId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat, streaming]);

    const sendPrompt = async (prompt: string) => {
        setStreaming(true);
        setCurrentExplanation("");
        setVideoUrl(null);
        try {
            const response = await axios.post(`${WORKER_URL}/prompt`, {
                prompt,
                projectId
            }, {
                responseType: 'stream'
            });

            if (response.headers['content-type']?.includes("text/event-stream")) {
                let explanation = "";
                for await (const chunk of response.data) {
                    const text = new TextDecoder().decode(chunk);
                    explanation += text;
                    setCurrentExplanation(explanation);
                }

                try {
                    const lastLine = explanation.trim().split("\n").pop();
                    const data = JSON.parse(lastLine || '{}');
                    setVideoUrl(data.videoUrl || null);

                    const lastJsonIndex = explanation.lastIndexOf('{');
                    const explanationText = lastJsonIndex !== -1 ? explanation.slice(0, lastJsonIndex).trim() : explanation;
                    setChat((prev) => [...prev, { prompt, explanation: explanationText }]);
                } catch {
                    setChat((prev) => [...prev, { prompt, explanation }]);
                }
            } else {
                const data = response.data;
                setVideoUrl(data.videoUrl || null);
                setCurrentExplanation(data.explanation || "");
                setChat((prev) => [...prev, { prompt, explanation: data.explanation || "" }]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch explanation");
        } finally {
            setStreaming(false);
        }
    };

    useEffect(() => {
        if (project && project.description) {
            sendPrompt(project.description);
        }
    }, [project]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendPrompt(input.trim());
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
                    {streaming && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontWeight: 600, color: "#333" }}>Explanation (streaming):</div>
                            <div style={{ background: "#e8f5e9", padding: 12, borderRadius: 6, fontStyle: "italic" }}>{currentExplanation}</div>
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
                        disabled={streaming}
                    />
                    <button type="submit" style={{ marginLeft: 12, padding: "10px 20px", borderRadius: 6, border: "none", background: "#1976d2", color: "#fff", fontWeight: 600, fontSize: 16, cursor: streaming ? "not-allowed" : "pointer" }} disabled={streaming}>Send</button>
                </form>
            </div>
            
            <div style={{ flex: 1.2, position: "relative", background: "#f7f9fa", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                {loading && <div>Loading...</div>}
                {error && <div style={{ color: "red" }}>Error: {error}</div>}
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