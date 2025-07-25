import cors from "cors";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "db/client";
import  { GoogleGenAI } from "@google/genai";
import { SystemPrompt } from "./systemPrompt";
import { Parser } from "./parser";
import { createAnimation } from "./os";
require("dotenv").config();

export const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), websocket: 'enabled' });
});


wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    
    
    ws.send(JSON.stringify({
        type: 'status',
        message: 'Connected to worker server'
    }));
    
    ws.on('message', async (message: string) => {
        console.log('Received WebSocket message:', message.toString());
        try {
            const data = JSON.parse(message.toString());
            console.log('Parsed message data:', data);
            
            if (data.type === 'prompt') {
                console.log('Processing prompt via WebSocket:', data.prompt);
                await handlePromptWebSocket(ws, data.prompt, data.projectId);
            } else {
                console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Invalid message format: ' + (error instanceof Error ? error.message : String(error))
            }));
        }
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error on server:', error);
    });
    
    ws.on('close', (code, reason) => {
        console.log('WebSocket connection closed:', code, reason.toString());
    });
});


async function handlePromptWebSocket(ws: WebSocket, prompt: string, projectId: string) {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        
        ws.send(JSON.stringify({ 
            type: 'status', 
            message: 'Processing prompt...' 
        }));

        await prisma.prompt.create({
            data: {
                content: prompt,
                projectId,
                type: "USER"
            }
        });

        const allPrompts = await prisma.prompt.findMany({
            where: { projectId },
            orderBy: { createdAt: "asc" }
        });

        
        ws.send(JSON.stringify({ 
            type: 'status', 
            message: 'Generating response...' 
        }));

        const response = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            config: {
                maxOutputTokens: 8000,
                systemInstruction: SystemPrompt
            },
            contents: allPrompts.map((p: any) => ({
                role: p.type === "USER" ? "user" : "assistant",
                parts: [{ text: p.content }]
            }))
        });

        let fullResponse = "";
        let streamedExplanation = "";
        
        
        for await (const chunk of response) {
            const text = chunk.text;
            fullResponse += text;
            
            
            const parser = new Parser(fullResponse);
            const currentExplanation = parser.getExplanation();
            
            if (currentExplanation && currentExplanation !== streamedExplanation) {
                streamedExplanation = currentExplanation;
                ws.send(JSON.stringify({ 
                    type: 'explanation_chunk', 
                    content: currentExplanation
                }));
            }
        }

        
        const parser = new Parser(fullResponse);
        let code = parser.getCode();
        let explanation = parser.getExplanation();

        
        code = code
            .replace(/\\n/g, '\n')
            .replace(/\n\s*\n/g, '\n')
            .replace(/```typescript\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/<code>\n?/g, '')
            .replace(/<\/code>\n?/g, '')
            .replace(/Here's the code to create.*?Motion Canvas\.\n?/g, '')
            .replace(/The code defines.*?`x` position\.\n?/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        explanation = explanation
            .replace(/\\n/g, '\n')
            .replace(/\n\s*\n/g, '\n')
            .replace(/\*\*Explanation:\*\*\n?/g, '')
            .replace(/<explanation>\n?/g, '')
            .replace(/<\/explanation>\n?/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        
        const lastPromptId = allPrompts[allPrompts.length - 1]?.id;
        if (lastPromptId) {
            await prisma.animation.create({
                data: {
                    code,
                    explanation,
                    projectId,
                    promptId: lastPromptId
                }
            });
        }

        
        ws.send(JSON.stringify({ 
            type: 'explanation_final', 
            content: explanation
        }));

        
        ws.send(JSON.stringify({ 
            type: 'status', 
            message: 'Generating video...' 
        }));

        
        const lastPrompt = allPrompts[allPrompts.length - 1];
        if (lastPrompt) {
            const animationResult = await createAnimation(projectId, lastPrompt.id);
            
            ws.send(JSON.stringify({ 
                type: 'video_ready', 
                videoUrl: animationResult.videoUrl,
                code,
                explanation
            }));
        }

        ws.send(JSON.stringify({ 
            type: 'complete',
            message: 'Animation generation complete!'
        }));

    } catch (error) {
        console.error('WebSocket prompt error:', error);
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Failed to process prompt' 
        }));
    }
}

app.post("/prompt", async (req, res) => {
    const {prompt,projectId} = req.body;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey:GEMINI_API_KEY });

    await prisma.prompt.create({
        data:{
            content:prompt,
            projectId,
            type:"USER"
        }
    })

    const allPrompts = await prisma.prompt.findMany({
        where:{
            projectId,
        },
        orderBy:{
            createdAt:"asc"
        }
    })

    let text = "";

    const response = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        config:{
            maxOutputTokens: 8000,
            systemInstruction: SystemPrompt
        
        },
        contents: allPrompts.map((p:any) => ({
            role: p.type === "USER" ? "user" : "assistant",
            parts: [{ text: p.content }]
        }))
        // contents: [
        //     {
        //         role: "user",
        //         parts: [{ text: "create a simple animation of a circle that moves from the left to the right" }]
        //     }
        // ]
    })

    let fullResponse = "";
    let code = "";
    let explanation = "";
    let fullText = "";
    
    for await (const chunk of response) {
        const text = chunk.text;
        fullResponse += text;
        
        console.log("\n=== New Chunk Received ===");
        console.log("Raw chunk:", text);
        console.log("===================");
    }

    
    const parser = new Parser(fullResponse);
    code = parser.getCode();
    explanation = parser.getExplanation();
    fullText = parser.getText();

    
    code = code
        .replace(/\\n/g, '\n')
        .replace(/\n\s*\n/g, '\n')
        .replace(/```typescript\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/<code>\n?/g, '')
        .replace(/<\/code>\n?/g, '')
        .replace(/Here's the code to create.*?Motion Canvas\.\n?/g, '')
        .replace(/The code defines.*?`x` position\.\n?/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    
    explanation = explanation
        .replace(/\\n/g, '\n')
        .replace(/\n\s*\n/g, '\n')
        .replace(/\*\*Explanation:\*\*\n?/g, '')
        .replace(/<explanation>\n?/g, '')
        .replace(/<\/explanation>\n?/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    console.log("\n=== Final Results ===");
    console.log("Full Response:", fullResponse);
    console.log("Code:", code);
    console.log("Explanation:", explanation);
    console.log("===================");

    const lastPromptId = allPrompts[allPrompts.length - 1]?.id;
    if (lastPromptId) {
        await prisma.animation.create({
            data: {
                code,
                explanation,
                projectId,
                promptId: lastPromptId
            }
        });
    }

    
    const lastPrompt = allPrompts[allPrompts.length - 1];
    if (lastPrompt) {
        const animationResult = await createAnimation(projectId, lastPrompt.id);
        res.json({ 
            fullResponse, 
            code, 
            explanation, 
            fullText,
            videoUrl: animationResult.videoUrl
        });
    } else {
        res.json({ 
            fullResponse, 
            code, 
            explanation, 
            fullText
        });
    }
    
    

   
})

server.listen(8080, () => {
    console.log("Worker is running on port 8080 with WebSocket support");
    console.log("WebSocket server is ready to accept connections");
});





