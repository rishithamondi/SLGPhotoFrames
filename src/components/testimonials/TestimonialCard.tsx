import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: {
    id: string;
    name: string;
    location: string;
    rating: number;
    text: string;
    image: string;
  };
  className?: string;
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <div className={cn("bg-card border border-border/50 p-6 rounded-xl relative", className)}>
      <Quote className="absolute top-4 right-4 h-6 w-6 text-accent/20" />

      {/* Rating */}
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < testimonial.rating ? "fill-accent text-accent" : "text-muted"
            )}
          />
        ))}
      </div>

      <p className="text-foreground/80 text-sm leading-relaxed mb-5">
        "{testimonial.text}"
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground">
            {testimonial.name.split(" ").map(n => n[0]).join("")}
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
}
