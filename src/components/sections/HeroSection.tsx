import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingCards = [
  { label: "Organic Seeds", position: "top-4 right-8", delay: 0 },
  { label: "Fresh Plants", position: "top-1/4 -right-4", delay: 0.5 },
  { label: "Garden Tools", position: "bottom-1/3 -left-4", delay: 1 },
  { label: "Expert Tips", position: "bottom-8 right-12", delay: 1.5 },
];

export function HeroSection() {
  return (
    <section 
      className="relative min-h-screen flex items-center pt-20 sm:pt-24 md:pt-12 lg:pt-16 overflow-hidden"
      onMouseMove={(e) => {
        // Parallax effect on mouse move
        const cards = document.querySelectorAll('.floating-card');
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        cards.forEach((card, i) => {
          const element = card as HTMLElement;
          const speed = (i + 1) * 0.5;
          const moveX = (x - 50) * speed * 0.01;
          const moveY = (y - 50) * speed * 0.01;
          element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
      }}
    >
      {/* Premium Gradient Background */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, hsl(147 55% 40% / 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 100% 50%, hsl(199 85% 70% / 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 0% 100%, hsl(120 40% 85% / 0.1) 0%, transparent 50%),
            linear-gradient(180deg, hsl(140 25% 98%) 0%, hsl(140 20% 99%) 100%)
          `
        }}
      />
      
      {/* Enhanced Floating Gradient Blobs with Parallax */}
      <div 
        className="absolute top-20 right-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-40 hidden lg:block animate-parallax-glow"
        style={{
          background: "radial-gradient(circle, hsl(147 55% 40% / 0.3) 0%, transparent 70%)",
        }}
      />
      <div 
        className="absolute bottom-20 left-20 w-[400px] h-[400px] rounded-full blur-3xl opacity-30 hidden lg:block animate-parallax-glow"
        style={{
          background: "radial-gradient(circle, hsl(199 85% 70% / 0.25) 0%, transparent 70%)",
          animationDelay: "1s"
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 hidden lg:block animate-parallax-glow"
        style={{
          background: "radial-gradient(circle, hsl(120 40% 85% / 0.2) 0%, transparent 70%)",
          animationDelay: "2s"
        }}
      />
      
      {/* Additional Animated Particles */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/10 blur-2xl animate-float-slow hidden lg:block" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-accent/10 blur-2xl animate-float-fast hidden lg:block" />

      {/* Decorative Animated Circles */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[700px] h-[700px] rounded-full border-2 border-dashed border-primary/15 animate-slow-spin hidden lg:block" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[550px] h-[550px] rounded-full border border-primary/10 animate-slow-spin hidden lg:block" style={{ animationDirection: "reverse", animationDuration: "25s" }} />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] rounded-full border border-primary/5 animate-slow-spin hidden lg:block" style={{ animationDuration: "30s" }} />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 backdrop-blur-sm border border-primary/20 text-primary text-xs xs:text-sm font-semibold animate-fade-in-up shadow-lg">
              <Sparkles className="w-3 h-3 xs:w-4 xs:h-4" />
              <span>Your Green Companion</span>
            </div>

            {/* Premium Gradient Heading */}
            <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] animate-fade-in-up animation-delay-100">
              <span className="text-foreground">Perfect</span>{" "}
              <span className="gradient-text">Gardener</span>
            </h1>

            {/* Description */}
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animation-delay-200">
              Perfect Gardener helps home gardeners grow healthier plants with expert gardening tips, organic seeds, trusted tools, and step-by-step plant care guides.
            </p>

            {/* Premium CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-300">
              <Button 
                asChild 
                size="lg" 
                className="btn-gradient group relative overflow-hidden px-4 xs:px-5 sm:px-6 md:px-8 py-3 xs:py-4 sm:py-5 md:py-6 text-xs xs:text-sm sm:text-base md:text-lg font-semibold w-full sm:w-auto"
              >
                <Link to="/products" className="relative z-10 flex items-center justify-center">
                  Browse Products
                  <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 ml-1.5 xs:ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="px-4 xs:px-5 sm:px-6 md:px-8 py-3 xs:py-4 sm:py-5 md:py-6 text-xs xs:text-sm sm:text-base md:text-lg font-semibold border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <Link to="/posts">Read Posts</Link>
              </Button>
            </div>

            {/* Premium Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-3 xs:gap-4 sm:gap-6 md:gap-8 pt-4 xs:pt-5 sm:pt-6 md:pt-8 animate-fade-in-up animation-delay-400">
              <div className="text-center group">
                <p className="font-display text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-0.5 xs:mb-1 group-hover:scale-110 transition-transform duration-300">50+</p>
                <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground font-medium">Products curated</p>
              </div>
              <div className="w-px h-8 xs:h-10 sm:h-12 md:h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="text-center group">
                <p className="font-display text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-0.5 xs:mb-1 group-hover:scale-110 transition-transform duration-300">10K+</p>
                <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground font-medium">Happy Gardeners</p>
              </div>
            </div>
          </div>

          {/* Right Visualization - Modern Gardening Ecosystem */}
          <div className="relative hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-[700px] aspect-square flex items-center justify-center">
              {/* Multiple Rotating Dotted Circular Rings - Responsive */}
              {[
                { size: 200, speed: 20, direction: 1, delay: 0, mobileSize: 120 },
                { size: 280, speed: 25, direction: -1, delay: 0.5, mobileSize: 160 },
                { size: 360, speed: 30, direction: 1, delay: 1, mobileSize: 200 },
                { size: 440, speed: 35, direction: -1, delay: 1.5, mobileSize: 240 },
              ].map((ring, i) => (
                <svg
                  key={i}
                  className="absolute"
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${ring.size} ${ring.size}`}
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    animation: `rotate-ring-${ring.direction === 1 ? 'forward' : 'backward'} ${ring.speed}s linear infinite`,
                    animationDelay: `${ring.delay}s`,
                    maxWidth: `${ring.size}px`,
                    maxHeight: `${ring.size}px`,
                  }}
                >
                  <circle
                    cx={ring.size / 2}
                    cy={ring.size / 2}
                    r={(ring.size - 4) / 2}
                    fill="none"
                    stroke="hsl(147 55% 40% / 0.25)"
                    strokeWidth="2"
                    strokeDasharray="4 6"
                    className="transition-opacity duration-300"
                  />
                </svg>
              ))}

              {/* Center: Healthy Green Plant Growing from Soil */}
              <div className="relative z-20 w-[180px] h-[180px] flex items-end justify-center">
                {/* Soil Base */}
                <div className="absolute bottom-0 w-full h-12 rounded-full bg-gradient-to-b from-amber-700/40 to-amber-800/50 shadow-lg" />
                
                {/* Plant Illustration */}
                <div className="relative w-full h-full flex items-end justify-center pb-2">
                  <img 
                    src="/images/tree.gif" 
                    alt="Healthy Growing Plant" 
                    className="w-full h-full object-contain animate-float"
                    style={{ 
                      filter: "brightness(1.1) saturate(1.2)",
                      animation: "float 4s ease-in-out infinite"
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = "text-8xl animate-float";
                        fallback.textContent = '🌱';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                
                {/* Subtle glow around plant */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 via-transparent to-primary/10 blur-xl pointer-events-none" />
              </div>

              {/* Four Floating Labels with Hover Effects */}
              {[
                { label: "Organic Seeds", angle: 0, distance: 220 },
                { label: "Fresh Plants", angle: 90, distance: 220 },
                { label: "Garden Tools", angle: 180, distance: 220 },
                { label: "Expert Tips", angle: 270, distance: 220 },
              ].map((item, i) => {
                const radian = (item.angle * Math.PI) / 180;
                const x = Math.cos(radian) * item.distance;
                const y = Math.sin(radian) * item.distance;
                
                return (
                  <div 
                    key={item.label} 
                    className="absolute z-30"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Floating Label Card */}
                    <div 
                      className="relative bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-primary/20 hover:shadow-xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 group cursor-default"
                      style={{ 
                        animation: `float ${3 + i * 0.4}s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    >
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
                      {/* Subtle border glow on hover */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/30 transition-all duration-300 pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Visualization - Premium with Rings */}
          <div className="md:hidden flex justify-center py-8">
            <div className="relative w-[280px] h-[280px] flex items-center justify-center">
              {/* Mobile Rings - Smaller and visible */}
              {[
                { size: 120, speed: 20, direction: 1, delay: 0 },
                { size: 160, speed: 25, direction: -1, delay: 0.5 },
                { size: 200, speed: 30, direction: 1, delay: 1 },
                { size: 240, speed: 35, direction: -1, delay: 1.5 },
              ].map((ring, i) => (
                <svg
                  key={i}
                  className="absolute"
                  width={ring.size}
                  height={ring.size}
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    animation: `rotate-ring-${ring.direction === 1 ? 'forward' : 'backward'} ${ring.speed}s linear infinite`,
                    animationDelay: `${ring.delay}s`,
                  }}
                >
                  <circle
                    cx={ring.size / 2}
                    cy={ring.size / 2}
                    r={(ring.size - 4) / 2}
                    fill="none"
                    stroke="hsl(147 55% 40% / 0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="3 5"
                    className="transition-opacity duration-300"
                  />
                </svg>
              ))}
              
              {/* Center Plant */}
              <div className="relative z-20 w-[100px] h-[100px] flex items-end justify-center">
                <div className="absolute bottom-0 w-full h-8 rounded-full bg-gradient-to-b from-amber-700/40 to-amber-800/50 shadow-lg" />
                <div className="relative w-full h-full flex items-end justify-center pb-1">
                  <img 
                    src="/images/tree.gif" 
                    alt="Growing Tree" 
                    className="relative w-full h-full object-contain animate-float"
                    style={{ animation: "float 4s ease-in-out infinite" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = "text-6xl animate-float";
                        fallback.textContent = '🌱';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 via-transparent to-primary/10 blur-xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
