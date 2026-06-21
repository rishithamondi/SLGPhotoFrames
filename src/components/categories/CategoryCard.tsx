import { Link } from "react-router-dom";
import { ArrowRight, ImageIcon } from "lucide-react";
import { Category } from "@/data/products";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const isPlaceholder = category.image === "/placeholder.svg";

  return (
    <Link
      to={`/products?category=${category.id}`}
      className={cn(
        "group relative block rounded-xl overflow-hidden card-sacred img-zoom",
        className
      )}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {isPlaceholder ? (
          // Placeholder for category image
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            <div className="text-center px-4">
              <p className="text-sm text-muted-foreground font-medium">{category.name}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">src/assets/category-{category.id}.jpg</p>
            </div>
          </div>
        ) : (
          <>
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        )}
      </div>

      <div className={cn(
        "absolute inset-0 flex flex-col justify-end p-5",
        isPlaceholder && "bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent"
      )}>
        <h3 className="font-serif text-lg font-semibold text-background mb-1 group-hover:translate-x-1 transition-transform duration-300">
          {category.name}
        </h3>
        <p className="text-sm text-background/70 line-clamp-1 mb-2 group-hover:text-background/90 transition-colors duration-300">
          {category.description}
        </p>
        {!isPlaceholder && (
          <div className="flex items-center gap-1 text-xs text-background/60 group-hover:text-accent transition-all duration-300">
            <span className="group-hover:translate-x-1 transition-transform duration-300">Explore</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-2 transition-transform duration-300" />
          </div>
        )}
      </div>
    </Link>
  );
}
