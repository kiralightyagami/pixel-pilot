"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL } from "@/config";

export function Sidebar() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const response = await axios.get(`${BACKEND_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
        setProjects(data);
      } catch (err: any) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [getToken]);

  return (
    <div
      className="fixed top-0 left-0 h-full z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ width: open ? 300 : 8, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }}
    >
      
      <div 
        className="absolute left-0 top-0 h-full bg-white/20 hover:bg-white/30 border-r border-white/20 backdrop-blur-md transition-all duration-200 shadow-lg" 
        style={{ 
          width: 8, 
          zIndex: 60,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }} 
      />
      
      {mounted && (
        <div
          className={`h-full bg-white/10 border-r border-white/20 backdrop-blur-md shadow-2xl flex flex-col absolute left-0 top-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ 
            width: 300,
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          }}
        >
          <div className="flex-shrink-0 px-6 py-6 border-b border-white/10">
            <h1 className="text-xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Pixel Pilot
            </h1>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">PROJECTS</div>
                <button className="text-gray-400 hover:text-blue-300 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2">
                {/* Loading state */}
                {loading && (
                  <div className="flex items-center px-4 py-3 text-gray-400 rounded-lg">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-sm">Loading projects...</span>
                  </div>
                )}
                
                {/* Error state */}
                {error && (
                  <div className="flex items-center px-4 py-3 text-red-300 bg-red-500/10 rounded-lg border border-red-400/20">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                {/* Empty state */}
                {!loading && !error && projects.length === 0 && (
                  <div className="flex items-center px-4 py-3 text-gray-400 rounded-lg">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">No projects yet</span>
                  </div>
                )}
                
                {/* Project list with old hover effects */}
                {!loading && !error && projects.map((project, idx) => (
                  <Link 
                    key={project.id || idx}
                    href={`/project/${project.id}`} 
                    className="flex items-center px-4 py-3 text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 rounded-lg transition-all duration-300 group border-l-2 border-transparent hover:border-l-blue-400"
                  >
                    <svg className="w-5 h-5 mr-3 text-gray-300 group-hover:text-blue-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium group-hover:text-blue-200 truncate flex-1 transition-colors duration-300">
                      {project.description || `Project ${idx + 1}`}
                    </span>
                    <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          backdrop-filter: blur(10px);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.6) 0%, rgba(147, 51, 234, 0.6) 50%, rgba(59, 130, 246, 0.6) 100%);
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 50%, rgba(59, 130, 246, 0.8) 100%);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }
        
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </div>
  );
}