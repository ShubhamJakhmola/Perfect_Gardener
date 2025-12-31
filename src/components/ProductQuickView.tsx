import { useState, useEffect } from "react";
import { Star, ExternalLink, X, Package, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getSourceDisplayText } from "@/lib/product-utils";

export interface ExtendedProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  images?: string[];
  link: string;
  category?: string;
  description?: string;
  source?: string;
  subCategory?: string;
}

interface ProductQuickViewProps {
  product: ExtendedProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate a consistent mock rating based on product id
function getMockRating(productId: string): { rating: number; reviews: number } {
  const seed = parseInt(productId, 10) || productId.charCodeAt(0);
  const rating = 3.5 + (seed % 15) / 10; // Rating between 3.5 and 5.0
  const reviews = 50 + (seed * 17) % 450; // Reviews between 50 and 500
  return { rating: Math.round(rating * 10) / 10, reviews };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : star - 0.5 <= rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  if (!product) return null;

  const { rating, reviews } = getMockRating(product.id);
  
  // Get all images (support both legacy single image and new images array)
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : [];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset to first image when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentImageIndex(0);
    }
  }, [open]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
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
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const currentImage = allImages[currentImageIndex] || product.image || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            {/* Main Image with Swipe Support */}
            <div 
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={currentImage}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='system-ui' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
              
              {/* Navigation Arrows (Desktop) */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full shadow-lg"
                    onClick={goToPrevious}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full shadow-lg"
                    onClick={goToNext}
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      currentImageIndex === index
                        ? "border-primary shadow-md scale-105"
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
          <div className="flex flex-col">
            {/* Category Badge */}
            {product.category && (
              <Badge variant="secondary" className="w-fit mb-3">
                <Tag className="w-3 h-3 mr-1" />
                {product.category}
              </Badge>
            )}

            {/* Product Name */}
            <h2 className="font-display font-bold text-lg md:text-xl text-foreground leading-tight mb-3">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={rating} />
              <span className="text-sm font-medium text-foreground">{rating}</span>
              <span className="text-sm text-muted-foreground">
                ({reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <p className="text-2xl font-bold text-primary mb-4">
              {product.price}
            </p>

            <Separator className="my-3" />

            {/* Description */}
            {product.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  About this product
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Additional Details */}
            <div className="space-y-2 mb-6">
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
            <Button asChild className="w-full mt-auto" size="lg">
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getSourceDisplayText(product.source)}
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
