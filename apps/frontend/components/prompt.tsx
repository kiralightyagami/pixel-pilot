"use client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ChevronRightIcon } from "lucide-react";

export function Prompt() {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full p-4 gap-4">
            <div className="flex flex-col items-center justify-center w-full p-4">
                <h1 className="text-2xl font-bold p-4">Generate text to video with Pixel Pilot</h1>
                <Textarea placeholder="Enter your prompt here" className="w-full max-w-md h-20"/>
                <div className="flex justify-end w-full max-w-md p-2 pr-0">
                    <Button variant="secondary" size="icon"><ChevronRightIcon /></Button>
                </div>
            </div>
            
        </div>
    )
}