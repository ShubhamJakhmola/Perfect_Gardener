import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Home, Mail } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 pt-20 pb-16">
        <section className="py-20 md:py-32">
          <div className="section-container">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-8xl md:text-9xl font-display font-bold text-primary mb-4">
                404
              </h1>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                Oops! Page Not Found
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
                Sorry, the page you're looking for doesn't exist or has been moved. 
                Let's get you back on track!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Back to Home
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to="/contact" className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Report This Page
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default NotFound;
