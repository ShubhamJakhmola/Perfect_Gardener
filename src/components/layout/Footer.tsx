import { Link } from "react-router-dom";
import { Leaf, Youtube, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Posts", href: "/posts" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
];

const socialLinks = [
  { label: "YouTube", href: "https://www.youtube.com/@perfect.gardener", icon: Youtube },
  { label: "Instagram", href: "https://www.instagram.com/_perfect.gardener/", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/perfect.gardener", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/perfect_gardener", icon: Twitter },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex-shrink-0 flex items-center justify-center" style={{ minHeight: "64px", padding: "4px 0", overflow: "visible" }}>
                <img 
                  src="/assets/images/Avtar.png" 
                  alt="Perfect Gardener Logo" 
                  className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain object-center group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                  style={{ 
                    width: "auto",
                    height: "auto",
                    maxWidth: "80px",
                    maxHeight: "80px",
                    objectFit: "contain",
                    objectPosition: "center",
                    display: "block"
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 flex items-center justify-center"><Leaf class="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-primary" /></div>';
                    }
                  }}
                />
              </div>
              <span className="font-display font-bold text-xl md:text-2xl lg:text-3xl text-foreground">
                Perfect Gardener
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Nature, flowers, plants, care — helping them grow better. Your trusted companion for all gardening needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors focus-ring rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: progardener01@gmail.com</li>
              <li>Location: Uttarakhand, India</li>
            </ul>

            <Button asChild className="mt-4">
              <a
                href="https://www.youtube.com/@perfect.gardener"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="w-4 h-4 mr-2" />
                Subscribe on YouTube
              </a>
            </Button>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors focus-ring"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Perfect Gardener • All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
