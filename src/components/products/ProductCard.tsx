import { Link } from "react-router-dom";
import { Heart, ImageIcon } from "lucide-react";
import { Product } from "@/data/products";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const isPlaceholder = product.images[0] === "/placeholder.svg";

  return (
    <Link
      to={`/products/${product.id}`}
      className={cn(
        "group flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border card-sacred img-zoom",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center border-b border-border/40 shrink-0">
        {isPlaceholder ? (
          // Placeholder for product image
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            <div className="text-center px-2">
              <p className="text-xs text-muted-foreground">Add Product Photo</p>
              <p className="text-[10px] text-muted-foreground/60">src/assets/products/product-{product.id}.jpg</p>
            </div>
          </div>
        ) : (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {product.customizable && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full uppercase tracking-wider animate-soft-glow">
              Customizable
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-medium rounded-full uppercase tracking-wider animate-soft-glow">
              Featured
            </span>
          )}
        </div>

        {/* Hover overlay with View Details */}
        {!isPlaceholder && (
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex items-end justify-center pb-6">
            <span className="bg-background/95 backdrop-blur-sm text-foreground text-xs font-medium px-6 py-2.5 rounded-full translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-elevated border border-border/50">
              View Details
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1 mb-2.5 sm:mb-3">
          <h3 className="font-serif text-sm sm:text-base font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors duration-300 min-h-[2.5rem] sm:min-h-[3rem] flex items-center">
            {product.name}
          </h3>

          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
            {product.materials && product.materials.length > 0 ? product.materials.slice(0, 2).join(" · ") : "\u00A0"}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Starting from</p>
            <p className="font-bold text-primary text-lg sm:text-xl group-hover:text-accent transition-colors duration-300">
              ₹{product.basePrice.toLocaleString()}
            </p>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {product.sizes ? `${product.sizes.length} sizes` : "0 sizes"}
          </p>
        </div>
      </div>
    </Link>
  );
}
