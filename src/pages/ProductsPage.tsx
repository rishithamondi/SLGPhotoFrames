import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { products, categories } from "@/data/products";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const materials = ["Teak Wood", "Glass", "Resin", "Gold Leaf", "Acrylic", "Silver Plated Metal", "Crystal Glass", "Rosewood"];

type SortOption = "latest" | "price-low" | "price-high" | "popular";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.materials.some((m) => m.toLowerCase().includes(q)));
    }
    if (selectedCategory !== "all") result = result.filter((p) => p.category === selectedCategory);
    if (selectedMaterial !== "all") result = result.filter((p) => p.materials.some((m) => m.toLowerCase().includes(selectedMaterial.toLowerCase())));
    result = result.filter((p) => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]);
    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.basePrice - b.basePrice); break;
      case "price-high": result.sort((a, b) => b.basePrice - a.basePrice); break;
      case "popular": result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0)); break;
    }
    return result;
  }, [search, selectedCategory, selectedMaterial, priceRange, sortBy]);

  const clearFilters = () => {
    setSearch(""); setSelectedCategory("all"); setSelectedMaterial("all"); setPriceRange([0, 5000]); setSortBy("latest"); setSearchParams({});
  };

  const hasActiveFilters = search || selectedCategory !== "all" || selectedMaterial !== "all" || priceRange[0] > 0 || priceRange[1] < 5000;

  const activeFilterCount = [search, selectedCategory !== "all", selectedMaterial !== "all", priceRange[0] > 0 || priceRange[1] < 5000].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 md:py-16 border-b border-border/50">
        <div className="container-custom text-center">
          <div className="section-divider mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Our Products
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our collection of handcrafted photo frames, lighting displays, and gift articles
          </p>
        </div>
      </section>

      <div className="container-custom py-8">
        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card"
              aria-label="Search products"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full md:w-44 bg-card" aria-label="Sort products">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)} aria-label="Toggle filters">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {categories.find(c => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory("all")} aria-label="Remove category filter"><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedMaterial !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {selectedMaterial}
                <button onClick={() => setSelectedMaterial("all")} aria-label="Remove material filter"><X className="h-3 w-3" /></button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 5000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                ₹{priceRange[0]} - ₹{priceRange[1]}
                <button onClick={() => setPriceRange([0, 5000])} aria-label="Remove price filter"><X className="h-3 w-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside
            className={cn(
              "fixed md:relative inset-0 z-40 md:z-auto bg-background md:bg-transparent w-full md:w-56 shrink-0 p-6 md:p-0 overflow-auto transition-transform duration-300 md:translate-x-0",
              showFilters ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}
          >
            <div className="flex items-center justify-between mb-6 md:hidden">
              <h2 className="font-serif text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Category</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={cn("block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", selectedCategory === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground")}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn("block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground")}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Material</h3>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger className="bg-card" aria-label="Filter by material">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Materials</SelectItem>
                    {materials.map((m) => (
                      <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Price Range</h3>
                <Slider value={priceRange} onValueChange={setPriceRange} max={5000} step={100} className="mb-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full" size="sm">
                  Clear All Filters
                </Button>
              )}
            </div>

            <div className="mt-6 md:hidden">
              <Button onClick={() => setShowFilters(false)} className="w-full">
                Show {filteredProducts.length} Products
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-5">
              {filteredProducts.length} of {products.length} products
            </p>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 40}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No products found matching your criteria</p>
                <Button variant="outline" onClick={clearFilters} size="sm">Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 bg-foreground/30 z-30 md:hidden" onClick={() => setShowFilters(false)} />
      )}
    </div>
  );
}
