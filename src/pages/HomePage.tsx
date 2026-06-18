import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Heart, Truck, MessageCircle, Users } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { products, categories } from "@/data/products";
import { siteConfig, getWhatsAppUrl, getCallUrl } from "@/config/site";

// Home Page Assets
import heroBanner from "@/assets/home/hero-banner.jpg";
import heroMainImage from "@/assets/home/ganeshbro2.png"; // Hero section shop photo

// Category Assets
import categoryFrames from "@/assets/categories/category-frames.jpg";
import categoryLighting from "@/assets/categories/category-lighting.jpg";
import categorySilver from "@/assets/categories/category-silver.jpg";
import categoryGlass from "@/assets/categories/category-glass.jpg";
import categoryCustom from "@/assets/categories/category-custom.jpg";

const categoryImages: Record<string, string> = {
  "photo-frames": categoryFrames,
  "lighting-photos": categoryLighting,
  "silver-gifts": categorySilver,
  "glass-boxes": categoryGlass,
  "custom-orders": categoryCustom,
};

const featuredProducts = products.filter((p) => p.featured).slice(0, 8);
const categoriesWithImages = categories.map((cat) => ({
  ...cat,
  image: categoryImages[cat.id] || cat.image,
}));

const features = [
  { icon: Sparkles, title: "Artisan Quality", description: "Each piece is made with love and attention to detail" },
  { icon: Shield, title: "Premium Materials", description: "We use only quality woods, glass, and metals" },
  { icon: Heart, title: "Made with Care", description: "40+ years of passion for craftsmanship" },
  { icon: Truck, title: "Safe Delivery", description: "Careful packaging ensures your frames arrive perfect" },
];

export default function HomePage() {
  useDocumentTitle();
  return (
    <div>
      {/* Hero Section - Full Width Layout */}
      <section className="relative min-h-[90vh] sm:min-h-screen flex items-center pt-16 sm:pt-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBanner}
            alt="Artisan workshop with frames"
            className="w-full h-full object-cover opacity-15 sm:opacity-20"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-background via-background/95 to-background/80 sm:to-background/70" />
        </div>

        <div className="container-wide relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="py-8 sm:py-12 lg:py-0 text-center sm:text-left">
              <p className="text-accent text-xs sm:text-sm font-medium uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-4 sm:mb-6 animate-fade-up">
                Since 1985
              </p>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6 animate-fade-up animation-delay-100 leading-[1.1] sm:leading-[1.05]">
                Timeless Frames for{" "}
                <span className="text-gradient">Precious Memories</span>
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed animate-fade-up animation-delay-200 max-w-lg mx-auto sm:mx-0">
                Discover our collection of photo frames, lighting displays, and silver gift articles. Each piece tells a story.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up animation-delay-300 justify-center sm:justify-start">
                <Link to="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto sm:px-8">
                    View Products
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto sm:px-8">
                    Custom Order
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="hidden lg:flex items-center justify-center relative h-[500px]">
              {/* Main Hero Image - Father's Shop */}
              <div className="relative w-full h-full max-w-md">
                <img
                  src={heroMainImage}
                  alt="Father's Shop - Sri Lakshmi Ganapathi Photo Frame Works"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl"
                />
              </div>

              {/* Decorative elements around the image */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-accent/20 rounded-xl rotate-12" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-accent/10 rounded-lg -rotate-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-custom px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="section-divider mb-6 sm:mb-8" />
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-5 px-2">
              Crafting Memories, One Frame at a Time
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed mb-8 sm:mb-12 px-2">
              For over four decades, our family has been dedicated to the art of frame-making.
              Every piece carries the warmth of tradition and the precision of modern artistry.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="text-center animate-fade-up p-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground text-xs sm:text-sm mb-1">{feature.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container-custom px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 gap-4">
            <div>
              <div className="section-divider mb-3 sm:mb-4 !mx-0" />
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">Handpicked favorites from our collection</p>
            </div>
            <Link to="/products" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <div className="section-divider mb-3 sm:mb-4" />
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {categoriesWithImages.slice(0, 5).map((category, index) => (
              <div key={category.id} className="animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Community Banner */}
      <section className="py-8 sm:py-12 bg-gradient-to-r from-green-50 via-green-100 to-green-50 dark:from-green-950/20 dark:via-green-900/30 dark:to-green-950/20 border-y border-green-200 dark:border-green-800/30">
        <div className="container-custom px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 text-center md:text-left">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-1">Join Our WhatsApp Community</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">Get updates on new products, exclusive offers, and behind-the-scenes content.</p>
              </div>
            </div>
            <a
              href={siteConfig.social.whatsappCommunity}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 whitespace-nowrap text-sm sm:text-base w-full md:w-auto"
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Join Community
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-foreground">
        <div className="container-custom px-4 sm:px-6 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-background mb-3 sm:mb-4 px-2">
            Ready to Frame Your Memories?
          </h2>
          <p className="text-background/60 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Contact us today for custom orders, bulk inquiries, or to discuss your perfect frame.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="gold" size="lg" className="w-full sm:w-auto sm:px-8">
                WhatsApp Us
              </Button>
            </a>
            <a href={getCallUrl()} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto sm:px-8 border-background/20 text-background hover:bg-background/10">
                Call: {siteConfig.phoneDisplay}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
