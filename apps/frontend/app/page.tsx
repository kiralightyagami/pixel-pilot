import { Appbar } from "../components/Appbar";
import { Prompt } from "../components/prompt";


export default function Home() {
  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#2a2a4a] pointer-events-none" />
      
     
      <div className="absolute top-0 left-0 right-0 h-96 z-20 pointer-events-none">
        {/* Wide background glow */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at center top, rgba(147, 51, 234, 0.4) 0%, rgba(59, 130, 246, 0.3) 40%, rgba(147, 51, 234, 0.2) 70%, transparent 100%)',
            filter: 'blur(40px)'
          }}
        />
        
        {/* Intense central glow */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-64 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 100% at center top, rgba(59, 130, 246, 0.6) 0%, rgba(147, 51, 234, 0.5) 30%, rgba(59, 130, 246, 0.3) 60%, transparent 90%)',
            filter: 'blur(30px)'
          }}
        />
        
        {/* Core central glow */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-48 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 100% at center top, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.7) 40%, rgba(147, 51, 234, 0.4) 70%, transparent 100%)',
            filter: 'blur(20px)'
          }}
        />
      </div>

      {/* Eclipse Dot Pattern Overlay */}
      <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
        <div 
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
      </div>

      {/* Additional eclipse dot layer with stretched pattern */}
      <div className="absolute inset-0 z-14 flex items-center justify-center pointer-events-none">
        <div 
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
      </div>

      {/* Outer eclipse layer for extended spread */}
      <div className="absolute inset-0 z-13 flex items-center justify-center pointer-events-none">
        <div 
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
      </div>
      
      {/* Large curved glow effect - positioned at bottom center */}
      <div 
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
      />
      
      {/* Additional bright center */}
      <div 
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
      />
      
      {/* Content */}
      <div className="relative z-30 flex flex-col h-full">
        <Appbar />
        
                 {/* Main content positioned higher */}
         <div className="flex-1 flex flex-col items-center justify-start pt-12 px-6">
          <div className="max-w-4xl w-full text-center">
                         {/* Hero section */}
             <div className="space-y-4 mb-8">
               {/* Main heading - smaller */}
               <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
                 What do you want to generate?
               </h1>
               
               {/* Project description - middle size */}
               <p className="text-base md:text-lg text-gray-300 font-normal tracking-wide max-w-3xl mx-auto leading-relaxed opacity-80">
                 Transform your mathematical concepts into stunning visual animations with our intelligent generation platform
               </p>
               
               {/* Subtitle - bigger */}
               <p className="text-lg md:text-xl text-gray-200 font-medium tracking-wide">
                 Create Math Animation with 
                 <span className="text-transparent bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text font-semibold"> Pixel Pilot</span>
               </p>
             </div>
            
            {/* Prompt section */}
            <div className="max-w-2xl mx-auto">
              <Prompt />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
