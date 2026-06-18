import { Link } from "react-router-dom";
import { Trash2, ArrowRight, Heart } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { products } from "@/data/products";
import { getWhatsAppUrl } from "@/config/site";

export default function WishlistPage() {
  useDocumentTitle("Your Wishlist");
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  const totalEstimate = wishlistProducts.reduce((sum, p) => sum + p.basePrice, 0);

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-3">Your Wishlist is Empty</h1>
          <p className="text-sm text-muted-foreground mb-8">Start adding products you love to your wishlist!</p>
          <Link to="/products">
            <Button size="lg">
              Browse Products <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 md:py-16 border-b border-border/50">
        <div className="container-custom text-center">
          <div className="section-divider mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">Your Wishlist</h1>
          <p className="text-muted-foreground text-sm">{wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""} saved</p>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="flex justify-between items-center mb-6">
          <Link to="/products"><Button variant="outline" size="sm">Continue Shopping</Button></Link>
          <Button variant="ghost" size="sm" onClick={clearWishlist} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear All
          </Button>
        </div>

        <div className="space-y-3">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="flex gap-4 p-4 bg-card rounded-xl border border-border/50 transition-all duration-200 hover:shadow-card">
              <Link to={`/products/${product.id}`} className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-white border border-border/50 flex items-center justify-center p-1.5">
                <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain" loading="lazy" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-serif text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                </Link>
                <p className="text-xs text-muted-foreground mb-1.5">{product.materials.slice(0, 2).join(" · ")}</p>
                <p className="font-semibold text-foreground text-sm">Starting ₹{product.basePrice.toLocaleString()}</p>
              </div>
              <div className="flex flex-col justify-between items-end">
                <button onClick={() => removeFromWishlist(product.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove from wishlist">
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link to={`/products/${product.id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="mt-6 p-4 bg-muted/50 rounded-xl flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estimated total (starting prices)</span>
          <span className="font-serif font-bold text-lg text-foreground">₹{totalEstimate.toLocaleString()}</span>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-card border border-border/50 rounded-xl p-6 md:p-8 text-center">
          <h2 className="font-serif text-xl font-bold text-foreground mb-3">Ready to Order?</h2>
          <p className="text-sm text-muted-foreground mb-5">Contact us to discuss your wishlist items.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={getWhatsAppUrl(`Hi! I'd like to order these items from my wishlist: ${wishlistProducts.map((p) => p.name).join(", ")}`)} target="_blank" rel="noopener noreferrer">
              <Button variant="gold" size="lg">Order on WhatsApp</Button>
            </a>
            <Link to="/contact"><Button variant="outline" size="lg">Contact Us</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
