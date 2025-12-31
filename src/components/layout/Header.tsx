import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Posts", href: "/posts" },
];

const toolsLinks = [
  { label: "Flower Planting Calendar", href: "/tools/flower-calendar" },
  { label: "Pot Size Calculator", href: "/tools/pot-calculator" },
  { label: "Bloom Time Calculator", href: "/tools/bloom-calculator" },
  { label: "Budget Planner (₹)", href: "/tools/budget-planner" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 overflow-visible",
          isScrolled
            ? "glass shadow-xl backdrop-blur-xl bg-white/80 border-b border-white/20"
            : "bg-transparent"
        )}
        onKeyDown={handleKeyDown}
      >
        <div className="section-container overflow-visible">
          <div className="flex items-center justify-between h-16 md:h-18 lg:h-20 py-1 overflow-visible">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 focus-ring"
            >
              <div className="flex-shrink-0 flex items-center justify-center mt-2 sm:mt-3" style={{ minHeight: "56px", padding: "6px 0", overflow: "visible" }}>
                <img 
                  src="/assets/images/Avtar.png" 
                  alt="Perfect Gardener Logo" 
                  className="w-28 h-38 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 object-contain object-center transition-transform duration-300"
                  style={{ 
                    width: "auto",
                    height: "auto",
                    maxWidth: "80px",
                    maxHeight: "80px",
                    objectFit: "contain",
                    objectPosition: "center",
                    display: "block",
                    paddingBottom: "8px",     // pushes logo down
                    
                  }}
                  onError={(e) => {
                    // Fallback to icon if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 flex items-center justify-center"><svg class="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div>';
                    }
                  }}
                />
              </div>
              <span className="font-display font-bold text-2xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground hidden sm:inline">
                Perfect Gardener
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 text-lg md:text-xl font-semibold text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 rounded-lg transition-all duration-300 hover:scale-105 focus-ring"
                >
                  {link.label}
                </Link>
              ))}

              {/* Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="px-4 py-2 text-lg md:text-xl font-semibold text-foreground/80 hover:text-foreground hover:bg-secondary focus-ring"
                  >
                    Tools
                    <ChevronDown className="ml-1 h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-56 bg-popover border border-border shadow-lg z-[100]"
                >
                  {toolsLinks.map((tool) => (
                    <DropdownMenuItem key={tool.href} asChild>
                      <Link
                        to={tool.href}
                        className="w-full cursor-pointer focus-ring"
                      >
                        {tool.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to="/#youtube"
                className="px-4 py-2 text-lg md:text-xl font-semibold text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 rounded-lg transition-all duration-300 hover:scale-105 focus-ring"
              >
                YouTube
              </Link>
            </nav>

            {/* Mobile Menu Toggle - Enhanced Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden focus-ring relative z-50"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              <div className="relative w-5 h-5">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-0.5 w-full bg-foreground transition-all duration-300",
                    isOpen ? "top-2 rotate-45" : "top-0"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-2 h-0.5 w-full bg-foreground transition-all duration-300",
                    isOpen ? "opacity-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-4 h-0.5 w-full bg-foreground transition-all duration-300",
                    isOpen ? "top-2 -rotate-45" : "top-4"
                  )}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Enhanced */}
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-md border-t border-border shadow-lg",
            isOpen ? "max-h-[500px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
          )}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <nav className="section-container py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-4 py-3 text-lg font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors focus-ring"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
              Tools
            </div>
            {toolsLinks.map((tool) => (
              <Link
                key={tool.href}
                to={tool.href}
                className="block px-6 py-2 text-foreground/80 hover:bg-secondary rounded-lg transition-colors focus-ring text-sm"
                onClick={() => setIsOpen(false)}
              >
                {tool.label}
              </Link>
            ))}

            <Link
              to="/#youtube"
              className="block px-4 py-3 text-lg font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors focus-ring"
              onClick={() => setIsOpen(false)}
            >
              YouTube
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
