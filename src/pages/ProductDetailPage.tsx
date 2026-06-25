import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Heart, Phone, MessageCircle, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, AlertCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { useWishlist } from "@/contexts/WishlistContext";
import { siteConfig, getWhatsAppUrl, getCallUrl } from "@/config/site";
import { cn } from "@/lib/utils";
import { GiftMode } from "@/components/products/ProductDetailComponents";
import { useProduct, useProducts } from "@/hooks/useCatalog";
import { getProductDetailImage, getProductThumbnailImage } from "@/lib/cloudinary";
import { toast } from "sonner";

const DISPLAY_TAGS_MAP: Record<string, string> = {
  "premium": "Premium",
  "handcrafted": "Handmade",
  "devotional": "Devotional",
  "gift-item": "Gift Item",
  "family": "Family",
  "customizable": "Custom Made",
  "custom-order": "Custom Made",
  "personalized": "Personalized",
  "spiritual": "Spiritual",
  "bestseller": "Bestseller",
  "featured": "Featured",
  "gold-foil": "Gold Foil",
  "silver-gift": "Silver Gift",
};

const MEANINGFUL_TAGS_PRIORITY = [
  "premium",
  "handcrafted",
  "custom-order",
  "customizable",
  "personalized",
  "devotional",
  "gift-item",
  "family",
  "spiritual",
  "silver-gift",
  "gold-foil",
  "bestseller",
  "featured"
];

