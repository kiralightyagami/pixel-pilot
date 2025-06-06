"use client";
import { Button } from "./ui/button";


export function Appbar() {  
  return (
    <div className="flex justify-between items-center p-4 bg-zinc-900 w-full">
      <h1 className="text-2xl font-bold text-white">Pixel Pilot</h1>
      <Button variant="outline">Signin</Button>
    </div>
  );
}