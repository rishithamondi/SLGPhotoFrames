import { Phone, Mail, MapPin, MessageCircle, Clock, ArrowUpRight, ExternalLink, Users } from "lucide-react";
import { siteConfig, getWhatsAppUrl, getCallUrl } from "@/config/site";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function ContactPage() {
  useDocumentTitle("Get in Touch");
  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Chat with us instantly",
      value: siteConfig.phoneDisplay,
      href: getWhatsAppUrl(),
      external: true,
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call us directly",
      value: siteConfig.phoneDisplay,
      href: getCallUrl(),
    },
    {
      icon: Mail,
      title: "Email",
      description: "Send us an email",
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come to our workshop",
      value: "Get Directions",
      href: siteConfig.address.mapsUrl,
      external: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 border-b border-border/50">
        <div className="absolute top-20 right-10 w-32 h-32 border-2 border-accent/10 rounded-lg rotate-12 hidden lg:block" />
        <div className="absolute bottom-20 right-40 w-20 h-20 border-2 border-accent/8 rounded-lg -rotate-6 hidden lg:block" />
        <div className="absolute top-40 left-[60%] w-16 h-16 border border-accent/5 rounded hidden lg:block" />
        
        <div className="relative container-custom px-4 sm:px-6 py-16 sm:py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/10 border border-accent/20 mb-4 sm:mb-6 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs sm:text-sm text-accent font-medium">We're here to help</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight animate-fade-up animation-delay-100 px-2">
              Get in Touch
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-up animation-delay-200 px-4">
              Have questions or ready to place an order? We'd love to hear from you. Reach out through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="container-custom px-4 sm:px-6 -mt-12 sm:-mt-16 relative z-10 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {contactMethods.map((method, index) => (
            <a
              key={method.title}
              href={method.href}
              target={method.external ? "_blank" : undefined}
              rel={method.external ? "noopener noreferrer" : undefined}
              className="group relative bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card border border-border hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <method.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">{method.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{method.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-foreground">{method.value}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Location & Hours Section */}
      <section className="py-12 sm:py-20 bg-muted/30 border-t border-border/50">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* Map */}
            <div className="space-y-4 sm:space-y-6 animate-fade-up">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">Visit Our Workshop</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Come see our handcrafted pieces in person. We'd love to welcome you.</p>
              </div>
              
              <div className="rounded-xl sm:rounded-2xl overflow-hidden h-64 sm:h-80 bg-card border border-border shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3814.1234567890123!2d81.7833!3d17.0000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37f7c7c7c7c7c7%3A0x8c8c8c8c8c8c8c8c!2sGokavaram%20Bustand%20Road%2C%20Rajamahendravaram!5e0!3m2!1sen!2sin!4v1707123456789!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0, filter: "grayscale(20%)" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Shop Location"
                />
              </div>
              
              <a 
                href="https://maps.app.goo.gl/kGnauS3ZLyysshDU6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="font-medium">Open in Google Maps</span>
              </a>
            </div>

            {/* Address & Hours */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-up animation-delay-100">
              {/* Address Card */}
              <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-border/50 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Our Address</h3>
                    <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                      {siteConfig.address.full}
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-border/50 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Business Hours</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">We're open on the following days</p>
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between py-2 sm:py-3 border-b border-border/50">
                    <span className="text-muted-foreground text-xs sm:text-sm">Monday – Saturday</span>
                    <span className="text-foreground font-medium text-xs sm:text-sm">{siteConfig.businessHours.weekdays}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 sm:py-3">
                    <span className="text-muted-foreground text-xs sm:text-sm">Sunday</span>
                    <span className="text-foreground font-medium text-xs sm:text-sm">{siteConfig.businessHours.sunday}</span>
                  </div>
                </div>
              </div>

              {/* Quick CTA */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 w-full py-3 sm:py-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 text-sm sm:text-base"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Start a Conversation
              </a>

              {/* WhatsApp Community */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200 dark:border-green-800/50">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Join Our Community</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                      Get exclusive updates, new product announcements, and special offers directly on WhatsApp.
                    </p>
                    <a
                      href={siteConfig.social.whatsappCommunity}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300"
                    >
                      <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Join WhatsApp Community
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
