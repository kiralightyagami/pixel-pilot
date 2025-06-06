"use client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send} from "lucide-react";

export function Prompt() {
    return (
        <div className="flex flex-col gap-2">
          <Textarea placeholder="Enter your prompt here" className="w-full h-20"/>
          <div className="flex justify-end pt-2">
            <Button>
                <Send />
            </Button>
          </div>
        </div>
    )
}