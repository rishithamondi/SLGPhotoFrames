import { Link } from "react-router-dom";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { useDocumentTitle } from "@/hooks/use-document-title";
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
  useDocumentTitle("Shop by Category");
  return (
    <div className="min-h-screen bg-background">
      <section className="py-10 sm:py-12 md:py-16 border-b border-border/50">
        <div className="container-custom px-4 sm:px-6 text-center">
          <div className="section-divider mb-3 sm:mb-4" />
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Shop by Category
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-2">
            Explore our diverse collection of handcrafted frames and gift items
          </p>
        </div>
      </section>

      <div className="container-custom px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categoriesWithImages.map((category, index) => (
            <div key={category.id} className="animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
              <CategoryCard category={category} className="h-full" />
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 bg-card border border-border/50 rounded-xl p-6 sm:p-8 md:p-10 text-center">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Looking for Something Special?</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6 max-w-xl mx-auto px-2">
            We specialize in custom frames made to your exact specifications.
          </p>
          <Link to="/contact" className="w-full sm:w-auto inline-block">
            <Button size="lg" className="w-full sm:w-auto">Request Custom Order</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
