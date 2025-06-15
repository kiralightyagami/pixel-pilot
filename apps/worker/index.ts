import cors from "cors";
import express from "express";
import {prismaClient} from "db";
import  { GoogleGenAI } from "@google/genai";
import { SystemPrompt } from "./systemPrompt";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/prompt", async (req, res) => {
    const {prompt,projectId} = req.body;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey:GEMINI_API_KEY });

    await prismaClient.prompt.create({
        data:{
            content:prompt,
            projectId,
            type:"USER"
        }
    })

    const allPrompts = await prismaClient.prompt.findMany({
        where:{
            projectId,
        },
        orderBy:{
            createdAt:"asc"
        }
    })

    const response = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        config:{
            maxOutputTokens: 8000,
            systemInstruction: SystemPrompt
        
        },
        contents: [
            allPrompts.map((p:any) => ({
                role: p.type === "USER" ? "user" : "assistant",
                parts: [{ text: p.content }]
            }))
        ]
    }).on("data",(chunk:any)=>{
        console.log(chunk.text);
    }).on("text", async (text:any)=>{
        await prismaClient.prompt.create({
            data:{
                content:text,
                projectId,
                type:"AI"
            }
        })
    })

    for await (const chunk of response) {
        console.log(chunk.text);
    }

    res.json({ response });
    
    

   
})

app.listen(8080, () => {
    console.log("Worker is running on port 3000");
});





