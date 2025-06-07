"use client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send} from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL } from "@/config";

export function Prompt() {
  const [prompt, setPrompt] = useState("");
  const { getToken } = useAuth();
    return (
        <div className="flex flex-col gap-2">
          <Textarea placeholder="Enter your prompt here" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-20"/>
          <div className="flex justify-end pt-2">
            <Button onClick={async () => {
              const token = await getToken();
              const response = await axios.post(`${BACKEND_URL}/project`, {
                prompt: prompt
              },{
                headers: {
                  "Authorization": `Bearer ${token}`
                } 
              })
              console.log(response)
            }}>
                <Send />
            </Button>
          </div>
        </div>
    )
}