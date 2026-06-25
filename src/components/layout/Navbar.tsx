import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, Lock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
// Brand Assets
import logo from "@/assets/brand/logofinal.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Categories", path: "/categories" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden" 
          onClick={() => setIsOpen(false)} 
          aria-hidden="true"
        />
      )}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "bg-background/95 backdrop-blur-sm",
        isScrolled ? "shadow-soft border-b border-border" : "border-b border-transparent"
      )}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0" aria-label="Home">
            <img src={logo} alt="Sri Lakshmi Ganapathi" className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 object-contain bg-transparent shrink-0" />
            <div className="hidden md:block min-w-0">
              <h1 className="font-serif text-sm lg:text-base font-semibold text-foreground leading-tight truncate">
                Sri Lakshmi Ganapathi Photo Frames
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                Since 1985
              </p>
            </div>
          </Link>

          {/* Desktop Navigation — centered */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "relative text-sm font-medium transition-colors duration-300 py-2",
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.name}
                {/* Gold animated underline for active link */}
                <span 
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out",
                    location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
                  )} 
                />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none flex items-center justify-center active:scale-95"
            >
              {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none flex items-center justify-center relative active:scale-95"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute top-[4px] right-[4px] w-[13px] h-[13px] rounded-full bg-accent text-accent-foreground text-[8px] flex items-center justify-center font-bold leading-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Admin Login Link */}
            <Link
              to="/admin/login"
              aria-label="Admin Login"
              className="hidden sm:flex p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none items-center justify-center active:scale-95"
            >
              <Lock className="h-[18px] w-[18px]" />
            </Link>

            {/* Hamburger Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none flex items-center justify-center active:scale-95"
            >
              {isOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden grid transition-all duration-300 ease-in-out",
            isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 pt-3 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="px-4 pt-2 flex flex-col gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground justify-start w-full"
              >
                <Link to="/admin/login" aria-label="Admin Login">
                  <Lock className="h-4 w-4 mr-2" /> Admin Login
                </Link>
              </Button>
            </div>
          </div>
          </div>
        </div>
      </nav>
    </header>
    </>
  );
}
