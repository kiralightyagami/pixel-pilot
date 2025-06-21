"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser
} from '@clerk/nextjs'

export function Auth() {
  const { isSignedIn, user } = useUser();

  console.log("Auth component render - isSignedIn:", isSignedIn, "user:", user);

  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <div className="flex items-center gap-2">
          {/* Beautiful Sign In Button */}
          <SignInButton mode="modal">
            <button 
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-md backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              Sign In
            </button>
          </SignInButton>
          
          {/* Beautiful Sign Up Button */}
          <SignUpButton mode="modal">
            <button 
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/90 hover:to-purple-600/90 border border-white/20 rounded-md backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Hello, {user?.firstName || 'User'}</span>
          <div 
            className="p-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md shadow-lg hover:bg-white/15 transition-all duration-300"
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
        </div>
      </SignedIn>
    </div>
  );
} 