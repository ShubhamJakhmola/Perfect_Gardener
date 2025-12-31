import { useState, useEffect, useMemo } from "react";
import { Search, Filter, X, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { ProductCard, Product } from "@/components/ProductCard";
import { SkeletonCardGrid } from "@/components/ui/skeleton-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { productStorage, AdminProduct } from "@/lib/admin-storage";
import { filterWithAutoCorrect, getSearchSuggestions } from "@/lib/search-utils";

// Extended products data with categories (fallback data)
const fallbackProducts: (Product & { category: string; description: string })[] = [
  {
    id: "1",
    name: "White Winter Season Big-Petal Oyster Mushroom Growing Kit (400gm Spawn + 2 PP Grow Bags)",
    price: "₹199",
    image: "https://m.media-amazon.com/images/I/71xAl7MObbL._SX679_.jpg",
    link: "https://www.amazon.in/dp/B0FG1M21B5",
    category: "Seeds & Kits",
    description: "Complete mushroom growing kit for beginners",
  },
  
];

const Products = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<(Product & { category: string; description: string })[]>([]);

  // Load products from localStorage (admin-managed) or fallback to default
  useEffect(() => {
    const loadProducts = () => {
      const adminProducts = productStorage.getAll();
      
      if (adminProducts.length > 0) {
        // Convert AdminProduct to Product format
        const convertedProducts = adminProducts.map((p): Product & { category: string; description: string } => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images && p.images.length > 0 ? p.images[0] : (p.image || ""),
          images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
          link: p.link || "",
          category: p.category || "Uncategorized",
          description: p.description || "",
          source: p.source,
          subCategory: p.subCategory,
        }));
        setAllProducts(convertedProducts);
      } else {
        // Use fallback products if no admin products exist
        setAllProducts(fallbackProducts);
      }
      
      setIsLoading(false);
    };

    loadProducts();
    
    // Listen for storage changes (when admin adds/updates products)
    const handleStorageChange = () => {
      loadProducts();
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for same-tab updates
    const interval = setInterval(loadProducts, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(allProducts.map(p => p.category)))];
  }, [allProducts]);

  const [suggestedTerm, setSuggestedTerm] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      setSuggestedTerm(null);
      setShowSuggestion(false);
      return allProducts.filter((product) => {
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        return matchesCategory;
      });
    }

    // Use auto-correct for search
    const searchableProducts = allProducts.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesCategory;
    });

    const { filtered, suggestedTerm: suggestion } = filterWithAutoCorrect(
      searchableProducts,
      searchQuery,
      (product) => `${product.name} ${product.description || ""}`,
      0.5
    );

    setSuggestedTerm(suggestion);
    setShowSuggestion(suggestion !== null && suggestion.toLowerCase() !== searchQuery.toLowerCase());

    return filtered;
  }, [allProducts, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "All";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="py-8 md:py-12 bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Gardening Products
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Curated selection of premium gardening products. Everything you need to grow a beautiful garden.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-6 bg-muted/30 border-b border-border sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
                {showSuggestion && suggestedTerm && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50">
                    <Alert className="bg-primary/10 border-primary/20">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <AlertDescription className="text-sm">
                        Did you mean <strong>{suggestedTerm}</strong>?{" "}
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary underline"
                          onClick={() => {
                            setSearchQuery(suggestedTerm);
                            setShowSuggestion(false);
                          }}
                        >
                          Use this instead
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>

              {/* Mobile Filter Toggle */}
              <Button 
                variant="outline" 
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {/* Category Filters - Desktop */}
              <div className="hidden md:flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Mobile Filters Dropdown */}
            {showFilters && (
              <div className="md:hidden mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowFilters(false);
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Results Info */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {allProducts.length} product{allProducts.length !== 1 ? 's' : ''}
              </p>
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  {selectedCategory !== "All" && (
                    <Badge variant="secondary">{selectedCategory}</Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary">"{searchQuery}"</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-6 pb-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <SkeletonCardGrid count={12} />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/50 rounded-xl">
                <p className="text-xl font-medium text-foreground mb-2">No products found</p>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Products;
