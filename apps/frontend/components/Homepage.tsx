"use client"
import { Appbar } from "./Appbar";
import { Prompt } from "./prompt";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Homepage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

 
  const handleGenerationStart = () => {
    setIsGenerating(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.4, 
        ease: [0.23, 1, 0.32, 1],
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const backgroundVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
    }
  };

  const glowVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }
    }
  };

  const dotPatternVariants = {
    hidden: { opacity: 0, scale: 1.03 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: 0.4, 
        ease: [0.23, 1, 0.32, 1],
        when: "beforeChildren",
        staggerChildren: 0
      }
    }
  };

  
  const heroVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        delay: 0.6, 
        ease: [0.23, 1, 0.32, 1],
        type: "spring",
        stiffness: 150,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -30,
      scale: 0.95,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 1, 1]
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, delay: 0.6, ease: [0.23, 1, 0.32, 1] }
    }
  };

  
  const promptVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.97 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        delay: 1.0, 
        ease: [0.23, 1, 0.32, 1],
        type: "spring",
        stiffness: 200,
        damping: 25
      }
    },
    generating: {
      opacity: 1,
      y: -80, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
        type: "spring",
        stiffness: 120,
        damping: 25
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="homepage"
        className="h-screen relative overflow-hidden flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        exit="exit"
      >
        
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#2a2a4a] pointer-events-none"
          variants={backgroundVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        />
        
        {/* Animated top glow section */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-96 z-20 pointer-events-none"
          variants={glowVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Wide background glow */}
          <motion.div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 100% 80% at center top, rgba(147, 51, 234, 0.4) 0%, rgba(59, 130, 246, 0.3) 40%, rgba(147, 51, 234, 0.2) 70%, transparent 100%)',
              filter: 'blur(40px)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          />
          
          {/* Intense central glow */}
          <motion.div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-64 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 100% at center top, rgba(59, 130, 246, 0.6) 0%, rgba(147, 51, 234, 0.5) 30%, rgba(59, 130, 246, 0.3) 60%, transparent 90%)',
              filter: 'blur(30px)'
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          />
          
          {/* Core central glow */}
          <motion.div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-48 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 100% at center top, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.7) 40%, rgba(147, 51, 234, 0.4) 70%, transparent 100%)',
              filter: 'blur(20px)'
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          />
        </motion.div>

        {/* Animated Eclipse Dot Pattern Overlay */}
        <motion.div 
          className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none"
          variants={dotPatternVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.div 
            className="w-full max-w-5xl h-full opacity-35 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.9) 1px, transparent 0),
                radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.7) 1px, transparent 0),
                radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.6) 1px, transparent 0)
              `,
              backgroundSize: '30px 20px, 45px 30px, 60px 40px',
              backgroundPosition: '0 0, 15px 10px, 30px 20px',
              maskImage: 'radial-gradient(ellipse 95% 45% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 95% 45% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)'
            }}
          />
        </motion.div>

        {/* Animated Additional eclipse dot layer */}
        <motion.div 
          className="absolute inset-0 z-14 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div 
            className="w-full max-w-7xl h-full opacity-25 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.8) 1px, transparent 0),
                radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.6) 1px, transparent 0)
              `,
              backgroundSize: '70px 35px, 100px 50px',
              backgroundPosition: '35px 17px, 50px 25px',
              maskImage: 'radial-gradient(ellipse 85% 35% at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 75%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(ellipse 85% 35% at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 75%, transparent 90%)'
            }}
          />
        </motion.div>

        {/* Animated Outer eclipse layer */}
        <motion.div 
          className="absolute inset-0 z-13 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div 
            className="w-full max-w-8xl h-full opacity-15 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(147, 197, 253, 0.9) 1px, transparent 0)
              `,
              backgroundSize: '120px 60px',
              backgroundPosition: '60px 30px',
              maskImage: 'radial-gradient(ellipse 90% 25% at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 25% at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 85%)'
            }}
          />
        </motion.div>
        
        {/* Animated Large curved glow effect */}
        <motion.div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[1400px] h-[700px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 100% 100% at center, 
              rgba(147, 197, 253, 0.8) 0%,
              rgba(99, 102, 241, 0.6) 20%,
              rgba(139, 92, 246, 0.4) 40%,
              rgba(168, 85, 247, 0.2) 60%,
              transparent 80%
            )`,
            filter: 'blur(20px)'
          }}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
        />
        
        {/* Animated Additional bright center */}
        <motion.div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 100% 100% at center, 
              rgba(219, 234, 254, 0.9) 0%,
              rgba(147, 197, 253, 0.7) 30%,
              rgba(99, 102, 241, 0.5) 60%,
              transparent 80%
            )`,
            filter: 'blur(10px)'
          }}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
        />
        
        {/* Animated Content */}
        <motion.div 
          className="relative z-30 flex flex-col h-full"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <Appbar />
          </motion.div>
          
          {/* Animated Main content */}
          <motion.div 
            className="flex-1 flex flex-col items-center justify-start pt-12 px-6"
            variants={contentVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <div className="max-w-4xl w-full text-center">
              
              {/* Hero section with exit animation */}
              <AnimatePresence mode="wait">
                {!isGenerating && (
                  <motion.div 
                    className="space-y-4 mb-8"
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    key="hero-section"
                  >
                    {/* Animated Main heading */}
                    <motion.h1 
                      className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight"
                      variants={textVariants}
                      initial="hidden"
                      animate={isVisible ? "visible" : "hidden"}
                    >
                      What do you want to generate?
                    </motion.h1>
                     
                    {/* Animated Project description */}
                    <motion.p 
                      className="text-base md:text-lg text-gray-300 font-normal tracking-wide max-w-3xl mx-auto leading-relaxed opacity-80"
                      variants={textVariants}
                      initial="hidden"
                      animate={isVisible ? "visible" : "hidden"}
                    >
                      Transform your mathematical concepts into stunning visual animations with our intelligent generation platform
                    </motion.p>
                     
                    {/* Animated Subtitle */}
                    <motion.p 
                      className="text-lg md:text-xl text-gray-200 font-medium tracking-wide"
                      variants={textVariants}
                      initial="hidden"
                      animate={isVisible ? "visible" : "hidden"}
                    >
                      Create Math Animation with 
                      <motion.span 
                        className="text-transparent bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text font-semibold"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.6, 
                          ease: [0.23, 1, 0.32, 1] 
                        }}
                      > Pixel Pilot</motion.span>
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Animated Prompt section with generation state */}
              <motion.div 
                className="max-w-2xl mx-auto"
                variants={promptVariants}
                initial="hidden"
                animate={
                  !isVisible ? "hidden" : 
                  isGenerating ? "generating" : 
                  "visible"
                }
              >
                <Prompt onGenerationStart={handleGenerationStart} />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 