"use client";
import { Button } from "./ui/button";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export function Appbar() {  
  return (
    <div className="flex justify-between items-center px-6 py-4 pt-3 border-b border-white/10 shadow-lg">
      {/* Enhanced Pixel Pilot branding */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          Pixel Pilot
        </h1>
      </div>
      
      {/* Authentication section */}
      <div className="flex items-center gap-4">
        <SignedOut>
          {/* Enhanced Sign In button with glassmorphism */}
          <div className="relative">
            <SignInButton>
              <button 
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg backdrop-blur-md transition-all duration-300 shadow-lg text-white font-medium"
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          {/* Enhanced UserButton container */}
          <div 
            className="p-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md shadow-lg"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </div>
        </SignedIn>
      </div>
    </div>
  );
}