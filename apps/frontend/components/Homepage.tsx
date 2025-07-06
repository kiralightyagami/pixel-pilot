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

  
  const generateStars = () => {
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 8 + 4
    }));
  };

  const stars = generateStars();

  
  const generateParticles = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.2)', 'rgba(99, 102, 241, 0.3)'][Math.floor(Math.random() * 3)],
      animationDelay: Math.random() * 10,
      animationDuration: Math.random() * 15 + 10
    }));
  };

  const particles = generateParticles();

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="homepage"
        className="h-screen relative overflow-hidden flex flex-col bg-black"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        exit="exit"
      >
        
        {/* Pitch Black Background */}
        <motion.div 
          className="absolute inset-0 bg-black pointer-events-none"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        />

        {/* Animated Star Field */}
        <motion.div 
          className="absolute inset-0 z-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.5})`
              }}
              animate={{
                opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: star.animationDuration,
                delay: star.animationDelay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Floating Particles */}
        <motion.div 
          className="absolute inset-0 z-11 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full blur-sm"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: particle.animationDuration,
                delay: particle.animationDelay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
        





        


        {/* Pulsing Ring Effect */}
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <motion.div
            className="w-full h-full rounded-full border border-blue-400/20"
            style={{
              boxShadow: '0 0 50px rgba(59, 130, 246, 0.3), inset 0 0 50px rgba(59, 130, 246, 0.1)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
          
          {/* Animated Content */}
        <motion.div 
          className="relative z-30 flex flex-col h-full"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="flex justify-center px-6 pt-6"
            initial={{ opacity: 0, y: -15 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="w-full max-w-4xl">
              <Appbar />
            </div>
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
                      className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-200 leading-tight"
                      variants={textVariants}
                      initial="hidden"
                      animate={isVisible ? "visible" : "hidden"}
                    >
                      What do you want to generate?
                    </motion.h1>
                     
                    {/* Animated Project description */}
                    <motion.p 
                      className="text-base md:text-lg text-gray-400 font-normal tracking-wide max-w-3xl mx-auto leading-relaxed"
                      variants={textVariants}
                      initial="hidden"
                      animate={isVisible ? "visible" : "hidden"}
                    >
                      Transform your mathematical concepts into stunning visual animations with our intelligent generation platform
                    </motion.p>
                     
                    {/* Animated Subtitle */}
                    <motion.p 
                      className="text-lg md:text-xl text-gray-300 font-medium tracking-wide"
                      variants={textVariants}
                      initial="hidden"
                      animate={isVisible ? "visible" : "hidden"}
                    >
                      Create Math Animation with 
                      <motion.div 
                        className="inline-block relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isVisible ? { 
                          opacity: 1, 
                          scale: 1
                        } : { opacity: 0, scale: 0.95 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.6, 
                          ease: [0.23, 1, 0.32, 1] 
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-blue-500/20 to-blue-400/20 rounded-lg blur-md"
                          animate={{
                            opacity: [0.3, 0.7, 0.3],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <motion.span 
                          className="relative text-transparent bg-gradient-to-r from-blue-300 via-blue-200 to-blue-400 bg-clip-text font-bold text-xl md:text-2xl px-2"
                          style={{
                            textShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)',
                            filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))'
                          }}
                          whileHover={{
                            scale: 1.05,
                            textShadow: '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.6)',
                            transition: { duration: 0.2 }
                          }}
                        > Pixel Pilot</motion.span>
                      </motion.div>
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