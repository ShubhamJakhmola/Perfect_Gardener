import { ExternalLink, Eye, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductQuickView, ExtendedProduct } from "./ProductQuickView";
import { getSourceDisplayText } from "@/lib/product-utils";

export interface Product {
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

interface ProductCardProps {
  product: Product;
  className?: string;
  index?: number;
}

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Get primary image (first from images array or fallback to single image)
  const primaryImage = (product.images && product.images.length > 0)
    ? product.images[0]
    : product.image || "";

  return (
    <>
      <article
        className={cn(
          "group glass-card rounded-2xl overflow-hidden animate-fade-in transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1",
          className
        )}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Image with Quick View overlay */}
        <div className="aspect-square overflow-hidden bg-muted relative">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='system-ui' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">📦</span>
            </div>
          )}
          
          {/* Image count badge if multiple images */}
          {product.images && product.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {product.images.length} images
            </div>
          )}
          
          {/* Quick View Button Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center gap-2 pb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                setQuickViewOpen(true);
              }}
              className="gap-2 backdrop-blur-sm bg-white/90 hover:bg-white"
            >
              <Eye className="w-4 h-4" />
              Quick View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="gap-2 backdrop-blur-sm bg-white/90 hover:bg-white"
            >
              <Link to={`/product/${product.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <Link to={`/product/${product.id}`}>
            <h3 
              className="font-display font-semibold text-foreground line-clamp-2 text-sm leading-snug min-h-[2.5rem] cursor-pointer hover:text-primary transition-colors group-hover:underline decoration-primary/50"
            >
              {product.name}
            </h3>
          </Link>

          <p className="gradient-text font-bold text-xl transition-transform group-hover:scale-110 inline-block">
            {product.price}
          </p>

          <Button asChild variant="gradient" className="w-full mt-3 group/btn" size="sm">
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-2" />
              Buy this product
              <ExternalLink className="w-3.5 h-3.5 ml-2 transition-transform group-hover/btn:translate-x-1" />
            </a>
          </Button>
        </div>
      </article>

      <ProductQuickView
        product={{
          ...product,
          images: product.images,
        } as ExtendedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}
