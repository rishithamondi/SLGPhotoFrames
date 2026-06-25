import { Link } from "react-router-dom";
import { Trash2, Heart } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useProducts } from "@/hooks/useCatalog";
import { getProductCardImage } from "@/lib/cloudinary";

export default function WishlistPage() {
  useDocumentTitle("Your Wishlist");
  const { wishlist, removeFromWishlist } = useWishlist();

  // Fetch all products to resolve saved IDs
  const { data: productsData, isLoading } = useProducts({ limit: 100 });
  const wishlistProducts = (productsData?.products || []).filter((p) => wishlist.includes(p.id));
  const totalEstimate = wishlistProducts.reduce((sum, p) => sum + p.basePrice, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 md:py-16">
        <div className="container-custom px-4 sm:px-6">
          <div className="h-10 bg-muted rounded w-1/4 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Minimal Empty State
  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center max-w-sm mx-auto animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-9 w-9 text-muted-foreground/60" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Your wishlist is empty.</h1>
          <p className="text-sm text-muted-foreground mb-8">Save your favourite frames to view them later.</p>
          <Link to="/products">
            <Button size="lg" className="px-8 shadow-gold">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Title Header */}
      <section className="py-12 border-b border-border/40">
        <div className="container-custom px-4 sm:px-6 text-center">
          <div className="section-divider mb-3" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">Your Wishlist</h1>
          <p className="text-muted-foreground text-sm">
            {wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </section>

      <div className="container-custom px-4 sm:px-6 py-8 md:py-12">
        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-white flex items-center justify-center p-6 border-b border-border/40 shrink-0">
                <img
                  src={getProductCardImage(product.images?.[0]) || ""}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                {/* Remove from Wishlist */}
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-destructive transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer select-none"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-[18px] w-[18px]" />
                </button>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1 mb-4">
                  <h3 className="font-serif text-base font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Starting from{" "}
                    <span className="font-serif font-bold text-sm text-foreground">
                      ₹{product.basePrice.toLocaleString()}
                    </span>
                  </p>
                </div>

                {/* View Product */}
                <div className="mt-auto">
                  <Link to={`/products/${product.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Simplified Estimated Total & Continue Shopping */}
        <div className="mt-12 max-w-xs ml-auto py-2 space-y-3">
          <div className="flex items-baseline justify-between border-t border-border/30 pt-4">
            <span className="text-sm font-medium text-muted-foreground">Estimated Total</span>
            <span className="font-serif font-bold text-2xl text-foreground">
              ₹{totalEstimate.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors duration-200 py-1.5"
            >
              <span>&larr;</span> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
