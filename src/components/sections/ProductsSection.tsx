import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard, Product } from "@/components/ProductCard";
import { SkeletonCardGrid } from "@/components/ui/skeleton-card";
import { productStorage } from "@/lib/admin-storage";

interface ProductsSectionProps {
  limit?: number;
  showViewAll?: boolean;
}

export function ProductsSection({ limit = 5, showViewAll = true }: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = () => {
      const adminProducts = productStorage.getAll();
      
      if (adminProducts.length > 0) {
        // Convert AdminProduct to Product format
        const convertedProducts = adminProducts.map((p): Product => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images && p.images.length > 0 ? p.images[0] : (p.image || ""),
          images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
          link: p.link || "",
        }));
        setProducts(convertedProducts.slice(0, limit));
      } else {
        // Use empty array if no products
        setProducts([]);
      }
      
      setIsLoading(false);
    };

    loadProducts();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadProducts();
    };
    
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(loadProducts, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [limit]);

  return (
    <section id="products" className="py-20 md:py-32 relative overflow-hidden wavy-top wavy-bottom">
      {/* Subtle Background Gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(147 55% 40% / 0.05) 0%, transparent 70%)"
        }}
      />
      
      <div className="section-container">
        {/* Premium Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            <span className="gradient-text">Featured Products</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Curated selection of premium gardening products to help your garden thrive.
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <SkeletonCardGrid count={limit} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-12 bg-muted/50 rounded-xl">
            <p className="text-muted-foreground">
              No products found yet. Check back soon!
            </p>
          </div>
        )}

        {/* Premium View All Button */}
        {showViewAll && !isLoading && products.length > 0 && (
          <div className="text-center mt-16">
            <Button asChild variant="gradient" size="lg" className="px-8 py-6 text-lg font-semibold">
              <Link to="/products" className="group">
                View all products
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
