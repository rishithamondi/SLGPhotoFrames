import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "@/config/site";
// Brand Assets
import logo from "@/assets/brand/logofinal.png";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Categories", path: "/categories" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const categoryLinks = [
  { name: "Photo Frames", path: "/products?category=photo-frames" },
  { name: "Lighting Photos", path: "/products?category=lighting-photos" },
  { name: "Silver Gifts", path: "/products?category=silver-gifts" },
  { name: "Glass Boxes", path: "/products?category=glass-boxes" },
  { name: "Custom Orders", path: "/contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary text-muted-foreground">
      {/* Main Footer Content */}
      <div className="container-custom px-4 sm:px-6 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8">
          
          {/* Brand Section - Takes full width on mobile, 5 columns on lg */}
          <div className="sm:col-span-2 lg:col-span-5 space-y-4 sm:space-y-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="relative">
                <img 
                  src={logo} 
                  alt={siteConfig.name} 
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover ring-2 ring-border shadow-xl" 
                />
              </div>
              <div>
                <h3 className="font-serif text-sm sm:text-base font-semibold text-foreground tracking-tight leading-tight">
                  {siteConfig.shortName}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase font-medium">
                  {siteConfig.tagline}
                </p>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed max-w-sm text-sm sm:text-[15px] mx-auto sm:mx-0">
              Creating beautiful handcrafted photo frames and gift articles since 1985.
              Each piece tells a story of dedication and artistry.
            </p>
            
            {/* Social/WhatsApp Button */}
            <a 
              href={getWhatsAppUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-300 group border border-primary/20 hover:border-primary/40 text-sm"
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium">Chat on WhatsApp</span>
              <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </a>
          </div>

          {/* Quick Links - Takes 2 columns */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h4 className="text-foreground font-medium text-sm mb-3 sm:mb-5 tracking-wide">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-muted-foreground hover:text-foreground text-xs sm:text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories - Takes 2 columns */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h4 className="text-foreground font-medium text-sm mb-3 sm:mb-5 tracking-wide">Categories</h4>
            <ul className="space-y-2 sm:space-y-3">
              {categoryLinks.map((cat) => (
                <li key={cat.name}>
                  <Link 
                    to={cat.path} 
                    className="text-muted-foreground hover:text-foreground text-xs sm:text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 h-px bg-primary group-hover:w-3 transition-all duration-300" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Takes full width on sm, 3 columns on lg */}
          <div className="sm:col-span-2 lg:col-span-3">
            <h4 className="text-foreground font-medium text-sm mb-3 sm:mb-5 tracking-wide">Get in Touch</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <a 
                  href={siteConfig.address.mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-2 sm:gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-background flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm leading-relaxed">{siteConfig.address.full}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`tel:+${siteConfig.phone}`} 
                  className="flex items-center gap-2 sm:gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-background flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm">{siteConfig.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${siteConfig.email}`} 
                  className="flex items-center gap-2 sm:gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-background flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm">{siteConfig.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-custom px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-center sm:text-left">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              © {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center justify-center gap-2">
              <span className="w-1 h-1 rounded-full bg-primary" />
              Created by Rishitha Shivanandh✨
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
