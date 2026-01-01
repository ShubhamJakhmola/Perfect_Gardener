import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";

const tools = [
  {
    icon: "🌸",
    title: "Seasonal Flower Planting Calendar",
    description: "Find the perfect flowers to plant each month in your region of India and get detailed planting guidance.",
    href: "/tools/flower-calendar",
  },
  {
    icon: "⚱️🛠️",
    title: "Pot Size Calculator",
    description: "Calculate the ideal pot size for your plants and estimate soil requirements to avoid root issues.",
    href: "/tools/pot-calculator",
  },
  {
    icon: "🌺",
    title: "Flower Bloom Time Calculator",
    description: "Predict when your flowers will bloom based on your sowing time and flower type.",
    href: "/tools/bloom-calculator",
  },
  {
    icon: "💰",
    title: "Gardening Budget Planner",
    description: "Plan your gardening budget and estimate costs for soil, seeds, fertilizers, and more.",
    href: "/tools/budget-planner",
  },
];

const GardenTools = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Free Gardening Tools & Calculators"
        description="Free online gardening tools and calculators: flower bloom time calculator, pot size calculator, budget planner, and seasonal planting calendar. Plan and manage your garden with these helpful tools."
        keywords="gardening tools, garden calculators, plant calculator, gardening tools online, free gardening tools, garden planning tools, plant care calculator, gardening helper tools"
        url="https://perfectgardener.netlify.app/tools"
      />
      <Header />
      
      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="py-12 md:py-16 text-center bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              Free Gardening Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Whether you're a beginner or an experienced gardener, everything you need to plan, calculate, and optimize your home garden
            </p>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  to={tool.href}
                  className="group bg-card border border-border rounded-xl p-6 text-center flex flex-col gap-3 transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 hover:border-primary"
                >
                  <div className="text-5xl">{tool.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground flex-grow">
                    {tool.description}
                  </p>
                  <span className="mt-auto inline-flex items-center justify-center gap-2 text-primary font-medium">
                    Open Tool →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              Ready to Grow?
            </h2>
            <p className="text-muted-foreground mb-6">
              Start with any tool above to optimize your gardening experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/" className="btn-ghost px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors">
                Back to Home
              </Link>
              <Link to="/products" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default GardenTools;
