"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

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
    <motion.div
      className="fixed top-0 left-0 h-full z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      animate={{ width: open ? 300 : 8 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.23, 1, 0.32, 1],
        type: "tween"
      }}
    >
      
      {/* Enhanced hover trigger bar */}
      <motion.div 
        className="absolute left-0 top-0 h-full bg-white/20 border-r border-white/20 backdrop-blur-md shadow-lg" 
        style={{ 
          width: 8, 
          zIndex: 60,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        whileHover={{ 
          backgroundColor: "rgba(255, 255, 255, 0.35)",
          scale: 1.2,
          x: 2
        }}
        animate={{
          boxShadow: open 
            ? "0 0 20px rgba(59, 130, 246, 0.3)" 
            : "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}
        transition={{ duration: 0.3 }}
        layoutId="sidebar-trigger"
      />
      
      <AnimatePresence mode="wait">
        {mounted && (
          <motion.div
            className="h-full bg-white/10 border-r border-white/20 backdrop-blur-md shadow-2xl flex flex-col absolute left-0 top-0 z-50 overflow-hidden"
            style={{ 
              width: 300,
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
            }}
            initial={{ 
              x: -300, 
              opacity: 0,
              scale: 0.95
            }}
            animate={{ 
              x: open ? 0 : -300, 
              opacity: open ? 1 : 0,
              scale: open ? 1 : 0.95
            }}
            exit={{ 
              x: -300, 
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.3, ease: [0.4, 0, 1, 1] }
            }}
            transition={{ 
              duration: open ? 0.5 : 0.4, 
              ease: open ? [0.23, 1, 0.32, 1] : [0.4, 0, 1, 1],
              type: "tween"
            }}
            layoutId="sidebar-main"
          >
            {/* Enhanced Header with entrance animation */}
            <motion.div 
              className="flex-shrink-0 px-6 py-6 border-b border-white/10"
              initial={{ y: -30, opacity: 0 }}
              animate={{ 
                y: open ? 0 : -30, 
                opacity: open ? 1 : 0 
              }}
              transition={{ 
                delay: open ? 0.2 : 0, 
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1]
              }}
            >
              <motion.h1 
                className="text-xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
                whileHover={{ 
                  scale: 1.05,
                  textShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
                }}
                transition={{ duration: 0.2 }}
              >
                Pixel Pilot
              </motion.h1>
            </motion.div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              
              <motion.div 
                className="px-6 py-6"
                initial={{ y: 30, opacity: 0 }}
                animate={{ 
                  y: open ? 0 : 30, 
                  opacity: open ? 1 : 0 
                }}
                transition={{ 
                  delay: open ? 0.3 : 0, 
                  duration: 0.4,
                  ease: [0.23, 1, 0.32, 1]
                }}
              >
                <motion.div 
                  className="flex items-center justify-between mb-6"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ 
                    x: open ? 0 : -30, 
                    opacity: open ? 1 : 0 
                  }}
                  transition={{ 
                    delay: open ? 0.35 : 0, 
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                >
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">PROJECTS</div>
                  <motion.button 
                    className="text-gray-400 hover:text-blue-300 transition-colors duration-200"
                    whileHover={{ 
                      scale: 1.3, 
                      rotate: 90,
                      color: "rgb(147 197 253)"
                    }}
                    whileTap={{ scale: 0.8 }}
                    transition={{ 
                      duration: 0.2,
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ 
                    y: open ? 0 : 30, 
                    opacity: open ? 1 : 0 
                  }}
                  transition={{ 
                    delay: open ? 0.4 : 0, 
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                >
                  {/* Enhanced Loading state */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div 
                        className="flex items-center px-4 py-3 text-gray-400 rounded-lg"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ 
                          opacity: 0, 
                          y: -20, 
                          scale: 0.9,
                          transition: { duration: 0.2 }
                        }}
                        transition={{ 
                          duration: 0.4,
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                      >
                        <motion.div 
                          className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full mr-3"
                          animate={{ rotate: 360 }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity, 
                            ease: "linear" 
                          }}
                        />
                        <span className="text-sm">Loading projects...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Enhanced Error state */}
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        className="flex items-center px-4 py-3 text-red-300 bg-red-500/10 rounded-lg border border-red-400/20"
                        initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ 
                          opacity: 0, 
                          scale: 0.8, 
                          rotateX: 90,
                          transition: { duration: 0.3 }
                        }}
                        transition={{ 
                          duration: 0.4,
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                      >
                        <motion.svg 
                          className="w-5 h-5 mr-3" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          animate={{ rotate: [0, -10, 10, 0] }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </motion.svg>
                        <span className="text-sm">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Enhanced Empty state */}
                  <AnimatePresence>
                    {!loading && !error && projects.length === 0 && (
                      <motion.div 
                        className="flex items-center px-4 py-3 text-gray-400 rounded-lg"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ 
                          opacity: 0, 
                          y: -20, 
                          scale: 0.9,
                          transition: { duration: 0.2 }
                        }}
                        transition={{ 
                          duration: 0.4,
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                      >
                        <motion.svg 
                          className="w-5 h-5 mr-3" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </motion.svg>
                        <span className="text-sm">No projects yet</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Enhanced animated project list */}
                  <AnimatePresence>
                    {!loading && !error && projects.map((project, idx) => (
                      <motion.div
                        key={project.id || idx}
                        initial={{ 
                          opacity: 0, 
                          x: -40, 
                          scale: 0.9,
                          rotateY: -15
                        }}
                        animate={{ 
                          opacity: 1, 
                          x: 0, 
                          scale: 1,
                          rotateY: 0
                        }}
                        exit={{ 
                          opacity: 0, 
                          x: -40, 
                          scale: 0.9,
                          rotateY: 15,
                          transition: { 
                            duration: 0.2,
                            delay: (projects.length - 1 - idx) * 0.05
                          }
                        }}
                        transition={{ 
                          duration: 0.4, 
                          delay: open ? (idx * 0.08) + 0.5 : 0,
                          ease: [0.23, 1, 0.32, 1],
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                        layoutId={`project-${project.id || idx}`}
                        className="relative"
                        onHoverStart={() => setHoveredProject(project.id || idx.toString())}
                        onHoverEnd={() => setHoveredProject(null)}
                      >
                        {/* Enhanced animated background for hover */}
                        <AnimatePresence>
                          {hoveredProject === (project.id || idx.toString()) && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg"
                              layoutId="project-hover-bg"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ 
                                duration: 0.2,
                                type: "spring",
                                stiffness: 400,
                                damping: 25
                              }}
                            />
                          )}
                        </AnimatePresence>

                        {/* Enhanced animated border */}
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400 rounded-full"
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ 
                            scaleY: hoveredProject === (project.id || idx.toString()) ? 1 : 0,
                            opacity: hoveredProject === (project.id || idx.toString()) ? 1 : 0
                          }}
                          transition={{ 
                            duration: 0.3, 
                            ease: "easeOut",
                            type: "spring",
                            stiffness: 400,
                            damping: 30
                          }}
                          style={{ originY: 0.5 }}
                        />
                        
                        <Link 
                          href={`/project/${project.id}`} 
                          className="relative z-10 flex items-center px-4 py-3 text-white rounded-lg transition-all duration-300 group"
                        >
                          <motion.svg 
                            className="w-5 h-5 mr-3 text-gray-300 group-hover:text-blue-300 transition-colors duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            whileHover={{ 
                              scale: 1.2, 
                              rotate: 10,
                              color: "rgb(147 197 253)"
                            }}
                            transition={{ 
                              duration: 0.2,
                              type: "spring",
                              stiffness: 400,
                              damping: 17
                            }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </motion.svg>
                          <motion.span 
                            className="text-sm font-medium group-hover:text-blue-200 truncate flex-1 transition-colors duration-300"
                            animate={{ 
                              x: hoveredProject === (project.id || idx.toString()) ? 6 : 0 
                            }}
                            transition={{ 
                              duration: 0.2,
                              type: "spring",
                              stiffness: 400,
                              damping: 25
                            }}
                          >
                            {project.description || `Project ${idx + 1}`}
                          </motion.span>
                          <motion.svg 
                            className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-300 transition-all duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            initial={{ opacity: 0, x: -15, scale: 0.8 }}
                            animate={{ 
                              opacity: hoveredProject === (project.id || idx.toString()) ? 1 : 0,
                              x: hoveredProject === (project.id || idx.toString()) ? 0 : -15,
                              scale: hoveredProject === (project.id || idx.toString()) ? 1 : 0.8
                            }}
                            transition={{ 
                              duration: 0.2,
                              type: "spring",
                              stiffness: 400,
                              damping: 25
                            }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </motion.svg>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
    </motion.div>
  );
}