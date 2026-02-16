import { useEffect, useState, useRef } from "react";
import { Award, Heart, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
// About Page Assets
import artisanPortrait from "@/assets/about/AmmaNanna.jpeg"; // Artisan portrait photo

const stats = [
  { value: 40, suffix: "+", label: "Years of Experience" },
  { value: 5000, suffix: "+", label: "Happy Customers" },
  { value: 10000, suffix: "+", label: "Frames Crafted" },
  { value: 100, suffix: "%", label: "Satisfaction Rate" },
];

// Custom hook for count-up animation with intersection observer
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

// Animated stat component
function AnimatedStat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <div 
      ref={ref}
      className="text-center animate-fade-up" 
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-1">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

const values = [
  { icon: Sparkles, title: "Handmade Excellence", description: "Every frame is crafted by hand with meticulous attention to detail." },
  { icon: Heart, title: "Passion for Craft", description: "Traditional craftsmanship passed down through generations." },
  { icon: Award, title: "Quality Materials", description: "Only the finest woods, metals, and glass for lasting frames." },
  { icon: Users, title: "Customer First", description: "We work closely with each customer for the perfect result." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-border/50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="section-divider mb-6" />
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-5 animate-fade-up">
              Our Story
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed animate-fade-up animation-delay-100">
              For over three decades, we have been crafting beautiful photo frames
              and gift articles that help preserve your most precious memories.
            </p>
          </div>
        </div>
      </section>

      {/* Artisan Story */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative animate-fade-up">
              {/* Artisan Portrait */}
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden">
                <img
                  src={artisanPortrait}
                  alt="Master craftsman at work"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground px-5 py-4 rounded-lg hidden md:block">
                <p className="font-serif text-3xl font-bold">40+</p>
                <p className="text-xs opacity-80">Years of Craft</p>
              </div>
            </div>

            <div className="animate-fade-up animation-delay-100">
              <div className="section-divider mb-6 !mx-0" />
              <h2 className="font-serif text-3xl font-bold text-foreground mb-5">Meet the Master Craftsman</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Our journey began in 1985 when Sivanandh Rao's father established a small workshop with a passion for craftsmanship and quality work.</p>
                <p>Today, Sivanandh Rao proudly continues that legacy, bringing expertise in creating elegant glass boxes and beautifully lighting devotional photos to enhance their presence. He blends traditional techniques with modern precision to craft frames that are both timeless and refined.</p>
                <p>Every piece tells a story — not just yours, but ours too.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-muted/30 border-y border-border/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimatedStat
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                delay={i * 80}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="section-divider mb-4" />
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Why Choose Us?</h2>
            <p className="text-muted-foreground">Our commitment to quality sets us apart</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={v.title} className="bg-card border border-border/50 p-6 rounded-xl text-center animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-serif text-base font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-foreground">
        <div className="container-custom text-center">
          <h2 className="font-serif text-3xl font-bold text-background mb-4">Ready to Start Your Project?</h2>
          <p className="text-background/60 mb-8 max-w-2xl mx-auto">
            Let us help you preserve your precious memories with a handcrafted frame made just for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products"><Button variant="gold" size="xl">Browse Products</Button></Link>
            <Link to="/contact"><Button variant="outline" size="xl" className="border-background/20 text-background hover:bg-background/10">Contact Us</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