const formatSizeLabel = (name: string) => {
  if (!name) return "";
  return name
    .replace(/["\s]/g, "")
    .replace(/[xX]/g, " × ")
    .replace(/inches/i, "")
    .trim();
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, isLoading, isError, error } = useProduct(id || "");
  const { data: relatedProductsData } = useProducts(product ? { category: product.category, limit: 5 } : undefined);

  useDocumentTitle(product ? product.name : "Product Details");
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"description" | "materials" | "delivery">("description");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0].name);
    }
  }, [product, selectedSize, setSelectedSize]);

  if (isLoading) {
    return (
      <div className="min-h-screen container-custom px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-xl animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="h-32 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-12 bg-muted rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-destructive/10 border border-destructive/20 p-8 rounded-xl max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-destructive mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6 text-sm">{error instanceof Error ? error.message : "The product you're looking for doesn't exist or has been removed."}</p>
          <Link to="/products"><Button>Back to Products</Button></Link>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const selectedSizeData = product.sizes.find((s) => s.name === selectedSize);
  const currentPrice = selectedSizeData?.price || product.basePrice;
  const productImages = product.images;
  const relatedProducts = relatedProductsData?.products.filter(p => p.id !== product.id).slice(0, 4) || [];

  const customerFacingTags = (product.tags || [])
    .map(t => t.toLowerCase())
    .filter(t => t in DISPLAY_TAGS_MAP)
    .sort((a, b) => {
      const idxA = MEANINGFUL_TAGS_PRIORITY.indexOf(a);
      const idxB = MEANINGFUL_TAGS_PRIORITY.indexOf(b);
      const valA = idxA === -1 ? 999 : idxA;
      const valB = idxB === -1 ? 999 : idxB;
      return valA - valB;
    })
    .slice(0, 4)
    .map(t => DISPLAY_TAGS_MAP[t]);

  const toggleWishlist = () => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id);

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | Sri Lakshmi Ganapathi Photo Frames`,
      text: `Check out this premium handcrafted photo frame: ${product.name}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log("Web Share failed, falling back to copy:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link to clipboard.");
    }
  };
  
  const scrollToImage = (index: number) => {
    setCurrentImageIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.offsetWidth * index,
        behavior: "auto"
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
      if (index !== currentImageIndex) {
        setCurrentImageIndex(index);
      }
    }
  };

  const nextImage = () => scrollToImage(currentImageIndex === productImages.length - 1 ? 0 : currentImageIndex + 1);
  const prevImage = () => scrollToImage(currentImageIndex === 0 ? productImages.length - 1 : currentImageIndex - 1);

  const whatsappMsg = `Hi! I'm interested in "${product.name}"${selectedSize ? ` (Size: ${selectedSize}, ₹${currentPrice.toLocaleString()})` : ""}. Can you provide more details?`;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border/50 py-3">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-14">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-border/40 group shadow-sm">
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              >
                {productImages.map((img, i) => (
                  <div key={i} className="min-w-full h-full flex items-center justify-center p-6 snap-center shrink-0">
                    <img
                      src={getProductDetailImage(img)}
                      alt={`${product.name} - Image ${i + 1}`}
                      className="max-w-full max-h-full object-contain transition-transform duration-500 lg:group-hover:scale-[1.02]"
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                ))}
              </div>

              {/* Floating Utilities */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2.5">
                <button
                  onClick={toggleWishlist}
                  className={cn(
                    "p-2 text-neutral-500 hover:text-neutral-900 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer select-none",
                    inWishlist && "text-primary hover:text-primary animate-wishlist-bounce"
                  )}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={cn("h-[18px] w-[18px] transition-colors duration-200", inWishlist && "fill-primary text-primary")} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-neutral-500 hover:text-neutral-900 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer select-none"
                  aria-label="Share product"
                >
                  <Share2 className="h-[18px] w-[18px]" />
                </button>
              </div>

              {productImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background border border-border/20 transition-all opacity-0 lg:group-hover:opacity-100 shadow-sm cursor-pointer" aria-label="Previous image">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background border border-border/20 transition-all opacity-0 lg:group-hover:opacity-100 shadow-sm cursor-pointer" aria-label="Next image">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-background/85 backdrop-blur-sm text-[10px] font-semibold text-muted-foreground border border-border/20 shadow-sm">
                {currentImageIndex + 1} / {productImages.length}
              </div>
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-1.5 scrollbar-hide justify-start">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToImage(i)}
                    className={cn(
                      "shrink-0 w-12 h-12 sm:w-14 sm:h-14 aspect-square rounded-lg overflow-hidden border transition-all duration-300 bg-white flex items-center justify-center p-1 cursor-pointer",
                      i === currentImageIndex
                        ? "border-primary ring-2 ring-primary/30 shadow-gold scale-105"
                        : "border-border/40 opacity-70 hover:opacity-100 hover:border-border/80"
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img 
                      src={getProductThumbnailImage(img)} 
                      alt="" 
                      className="max-w-full max-h-full object-contain" 
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info — sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div>
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 leading-tight">{product.name}</h1>

              <div className="flex items-baseline gap-2">
                <p className="text-xl sm:text-2xl font-bold text-foreground">₹{currentPrice.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  {selectedSize ? `for size: ${selectedSize}` : "starting price"}
                </p>
              </div>

              {customerFacingTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-y-1.5 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-4 font-semibold select-none">
                  {customerFacingTags.map((tag, idx) => (
                    <span key={tag} className="flex items-center">
                      {idx > 0 && <span className="mx-2 text-primary/60 text-[8px]">•</span>}
                      <span className="hover:text-primary transition-colors duration-200">{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Size Selection (Timeline Selector) */}
            {product.sizes?.length > 0 && (
              <div className="border-t border-border/30 pt-4">
                <h3 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Select Dimensions</h3>
                
                {/* Horizontal Timeline Container */}
                <div className="relative py-1.5 px-1">
                  {/* Thin Gold Timeline Background Line */}
                  <div className="absolute top-[14px] left-8 right-8 h-[1.5px] bg-primary/20 -z-0" />
                  
                  {/* Nodes Flex Row */}
                  <div className="flex justify-between items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size.name;
                      return (
                        <button
                          key={size.name}
                          onClick={() => setSelectedSize(size.name)}
                          className="flex flex-col items-center gap-2 cursor-pointer select-none group focus:outline-none min-w-[70px] flex-1 relative z-10 touch-manipulation"
                        >
                          {/* Circular Node with Touch-Friendly Hit Target */}
                          <div className="w-10 h-7 flex items-center justify-center">
                            <div className={cn(
                              "rounded-full flex items-center justify-center border transition-all duration-300 bg-background",
                              isSelected
                                ? "w-[18px] h-[18px] border-primary ring-[3px] ring-primary/20 shadow-gold scale-100"
                                : "w-3 h-3 border-primary/30 group-hover:border-primary/60 group-hover:scale-110"
                            )}>
                              <div className={cn(
                                "rounded-full transition-all duration-300",
                                isSelected ? "w-2 h-2 bg-primary" : "w-0 h-0 bg-transparent"
                              )} />
                            </div>
                          </div>
                          
                          {/* Size Label */}
                          <span className={cn(
                            "text-[10px] sm:text-xs font-semibold tracking-wider transition-colors duration-300 capitalize select-none text-center",
                            isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}>
                            {formatSizeLabel(size.name)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* Gift Mode */}
            <div className="border-t border-border/30 pt-5">
              <GiftMode productName={product.name} />
            </div>

            {/* Delivery info */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-muted/30 border border-border/30 rounded-xl shadow-soft">
              <div className="text-center">
                <Truck className="h-4.5 w-4.5 mx-auto mb-1 text-primary" />
                <p className="text-[10px] font-semibold text-muted-foreground">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="h-4.5 w-4.5 mx-auto mb-1 text-primary" />
                <p className="text-[10px] font-semibold text-muted-foreground">Quality Assured</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-4.5 w-4.5 mx-auto mb-1 text-primary" />
                <p className="text-[10px] font-semibold text-muted-foreground">Easy Returns</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5 pt-2">
              <a href={getWhatsAppUrl(whatsappMsg)} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button variant="gold" size="lg" className="w-full text-sm sm:text-base font-semibold py-6 shadow-md transition-all duration-300 hover:scale-[1.01]">
                  <MessageCircle className="h-5 w-5 mr-2" /> Order on WhatsApp
                </Button>
              </a>
              <div className="grid grid-cols-2 gap-2.5">
                <a href={getCallUrl()} className="w-full">
                  <Button variant="outline" size="lg" className="w-full text-sm sm:text-base font-medium py-5">
                    <Phone className="h-4 w-4 mr-2" /> Call Now
                  </Button>
                </a>
                <Link to={`/contact?product=${encodeURIComponent(product.name)}`} className="w-full">
                  <Button variant="secondary" size="lg" className="w-full text-sm sm:text-base font-medium py-5">
                    Enquire Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex gap-6 border-b border-border mb-4">
                {(["description", "materials", "delivery"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "pb-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-[1px]",
                      activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {activeTab === "description" && <p>{product.description}</p>}
                {activeTab === "materials" && (
                  <div className="flex flex-wrap gap-2">
                    {product.materials?.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}
                  </div>
                )}
                {activeTab === "delivery" && (
                  <div className="space-y-2">
                    <p>• Estimated delivery: 5-7 business days</p>
                    <p>• Free shipping on orders above ₹1,000</p>
                    <p>• Careful packaging to ensure safe delivery</p>
                    <p>• Easy returns within 7 days</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-10 border-t border-border/50">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
