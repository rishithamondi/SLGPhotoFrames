import { useState, useEffect } from "react";
import { Zap, MapPin, Calendar, X, MessageCircle, Gift, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

// Urgent Order Component
export function UrgentOrderSection({ productName, selectedSize }: { productName: string; selectedSize: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [requiredBefore, setRequiredBefore] = useState("");

  const handleUrgentOrder = () => {
    const urgentMessage = `🚨 URGENT ORDER REQUEST 🚨\n\nProduct: ${productName}${selectedSize ? `\nSize: ${selectedSize}` : ""}\n\n📍 Delivery Location: ${deliveryLocation || "To be discussed"}\n⏰ Required Before: ${requiredBefore || "ASAP"}\n\nPlease confirm if same-day crafting is possible.`;
    
    const whatsappUrl = `https://wa.me/${siteConfig.phone}?text=${encodeURIComponent(urgentMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isExpanded) {
    return (
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/30 animate-soft-glow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 animate-gentle-float">
            <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              ⚡ Need an Urgent Frame?
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Same-day crafting available for selected designs.
            </p>
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Order Urgently on WhatsApp
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-600" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Urgent Order</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="w-8 h-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-600" />
            Delivery Location
          </label>
          <input
            type="text"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder="Enter your delivery address..."
            className="w-full px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800/30 bg-background text-base focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            Required Before
          </label>
          <input
            type="text"
            value={requiredBefore}
            onChange={(e) => setRequiredBefore(e.target.value)}
            placeholder="e.g., Today 6 PM, Tomorrow morning..."
            className="w-full px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800/30 bg-background text-base focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div className="bg-amber-100/50 dark:bg-amber-900/20 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-200">
          <p><strong>Product:</strong> {productName}</p>
          {selectedSize && <p><strong>Size:</strong> {selectedSize}</p>}
        </div>

        <Button
          onClick={handleUrgentOrder}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          size="lg"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Send Urgent Order
        </Button>
      </div>
    </div>
  );
}

// Mobile Sticky Urgent Order Bar
export function MobileUrgentBar({ productName, selectedSize }: { productName: string; selectedSize: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickUrgent = () => {
    const urgentMessage = `🚨 URGENT ORDER REQUEST 🚨\n\nProduct: ${productName}${selectedSize ? `\nSize: ${selectedSize}` : ""}\n\nPlease confirm if same-day crafting is possible.`;
    const whatsappUrl = `https://wa.me/${siteConfig.phone}?text=${encodeURIComponent(urgentMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 animate-pulse" />
            <div>
              <p className="text-xs font-medium">Need it urgently?</p>
              <p className="text-[10px] opacity-90">Same-day available</p>
            </div>
          </div>
          <Button
            onClick={handleQuickUrgent}
            size="sm"
            className="bg-white text-amber-600 hover:bg-amber-50 shrink-0"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Order Now
          </Button>
        </div>
      </div>
    </div>
  );
}

// Quick Reply Button Component
export function QuickReplyButton({ icon: Icon, label, message, productName }: { icon: LucideIcon; label: string; message: string; productName: string }) {
  const fullMessage = `Hi! I'm interested in "${productName}". ${message}`;
  const whatsappUrl = `https://wa.me/${siteConfig.phone}?text=${encodeURIComponent(fullMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-accent/10 border border-border hover:border-accent/30 rounded-lg text-xs font-medium text-foreground transition-all duration-200"
    >
      <Icon className="h-3.5 w-3.5 text-accent" />
      {label}
    </a>
  );
}

// Gift Mode Component
export function GiftMode({ productName }: { productName: string }) {
  const [isGift, setIsGift] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("");

  const handleGiftSend = () => {
    const giftMessage = `Hi! I want to order "${productName}" as a GIFT 🎁\n\nThis is a gift order.\nNeed gift packing.\n${greetingMessage ? `Add greeting message: ${greetingMessage}` : ""}`;
    const whatsappUrl = `https://wa.me/${siteConfig.phone}?text=${encodeURIComponent(giftMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isGift) {
    return (
      <button
        onClick={() => setIsGift(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20 border border-pink-200 dark:border-pink-800/30 rounded-xl text-sm font-medium text-pink-700 dark:text-pink-300 hover:from-pink-100 hover:to-rose-100 transition-all duration-300"
      >
        <Gift className="h-4 w-4" />
        This is a Gift 🎁
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20 border border-pink-200 dark:border-pink-800/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
        <Gift className="h-4 w-4" />
        <span className="text-sm font-medium">Gift Order</span>
        <button
          onClick={() => setIsGift(false)}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Greeting Message (Optional)</label>
        <textarea
          value={greetingMessage}
          onChange={(e) => setGreetingMessage(e.target.value)}
          placeholder="Enter your greeting message for the gift..."
          className="w-full px-3 py-2 rounded-lg border border-pink-200 dark:border-pink-800/30 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          rows={2}
        />
      </div>

      <Button
        onClick={handleGiftSend}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
        size="sm"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Send Gift Order
      </Button>
    </div>
  );
}
