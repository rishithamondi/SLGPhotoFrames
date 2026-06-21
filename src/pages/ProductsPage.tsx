import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getWhatsAppUrl } from "@/config/site";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Search, SlidersHorizontal, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { products as staticProducts } from "@/data/products"; // Only used for deriving material filter list
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useProducts, useCategories } from "@/hooks/useCatalog";
import { useDebounce } from "@/hooks/use-debounce";

const materials = Array.from(new Set(staticProducts.flatMap((p) => p.materials))).sort();

type SortOption = "latest" | "price-low" | "price-high" | "popular";

export default function ProductsPage() {
  useDocumentTitle("Our Products");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [page, setPage] = useState(1);

  // Debounce rapid inputs
  const debouncedSearch = useDebounce(search, 500);
  const debouncedPriceRange = useDebounce(priceRange, 300);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, selectedMaterial, debouncedPriceRange, sortBy]);

  // Fetch Categories
  const { data: categories = [] } = useCategories();

  // Fetch Products with Server-Side Filtering
  const { data: productsData, isLoading, isError, error } = useProducts({
    search: debouncedSearch || undefined,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    material: selectedMaterial === "all" ? undefined : selectedMaterial,
    minPrice: debouncedPriceRange[0],
    maxPrice: debouncedPriceRange[1] < 5000 ? debouncedPriceRange[1] : undefined,
    sort: sortBy,
    limit: 12,
    page: page
  });

  const filteredProducts = productsData?.products || [];
  const totalPages = productsData?.pagination?.pages || 1;
  const currentPage = productsData?.pagination?.currentPage || 1;

  const clearFilters = () => {
    setSearch(""); 
    setSelectedCategory("all"); 
    setSelectedMaterial("all"); 
    setPriceRange([0, 5000]); 
    setSortBy("latest"); 
    setSearchParams({});
    setPage(1);
  };

  const hasActiveFilters = search || selectedCategory !== "all" || selectedMaterial !== "all" || priceRange[0] > 0 || priceRange[1] < 5000;

  const activeFilterCount = [search, selectedCategory !== "all", selectedMaterial !== "all", priceRange[0] > 0 || priceRange[1] < 5000].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-10 sm:py-12 md:py-16 border-b border-border/50">
        <div className="container-custom px-4 sm:px-6 text-center">
          <div className="section-divider mb-3 sm:mb-4" />
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Our Products
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-2">
            Browse our collection of handcrafted photo frames, lighting displays, and gift articles
          </p>
        </div>
      </section>

      <div className="container-custom px-4 sm:px-6 py-6 sm:py-8">
        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
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
                {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
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
              "fixed md:relative inset-y-0 left-0 z-40 md:z-auto bg-background md:bg-transparent w-[85vw] max-w-[320px] md:w-56 md:max-w-none shrink-0 p-6 pb-20 md:p-0 md:pb-0 overflow-y-auto transition-transform duration-300 md:translate-x-0 shadow-2xl md:shadow-none border-r border-border md:border-none",
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
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-4 sm:mb-5">
              {(() => {
                if (isLoading) return "Loading products...";
                if (!hasActiveFilters) return `Showing all ${productsData?.pagination?.total || filteredProducts.length} products`;
                
                let text = `Showing ${productsData?.pagination?.total || filteredProducts.length}`;
                
                if (selectedCategory !== "all") {
                  const catName = categories.find(c => c.id === selectedCategory)?.name || "Products";
                  text += ` ${catName}`;
                } else {
                  text += ` Products`;
                }
                
                if (search) text += ` matching "${search}"`;
                if (selectedMaterial !== "all") text += ` in ${selectedMaterial}`;
                
                return text;
              })()}
            </p>

            {isError ? (
              <div className="text-center py-12 sm:py-20 bg-destructive/10 border border-destructive/20 rounded-xl px-4 text-destructive">
                <AlertCircle className="h-10 w-10 mx-auto mb-4" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold mb-2">Error Loading Products</h2>
                <p className="text-sm max-w-md mx-auto">{error instanceof Error ? error.message : "Could not connect to the server."}</p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {filteredProducts.map((product, index) => (
                    <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${(index % 12) * 40}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-10">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : selectedCategory === "custom-orders" ? (
              <div className="text-center py-12 sm:py-20 bg-card border border-border/50 rounded-xl px-4">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">Custom Orders Coming Soon</h2>
                <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-xl mx-auto">
                  Personalized devotional frames, custom gift articles, wedding gifts, and special orders can be requested directly through WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
                  <a 
                    href={getWhatsAppUrl("Hi, I'm interested in a custom order. Can you share details?")} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button variant="gold" size="lg" className="w-full">WhatsApp Enquiry</Button>
                  </a>
                  <Link to="/contact" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full">Contact Us</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 sm:py-20">
                <p className="text-muted-foreground text-sm mb-4">No products found matching your criteria</p>
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
