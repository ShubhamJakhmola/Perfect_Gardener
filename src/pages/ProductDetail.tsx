import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, Package, Tag, ShoppingCart, GitCompare } from "lucide-react";
import { productStorage, AdminProduct } from "@/lib/admin-storage";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getSourceDisplayText, formatSourceName } from "@/lib/product-utils";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [similarProducts, setSimilarProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!id) {
          setError("Product ID is required");
          setLoading(false);
          return;
        }

        const allProducts = await productStorage.getAll();
        const foundProduct = allProducts.find((p) => p.id === id);

        if (!foundProduct) {
          setError("Product not found");
          setLoading(false);
          return;
        }

        setProduct(foundProduct);
        
        // Find similar products (same name but different sources)
        if (foundProduct.name) {
          const similar = allProducts.filter(
            (p) => 
              p.id !== foundProduct.id && 
              p.name.toLowerCase().trim() === foundProduct.name.toLowerCase().trim() &&
              p.subCategory && 
              p.subCategory !== foundProduct.subCategory
          );
          setSimilarProducts(similar);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Failed to load product. Please try again.");
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Get all images (support both legacy single image and new images array)
  const allImages = product?.images && product.images.length > 0
    ? product.images
    : product?.image
      ? [product.image]
      : [];

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || allImages.length <= 1) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const goToPrevious = () => {
    if (allImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const goToNext = () => {
    if (allImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const currentImage = allImages[currentImageIndex] || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
              <div className="grid md:grid-cols-2 gap-8">
                <div className="aspect-square bg-muted rounded-lg animate-pulse" />
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-2xl font-display font-bold text-foreground mb-4">
                {error || "Product Not Found"}
              </h1>
              <p className="text-muted-foreground mb-6">
                {error || "The product you're looking for doesn't exist or has been removed."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="default">
                  <Link to="/products">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Go Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 pt-20 pb-16">
          <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                  {/* Main Image with Swipe Support */}
                  <div 
                    className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {currentImage ? (
                      <img
                        src={currentImage}
                        alt={`${product.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='system-ui' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-16 h-16" />
                      </div>
                    )}
                    
                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12 rounded-full shadow-lg backdrop-blur-sm bg-white/90"
                          onClick={goToPrevious}
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12 rounded-full shadow-lg backdrop-blur-sm bg-white/90"
                          onClick={goToNext}
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
                          {currentImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {allImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all",
                            currentImageIndex === index
                              ? "border-primary shadow-lg scale-105"
                              : "border-border opacity-60 hover:opacity-100 hover:scale-105"
                          )}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  {/* Category Badge */}
                  {product.category && (
                    <Badge variant="secondary" className="w-fit">
                      <Tag className="w-3 h-3 mr-1" />
                      {product.category}
                    </Badge>
                  )}

                  {/* Product Name */}
                  <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    {product.price}
                  </p>

                  <div className="h-px bg-border" />

                  {/* Description */}
                  {product.description && (
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        About this product
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div className="space-y-3 bg-muted/50 rounded-xl p-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Availability</span>
                      <span className="text-green-600 font-medium">In Stock</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">Free Delivery</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Returns</span>
                      <span className="text-foreground">Easy 7-Day Returns</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  {product.link && (
                    <Button asChild className="w-full" size="lg">
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy this product
                        <ExternalLink className="w-5 h-5 ml-2" />
                      </a>
                    </Button>
                  )}
                  
                  {/* Source Info */}
                  {product.source && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Available on {formatSourceName(product.source)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Comparison Section */}
            {similarProducts.length > 0 && (
              <div className="mt-12">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitCompare className="w-5 h-5" />
                      Compare Prices Across Platforms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Same product available on different platforms:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Current Product */}
                        <Card className={cn("border-2", product.source && "border-primary")}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={product.source ? "default" : "secondary"}>
                                {product.source ? formatSourceName(product.source) : "Current"}
                              </Badge>
                              {product.source && (
                                <span className="text-xs text-muted-foreground">Current</span>
                              )}
                            </div>
                            <p className="font-bold text-lg text-primary mb-2">{product.price}</p>
                            {product.link && (
                              <Button asChild size="sm" className="w-full" variant={product.source ? "default" : "outline"}>
                                <a
                                  href={product.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center"
                                >
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Buy from {product.source ? formatSourceName(product.source) : "here"}
                                  <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>

                        {/* Similar Products from other sources */}
                        {similarProducts.map((similarProduct) => (
                          <Card key={similarProduct.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary">
                                  {similarProduct.subCategory ? formatSourceName(similarProduct.subCategory) : "Other"}
                                </Badge>
                              </div>
                              <p className="font-bold text-lg text-primary mb-2">{similarProduct.price}</p>
                              {similarProduct.link && (
                                <Button asChild size="sm" className="w-full" variant="outline">
                                  <a
                                    href={similarProduct.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center"
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Buy from {similarProduct.subCategory ? formatSourceName(similarProduct.subCategory) : "here"}
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                  </a>
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>

        <Footer />
        <BackToTop />
      </div>
    </ErrorBoundary>
  );
};

export default ProductDetail;

