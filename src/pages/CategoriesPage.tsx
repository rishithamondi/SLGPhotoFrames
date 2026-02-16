import { Link } from "react-router-dom";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { categories } from "@/data/products";
import { Button } from "@/components/ui/button";

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

const categoriesWithImages = categories.map((cat) => ({
  ...cat,
  image: categoryImages[cat.id] || cat.image,
}));

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 md:py-16 border-b border-border/50">
        <div className="container-custom text-center">
          <div className="section-divider mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Shop by Category
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our diverse collection of handcrafted frames and gift items
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoriesWithImages.map((category, index) => (
            <div key={category.id} className="animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
              <CategoryCard category={category} className="h-full" />
            </div>
          ))}
        </div>

        <div className="mt-12 bg-card border border-border/50 rounded-xl p-8 md:p-10 text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Looking for Something Special?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm">
            We specialize in custom frames made to your exact specifications.
          </p>
          <Link to="/contact">
            <Button size="lg">Request Custom Order</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
