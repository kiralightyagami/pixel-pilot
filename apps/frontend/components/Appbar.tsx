"use client";
import { Auth } from "./Auth";
import Link from "next/link";

export function Appbar() {  
  return (
    <div className="flex justify-between items-center px-6 py-4 pt-3 border-b border-white/10">
      {/* Enhanced Pixel Pilot branding */}
      <div className="flex items-center">
        <Link 
          href="/" 
          className="text-2xl font-bold text-white hover:text-blue-200 transition-colors duration-200 cursor-pointer select-none"
        >
          Pixel Pilot
        </Link>
      </div>
      
      {/* Authentication section */}
      <Auth />
    </div>
  );
}