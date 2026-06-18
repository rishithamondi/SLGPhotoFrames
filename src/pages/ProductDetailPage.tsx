import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { ArrowLeft, Heart, Phone, MessageCircle, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Gift, Package, Clock, Palette, Users, Zap, MapPin, Calendar, X, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/ProductCard";
import { products } from "@/data/products";
import { useWishlist } from "@/contexts/WishlistContext";
import { siteConfig, getWhatsAppUrl, getCallUrl } from "@/config/site";
import { cn } from "@/lib/utils";
import { UrgentOrderSection, MobileUrgentBar, QuickReplyButton, GiftMode } from "@/components/products/ProductDetailComponents";


export default function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  useDocumentTitle(product ? product.name : "Product Details");
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"description" | "materials" | "delivery">("description");

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link to="/products"><Button>Back to Products</Button></Link>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const selectedSizeData = product.sizes.find((s) => s.name === selectedSize);
  const currentPrice = selectedSizeData?.price || product.basePrice;
  const productImages = product.images;
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const toggleWishlist = () => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id);
  const nextImage = () => setCurrentImageIndex((i) => (i === productImages.length - 1 ? 0 : i + 1));
  const prevImage = () => setCurrentImageIndex((i) => (i === 0 ? productImages.length - 1 : i - 1));

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
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white border border-border/50 flex items-center justify-center p-6 group">
              <img
                src={productImages[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              {productImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors" aria-label="Previous image">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={nextImage} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors" aria-label="Next image">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-background/80 text-[10px] text-muted-foreground">
                {currentImageIndex + 1} / {productImages.length}
              </div>
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      "shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-colors bg-white flex items-center justify-center p-1.5",
                      i === currentImageIndex ? "border-primary" : "border-transparent hover:border-border"
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" className="max-w-full max-h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info — sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] uppercase tracking-wider">{tag}</Badge>
              ))}
            </div>

            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">{product.name}</h1>

            <div className="mb-4 sm:mb-6">
              <p className="text-xl sm:text-2xl font-bold text-foreground">₹{currentPrice.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedSize ? `Size: ${selectedSize}` : "Starting price"}</p>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={cn(
                      "px-4 py-2.5 rounded-lg border text-sm transition-all duration-200",
                      selectedSize === size.name
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    )}
                  >
                    <span className="font-medium">{size.name}</span>
                    <span className="text-xs ml-1 opacity-70">₹{size.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Reply Buttons */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Ask</h3>
              <div className="flex flex-wrap gap-2">
                <QuickReplyButton
                  icon={Package}
                  label="Ask Price"
                  message="Can you tell me the best price for this?"
                  productName={product.name}
                />
                <QuickReplyButton
                  icon={Clock}
                  label="Delivery Time"
                  message="How long will delivery take?"
                  productName={product.name}
                />
                <QuickReplyButton
                  icon={Palette}
                  label="Customization"
                  message="Is customization available for this?"
                  productName={product.name}
                />
                <QuickReplyButton
                  icon={Users}
                  label="Bulk Order"
                  message="I need a bulk order. Can you provide a discount?"
                  productName={product.name}
                />
              </div>
            </div>

            {/* Gift Mode */}
            <div className="mb-4">
              <GiftMode productName={product.name} />
            </div>

            {/* Urgent Order Section */}
            <div className="mb-4">
              <UrgentOrderSection productName={product.name} selectedSize={selectedSize} />
            </div>

            {/* Delivery info */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <Truck className="h-4 w-4 mx-auto mb-1 text-accent" />
                <p className="text-[10px] text-muted-foreground">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="h-4 w-4 mx-auto mb-1 text-accent" />
                <p className="text-[10px] text-muted-foreground">Quality Assured</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-4 w-4 mx-auto mb-1 text-accent" />
                <p className="text-[10px] text-muted-foreground">Easy Returns</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex gap-2 sm:gap-2.5">
                <a href={getWhatsAppUrl(whatsappMsg)} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="gold" size="lg" className="w-full text-sm sm:text-base">
                    <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" /> WhatsApp
                  </Button>
                </a>
                <a href={getCallUrl()} className="flex-1">
                  <Button variant="outline" size="lg" className="w-full text-sm sm:text-base">
                    <Phone className="h-4 w-4 mr-1 sm:mr-2" /> Call Now
                  </Button>
                </a>
              </div>
              <div className="flex gap-2 sm:gap-2.5">
                <Link to={`/contact?product=${encodeURIComponent(product.name)}`} className="flex-1">
                  <Button variant="secondary" size="lg" className="w-full text-sm sm:text-base">Enquire Now</Button>
                </Link>
                <Button variant="outline" size="lg" onClick={toggleWishlist} className={cn(inWishlist && "bg-accent/10 border-accent text-accent")} aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}>
                  <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                </Button>
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
                    {product.materials.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}
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

      {/* Mobile Sticky Urgent Order Bar */}
      <MobileUrgentBar productName={product.name} selectedSize={selectedSize} />
    </div>
  );
}
