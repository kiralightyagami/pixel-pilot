import cors from "cors";
import express from "express";
import { prisma } from "db/client";
import  { GoogleGenAI } from "@google/genai";
import { SystemPrompt } from "./systemPrompt";
import { Parser } from "./parser";
import { createAnimation } from "./os";
require("dotenv").config();

export const app = express();
app.use(cors());
app.use(express.json());

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

    await prisma.animation.create({
        data: {
            code,
            explanation,
            projectId,
        }
    })

    
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

app.listen(8080, () => {
    console.log("Worker is running on port 8080");
});





