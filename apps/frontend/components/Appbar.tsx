"use client";
import { Auth } from "./Auth";
import Link from "next/link";

export function Appbar() {  
  return (
    <div className="bg-black/90 backdrop-blur-sm rounded-2xl border border-gray-800/50 shadow-2xl shadow-black/50">
      <div className="flex justify-between items-center px-6 py-3">
        {/* Enhanced Pixel Pilot branding */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className="text-xl font-bold text-white hover:text-blue-200 transition-colors duration-200 cursor-pointer select-none"
          >
            Pixel Pilot
          </Link>
        </div>
        
        {/* Authentication section */}
        <Auth />
      </div>
    </div>
  );
}