import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Heart, Truck, MessageCircle, Users } from "lucide-react";
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
  return (
    <div>
      {/* Hero Section - Full Width Layout */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBanner}
            alt="Artisan workshop with frames"
            className="w-full h-full object-cover opacity-20"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/98 to-background/70" />
        </div>

        <div className="container-wide relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="py-12 lg:py-0">
              <p className="text-accent text-sm font-medium uppercase tracking-[0.25em] mb-6 animate-fade-up">
                Since 1985
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-up animation-delay-100 leading-[1.05]">
                Timeless Frames for{" "}
                <span className="text-gradient">Precious Memories</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-up animation-delay-200 max-w-lg">
                Discover our collection of photo frames, lighting displays, and silver gift articles. Each piece tells a story.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-up animation-delay-300">
                <Link to="/products">
                  <Button size="xl" className="px-8">
                    View Products
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="xl" className="px-8">
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
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="section-divider mb-8" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-5">
              Crafting Memories, One Frame at a Time
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-12">
              For over four decades, our family has been dedicated to the art of frame-making.
              Every piece carries the warmth of tradition and the precision of modern artistry.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="text-center animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="section-divider mb-4 !mx-0" />
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">Handpicked favorites from our collection</p>
            </div>
            <Link to="/products" className="mt-4 sm:mt-0">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-10">
            <div className="section-divider mb-4" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Shop by Category
            </h2>
            <p className="text-muted-foreground">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoriesWithImages.slice(0, 5).map((category, index) => (
              <div key={category.id} className="animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Community Banner */}
      <section className="py-12 bg-gradient-to-r from-green-50 via-green-100 to-green-50 dark:from-green-950/20 dark:via-green-900/30 dark:to-green-950/20 border-y border-green-200 dark:border-green-800/30">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-1">Join Our WhatsApp Community</h3>
                <p className="text-muted-foreground text-sm">Get updates on new products, exclusive offers, and behind-the-scenes content.</p>
              </div>
            </div>
            <a
              href={siteConfig.social.whatsappCommunity}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 whitespace-nowrap"
            >
              <MessageCircle className="h-5 w-5" />
              Join Community
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-foreground">
        <div className="container-custom text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-background mb-4">
            Ready to Frame Your Memories?
          </h2>
          <p className="text-background/60 text-lg mb-8 max-w-2xl mx-auto">
            Contact us today for custom orders, bulk inquiries, or to discuss your perfect frame.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
              <Button variant="gold" size="xl">
                WhatsApp Us
              </Button>
            </a>
            <a href={getCallUrl()}>
              <Button variant="outline" size="xl" className="border-background/20 text-background hover:bg-background/10">
                Call: {siteConfig.phoneDisplay}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
