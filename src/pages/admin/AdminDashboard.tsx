import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/useCatalog";
import { 
  useAdminStats, 
  useAdminProducts, 
  useCreateAdminProduct, 
  useUpdateAdminProduct, 
  useDeleteAdminProduct, 
  useUploadAdminImage,
  useGenerateProductDetailsAI
} from "@/hooks/useAdminCatalog";
import { Product } from "@/types/api";
import { getProductCardImage, getProductThumbnailImage } from "@/lib/cloudinary";
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  Search, 
  LogOut, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Edit, 
  X, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Upload,
  SlidersHorizontal,
  RefreshCw,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MATERIAL_GROUPS = {
  "WOOD": ["Teak Wood", "MDF Wood", "Premium Wood", "Decorative Wood"],
  "GLASS": ["Premium Glass", "Tempered Glass", "Acrylic Glass"],
  "METAL & FOIL": ["Gold Foil", "999 Silver Plated", "Metal Finish"],
  "LIGHTING": ["LED Lighting Panel"],
  "CUSTOMIZATION": ["Custom Artwork", "Decorative Border", "Resin Finish"]
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, isAuthenticated, isLoading: isAuthLoading, logout } = useAdmin();
  const { data: categoriesData } = useCategories();
  
  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Protect route
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Dashboard Tabs: 'overview' | 'products'
  const [activeTab, setActiveTab] = useState<"overview" | "products">("overview");

  // Collapsible Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter & Pagination States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  // Queries
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useAdminStats({ enabled: isAuthenticated });
  const { data: productsData, isLoading: isProductsLoading, refetch: refetchProducts } = useAdminProducts({
    page,
    limit: 10,
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    status: status !== "all" ? status : undefined,
  }, { enabled: isAuthenticated });

  // Mutations
  const createProductMutation = useCreateAdminProduct();
  const updateProductMutation = useUpdateAdminProduct();
  const deleteProductMutation = useDeleteAdminProduct();
  const uploadImageMutation = useUploadAdminImage();
  const generateProductDetailsAIMutation = useGenerateProductDetailsAI();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  // --- CRUD Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // null means "Create" mode

  // Form Fields
  const [smallTitle, setSmallTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [customizable, setCustomizable] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [handmade, setHandmade] = useState(false);
  const [frameType, setFrameType] = useState("");
  const [orientation, setOrientation] = useState("Portrait");
  const [materials, setMaterials] = useState("");
  const [tags, setTags] = useState("");
  const [productStatus, setProductStatus] = useState("published");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Product Images & Sizes
  const [images, setImages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, { checked: boolean; price: string }>>({
    "6x8": { checked: false, price: "" },
    "8x10": { checked: false, price: "" },
    "10x12": { checked: false, price: "" },
    "12x16": { checked: false, price: "" },
  });

  // Trigger form population for Edit mode
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSmallTitle(product.smallTitle || "");
    setName(product.name || "");
    setDescription(product.description || "");
    setShortDescription(product.shortDescription || "");
    setCategoryId(product.category || "");
    setBasePrice(product.basePrice?.toString() || "");
    setDisplayOrder(product.displayOrder?.toString() || "0");
    setCustomizable(product.customizable || false);
    setFeatured(product.featured || false);
    setPopular(product.popular || false);
    setHandmade(product.handmade || false);
    setFrameType(product.frameType || "");
    setOrientation(product.orientation || "Portrait");
    setMaterials(product.materials?.join(", ") || "");
    setTags(product.tags?.join(", ") || "");
    setProductStatus(product.status || "draft");
    setSeoTitle(product.seoTitle || "");
    setSeoDescription(product.seoDescription || "");
    setImages(product.images || []);
    setShowAdvanced(false); // Collapsed by default

    // Map sizes
    const sizeMap: Record<string, { checked: boolean; price: string }> = {
      "6x8": { checked: false, price: "" },
      "8x10": { checked: false, price: "" },
      "10x12": { checked: false, price: "" },
      "12x16": { checked: false, price: "" },
    };

    if (product.sizes) {
      product.sizes.forEach((sz) => {
        const key = sz.name.split(" ")[0];
        if (sizeMap[key]) {
          sizeMap[key] = { checked: true, price: sz.price.toString() };
        } else {
          sizeMap[sz.name] = { checked: true, price: sz.price.toString() };
        }
      });
    }
    setSelectedSizes(sizeMap);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setSmallTitle("");
    setName("");
    setDescription("");
    setShortDescription("");
    setCategoryId(categoriesData?.[0]?.id || "");
    setBasePrice("");
    setDisplayOrder("0");
    setCustomizable(false);
    setFeatured(false);
    setPopular(false);
    setHandmade(false);
    setFrameType("");
    setOrientation("Portrait");
    setMaterials("");
    setTags("");
    setProductStatus("published");
    setSeoTitle("");
    setSeoDescription("");
    setImages([]);
    setShowAdvanced(false); // Collapsed by default
    setSelectedSizes({
      "6x8": { checked: false, price: "" },
      "8x10": { checked: false, price: "" },
      "10x12": { checked: false, price: "" },
      "12x16": { checked: false, price: "" },
    });
    setIsModalOpen(true);
  };

  // --- Size price multipliers relative to starting size 6x8 ---
  const sizeMultipliers: Record<string, number> = {
    "6x8": 1.0,
    "8x10": 1.25,
    "10x12": 1.50,
    "12x16": 1.85
  };

  // --- Size Checkbox Helpers ---
  const handleSizeCheckboxChange = (sizeKey: string, checked: boolean) => {
    setSelectedSizes(prev => {
      const updated = { ...prev };
      const baseNum = parseFloat(basePrice) || 0;
      const multiplier = sizeMultipliers[sizeKey] || 1.0;
      const autoPrice = baseNum ? Math.round(baseNum * multiplier).toString() : "";
      updated[sizeKey] = {
        checked,
        price: checked ? (updated[sizeKey]?.price || autoPrice) : ""
      };
      return updated;
    });
  };

  const handleSizePriceChange = (sizeKey: string, price: string) => {
    setSelectedSizes(prev => {
      const updated = { ...prev };
      if (updated[sizeKey]) {
        updated[sizeKey].price = price;
      }
      return updated;
    });
  };

  // Auto-fill and scale size prices when base price changes
  const handleBasePriceChange = (val: string) => {
    setBasePrice(val);
    const baseNum = parseFloat(val) || 0;
    setSelectedSizes(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (updated[key].checked) {
          const multiplier = sizeMultipliers[key] || 1.0;
          updated[key].price = baseNum ? Math.round(baseNum * multiplier).toString() : "";
        }
      });
      return updated;
    });
  };

  // Material toggle helper to update materials comma-separated string
  const handleMaterialToggle = (material: string) => {
    const currentList = materials
      ? materials.split(",").map(m => m.trim()).filter(m => m !== "")
      : [];
    let newList: string[];
    if (currentList.includes(material)) {
      newList = currentList.filter(m => m !== material);
    } else {
      newList = [...currentList, material];
    }
    setMaterials(newList.join(", "));
  };

  // --- Image Upload Handler ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[Save Flow] Step 2: Image selection changed in handleImageUpload");
    const file = e.target.files?.[0];
    if (!file) {
      console.log("[Save Flow] Step 2.1: No file selected in handleImageUpload");
      return;
    }

    console.log("[Save Flow] Step 2.2: Dispatching uploadImageMutation for file:", file.name);
    const promise = uploadImageMutation.mutateAsync(file);
    toast.promise(promise, {
      loading: "Uploading product image...",
      success: (data) => {
        console.log("[Save Flow] Step 2.3: uploadImageMutation success, url:", data.imageUrl);
        setImages([data.imageUrl]); // Support single main image workflow
        return "Image uploaded successfully!";
      },
      error: (err) => {
        console.error("[Save Flow] Step 2.4: uploadImageMutation failed:", err);
        return err.message || "Failed to upload image";
      }
    });
  };

  // --- Form Submission ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Save Flow] Step 1: Save Product clicked");

    if (!smallTitle) {
      console.log("[Save Flow] Step 1.1: Validation failed - smallTitle missing");
      toast.error("Small Title is required");
      return;
    }
    if (!categoryId) {
      console.log("[Save Flow] Step 1.2: Validation failed - categoryId missing");
      toast.error("Category is required");
      return;
    }
    if (!basePrice || isNaN(parseFloat(basePrice))) {
      console.log("[Save Flow] Step 1.3: Validation failed - basePrice invalid");
      toast.error("A valid base price is required");
      return;
    }

    console.log("[Save Flow] Step 1.4: Validation passed, formatting payload");
    // Format materials & tags
    const formattedMaterials = materials
      ? materials.split(",").map(m => m.trim()).filter(m => m !== "")
      : [];
    const formattedTags = tags
      ? tags.split(",").map(t => t.trim()).filter(t => t !== "")
      : [];

    // Format sizes
    const sizeList = Object.entries(selectedSizes)
      .filter(([_, data]) => data.checked)
      .map(([key, data]) => ({
        name: key === "6x8" || key === "8x10" || key === "10x12" || key === "12x16" ? `${key} inches` : key,
        price: parseFloat(data.price) || parseFloat(basePrice) || 0,
      }));

    const payload = {
      smallTitle,
      name: name || smallTitle,
      description,
      shortDescription: shortDescription || description.slice(0, 150),
      categoryId,
      basePrice: parseFloat(basePrice),
      displayOrder: parseInt(displayOrder) || 0,
      customizable,
      featured,
      popular,
      handmade,
      frameType: frameType || null,
      orientation,
      materials: formattedMaterials,
      tags: formattedTags,
      status: productStatus,
      seoTitle: seoTitle || `${smallTitle} | SLG Photo Frames`,
      seoDescription: seoDescription || description.slice(0, 155),
      sizes: sizeList,
      images,
    };

    console.log("[Save Flow] Step 1.5: Payload prepared:", JSON.stringify(payload));

    try {
      if (editingProduct) {
        console.log("[Save Flow] Step 1.6: Triggering updateProductMutation (Edit mode) for ID:", editingProduct.id);
        const updateResult = await updateProductMutation.mutateAsync({ id: editingProduct.id, productData: payload });
        console.log("[Save Flow] Step 1.7: updateProductMutation completed successfully:", JSON.stringify(updateResult));
        toast.success("Product updated successfully!");
      } else {
        console.log("[Save Flow] Step 1.6: Triggering createProductMutation (Create mode)");
        const createResult = await createProductMutation.mutateAsync(payload);
        console.log("[Save Flow] Step 1.7: createProductMutation completed successfully:", JSON.stringify(createResult));
        toast.success("Product created successfully!");
      }
      console.log("[Save Flow] Step 1.8: Closing modal and refreshing listings");
      setIsModalOpen(false);
      refetchStats();
      refetchProducts();
    } catch (err) {
      console.error("[Save Flow] Step 1.9: Save failed in catch block:", err);
      const error = err as Error;
      toast.error(error.message || "Failed to save product.");
    }
  };

  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string; isAlreadyInactive?: boolean } | null>(null);

  const confirmDelete = async (permanent: boolean) => {
    if (!productToDelete) return;
    try {
      await deleteProductMutation.mutateAsync({ id: productToDelete.id, permanent });
      toast.success(permanent ? `"${productToDelete.title}" has been permanently deleted.` : `"${productToDelete.title}" has been deactivated.`);
      setProductToDelete(null);
      refetchStats();
      refetchProducts();
    } catch (err) {
      console.error(err);
      const error = err as Error;
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleAIGenerate = async () => {
    if (!smallTitle) {
      toast.error("Please enter a Small Title first.");
      return;
    }

    const sizeList = Object.entries(selectedSizes)
      .filter(([_, data]) => data.checked)
      .map(([key, data]) => ({
        name: key === "6x8" || key === "8x10" || key === "10x12" || key === "12x16" ? `${key} inches` : key,
        price: parseFloat(data.price) || parseFloat(basePrice) || 0,
      }));

    const categoryName = categoryId ? (categoriesData?.find(c => c.id === categoryId)?.name || "Unknown") : "Unknown";

    // Frontend Debug Log: Before request
    console.log("Generating AI details", { title: smallTitle, category: categoryName, materials });

    try {
      const data = await generateProductDetailsAIMutation.mutateAsync({
        smallTitle,
        category: categoryName,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        sizes: sizeList,
        materials,
      });
      
      // Frontend Debug Log: After response
      console.log("AI Response", data);

      // Frontend Debug Log: Before state update
      console.log("Updating form with", data);

      if (data.fullName) setName(data.fullName);
      if (data.frameType) setFrameType(data.frameType);
      if (data.description) setDescription(data.description);
      if (data.shortDescription) setShortDescription(data.shortDescription);
      if (data.seoTitle) setSeoTitle(data.seoTitle);
      if (data.seoDescription) setSeoDescription(data.seoDescription);
      if (data.tags) {
        setTags(Array.isArray(data.tags) ? data.tags.join(", ") : data.tags);
      }
      if (typeof data.featured === 'boolean') setFeatured(data.featured);
      if (typeof data.popular === 'boolean') setPopular(data.popular);
      if (typeof data.handmade === 'boolean') setHandmade(data.handmade);
      
      setShowAdvanced(true);
      
      // Frontend Debug Log: After state update
      console.log("Form state updated");
      
      toast.success("AI Generation Complete! Please review the details.");
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Failed to generate details. Make sure Gemini API Key is set.");
    }
  };


  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isAuthLoading) {
    return null;
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* Sticky Mobile Header Bar */}
      <div className="flex md:hidden items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Package className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-sm leading-none text-gradient">SLG Frames</h1>
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-semibold">Inventory Panel</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileSidebarOpen(true)}
          aria-label="Open sidebar"
          className="h-9 w-9 text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden" 
          onClick={() => setIsMobileSidebarOpen(false)} 
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "bg-card border-r border-border flex flex-col justify-between shrink-0 transition-transform duration-300 z-50",
          // Desktop styles
          "md:translate-x-0 md:w-64 md:h-screen md:sticky md:top-0",
          // Mobile styles (overlay drawer)
          "fixed inset-y-0 left-0 w-64 transform md:relative md:transform-none",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-border flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-base leading-none text-gradient">SLG Frames</h1>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Inventory Panel</span>
              </div>
            </div>
            {/* Close button inside sidebar on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 text-muted-foreground"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Menu Items */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => {
                setActiveTab("overview");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "overview" 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("products");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "products" 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Package className="w-4 h-4" />
              Manage Products
            </button>
          </nav>
        </div>

        {/* User / Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-secondary/40 rounded-xl border border-border/40">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
              {admin?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-foreground">{admin?.email}</p>
              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Business Owner</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              logout();
            }}
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 bg-background h-full">
        
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {activeTab === "overview" ? "Dashboard Overview" : "Inventory Catalog"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeTab === "overview" 
                ? "At-a-glance store performance stats and recent additions."
                : "Search, filter, edit, or de-activate store products."}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={openCreateModal}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2.5 rounded-xl shadow-gold transition-all flex items-center gap-2 hover-lift"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Card className="temple-card bg-card border-border shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Products</CardTitle>
                  <Package className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isStatsLoading ? (
                    <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    <div className="text-3xl font-extrabold font-serif text-foreground">{stats?.totalProducts}</div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">Total items registered in database</p>
                </CardContent>
              </Card>

              <Card className="temple-card bg-card border-border shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Products</CardTitle>
                  <CheckCircle className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isStatsLoading ? (
                    <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    <div className="text-3xl font-extrabold font-serif text-primary">{stats?.activeProducts}</div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">Published items visible to customers</p>
                </CardContent>
              </Card>

              <Card className="temple-card bg-card border-border shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</CardTitle>
                  <FileText className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isStatsLoading ? (
                    <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    <div className="text-3xl font-extrabold font-serif text-foreground">{stats?.categoriesCount}</div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">Active inventory categories seeded</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recently Added Table */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-lg font-serif font-bold text-foreground">Recently Added Products</h3>
                <Card className="border-border bg-card overflow-hidden shadow-lg rounded-2xl">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-muted-foreground w-16">Preview</TableHead>
                          <TableHead className="text-muted-foreground">Small Title</TableHead>
                          <TableHead className="text-muted-foreground">Price</TableHead>
                          <TableHead className="text-muted-foreground">Status</TableHead>
                          <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isStatsLoading ? (
                          Array.from({ length: 3 }).map((_, idx) => (
                            <TableRow key={idx} className="border-border">
                              <TableCell><div className="w-10 h-10 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                              <TableCell className="text-right"><div className="h-8 w-16 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : stats?.recentlyAdded?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No products found. Click "Add Product" to get started!
                            </TableCell>
                          </TableRow>
                        ) : (
                          stats?.recentlyAdded?.map((prod) => (
                            <TableRow key={prod.id} className="border-border hover:bg-muted/30 transition-colors">
                              <TableCell>
                                <img 
                                  src={getProductThumbnailImage(prod.imageUrl)} 
                                  alt={prod.smallTitle} 
                                  className="w-10 h-10 object-cover rounded border border-border"
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </TableCell>
                              <TableCell className="font-semibold text-foreground">{prod.smallTitle}</TableCell>
                              <TableCell className="font-medium text-foreground">₹{prod.basePrice}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    prod.status === 'published' ? 'bg-primary/10 text-primary border-primary/20' :
                                    prod.status === 'draft' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    'bg-muted text-muted-foreground border-border'
                                  }
                                >
                                  {prod.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/admin/products/${prod.id}`, {
                                        headers: {
                                          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
                                        }
                                      });
                                      const data = await response.json();
                                      openEditModal(data);
                                    } catch (e) {
                                      toast.error("Failed to load product details");
                                    }
                                  }}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary hover:text-primary-foreground hover:bg-primary"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>

              {/* Quick Actions Panel */}
              <div className="space-y-3">
                <h3 className="text-lg font-serif font-bold text-foreground">Quick Actions</h3>
                <Card className="border-border bg-card p-5 space-y-3 shadow-lg rounded-2xl">
                  <p className="text-xs text-muted-foreground">Common administrative actions to quickly manage items:</p>
                  
                  <Button 
                    onClick={openCreateModal}
                    className="w-full justify-start gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2.5 shadow-gold hover-lift"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Product
                  </Button>

                  <Button 
                    onClick={() => setActiveTab("products")}
                    variant="outline"
                    className="w-full justify-start gap-3 border-border hover:bg-secondary text-foreground rounded-xl py-2.5"
                  >
                    <Package className="w-4 h-4" />
                    Manage Catalog Listing
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Shortcuts</h4>
                    <div className="text-xs text-muted-foreground space-y-1.5 font-mono">
                      <p>✨ Slugs auto-generate from title</p>
                      <p>✨ Soft deletes mark status as 'inactive'</p>
                      <p>✨ De-activated items hide from public site</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === "products" && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-center bg-card p-4 rounded-2xl border border-border shadow-md">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl"
                />
              </div>

              {/* Category Filter */}
              <div className="w-full md:w-48">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-background border-border text-foreground rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoriesData?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-40">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-background border-border text-foreground rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="inactive">Inactive (Deleted)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Catalog Grid Table */}
            <Card className="border-border bg-card overflow-hidden shadow-xl rounded-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground w-16">Preview</TableHead>
                      <TableHead className="text-muted-foreground">Small Title</TableHead>
                      <TableHead className="text-muted-foreground">Category</TableHead>
                      <TableHead className="text-muted-foreground">Base Price</TableHead>
                      <TableHead className="text-muted-foreground">Sizes</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isProductsLoading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <TableRow key={idx} className="border-border">
                          <TableCell><div className="w-10 h-10 bg-muted rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-36 bg-muted rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-28 bg-muted rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                          <TableCell className="text-right"><div className="h-8 w-20 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : productsData?.products?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          No products match your search criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      productsData?.products?.map((prod) => (
                        <TableRow key={prod.id} className="border-border hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <img 
                              src={getProductThumbnailImage(prod.images?.[0] || '/placeholder.svg')} 
                              alt={prod.smallTitle} 
                              className="w-10 h-10 object-cover rounded border border-border"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                              loading="lazy"
                              decoding="async"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-foreground">{prod.smallTitle}</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[200px] font-mono">{prod.slug}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {categoriesData?.find(c => c.id === prod.category)?.name || prod.category}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">₹{prod.basePrice}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {prod.sizes?.map((s: { name: string; price: number }, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-background text-muted-foreground border-border text-[9px] py-0 px-1">
                                  {s.name.split(" ")[0]}: ₹{s.price}
                                </Badge>
                              )) || <span className="text-xs text-muted-foreground">No sizes</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                prod.status === 'published' ? 'bg-primary/10 text-primary border-primary/20' :
                                prod.status === 'draft' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                prod.status === 'inactive' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                'bg-muted text-muted-foreground border-border'
                              }
                            >
                              {prod.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5 font-sans">
                              <Button
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/admin/products/${prod.id}`, {
                                      headers: {
                                        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
                                      }
                                    });
                                    const data = await response.json();
                                    openEditModal(data);
                                  } catch (e) {
                                    toast.error("Failed to load product details");
                                  }
                                }}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary-foreground hover:bg-primary"
                                title="Edit product"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {prod.status === 'inactive' ? (
                                <>
                                  <Button
                                    onClick={async () => {
                                      try {
                                        await updateProductMutation.mutateAsync({
                                          id: prod.id!,
                                          productData: { status: 'published' }
                                        });
                                        toast.success(`"${prod.smallTitle}" has been restored to Published status.`);
                                        refetchStats();
                                        refetchProducts();
                                      } catch (err) {
                                        toast.error("Failed to restore product");
                                      }
                                    }}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-500 hover:text-white hover:bg-emerald-500"
                                    title="Restore Product"
                                  >
                                    <RefreshCw className="w-4 h-4 animate-spin-hover" />
                                  </Button>
                                  <Button
                                    onClick={() => setProductToDelete({ id: prod.id!, title: prod.smallTitle!, isAlreadyInactive: true })}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-white hover:bg-destructive"
                                    title="Permanently Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  onClick={() => setProductToDelete({ id: prod.id!, title: prod.smallTitle!, isAlreadyInactive: false })}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-white hover:bg-destructive/10"
                                  title="Soft delete (Deactivate)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Pagination Controls */}
            {productsData && productsData.pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Showing page {productsData.pagination.currentPage} of {productsData.pagination.pages} ({productsData.pagination.total} total items)
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="border-border text-xs px-3 py-1 bg-card hover:bg-secondary text-foreground"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage(p => Math.min(productsData.pagination.pages, p + 1))}
                    disabled={page === productsData.pagination.pages}
                    variant="outline"
                    className="border-border text-xs px-3 py-1 bg-card hover:bg-secondary text-foreground"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- UNIFIED ADD / EDIT MODAL --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-[92vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-2xl shadow-gold">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-xl font-serif font-bold text-gradient">
                {editingProduct ? `Edit Product: ${editingProduct.smallTitle}` : "Create New Product"}
              </DialogTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Fill in basic details to list a product. Advanced settings are optional and collapsible.
              </CardDescription>
            </DialogHeader>

            <form onSubmit={handleSaveProduct} className="space-y-5 pt-3">
              
              {/* Product Image Section */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider block font-semibold">Product Image *</Label>
                
                {/* File Upload Hidden Input */}
                <input
                  id="product-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {images.length === 0 ? (
                  /* Empty state dropzone */
                  <div 
                    onClick={() => document.getElementById("product-file-upload")?.click()}
                    className="border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-secondary/10 flex flex-col items-center justify-center gap-2 group hover-lift"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-foreground">Upload Product Image</span>
                    <span className="text-xs text-muted-foreground">Select photo (JPEG, PNG, WEBP). Max 5MB.</span>
                  </div>
                ) : (
                  /* Uploaded preview box */
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-secondary/20 p-4 rounded-xl border border-border">
                    <div className="relative w-28 h-28 border border-border rounded-lg overflow-hidden shrink-0 bg-background flex items-center justify-center">
                      <img 
                        src={getProductCardImage(images[0])} 
                        alt="Product preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                        loading="lazy"
                        decoding="async"
                      />
                      <Badge className="absolute top-1 left-1 text-[8px] bg-primary text-primary-foreground py-0.5 px-1 font-mono uppercase">
                        Active Image
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="font-semibold text-sm text-foreground">Saved Product Image</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">{images[0]}</div>
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("product-file-upload")?.click()}
                          className="h-8 border-border text-xs text-foreground hover:bg-secondary rounded-lg flex items-center gap-1.5"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-primary" />
                          Replace Image
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setImages([])}
                          className="h-8 text-destructive hover:bg-destructive/5 text-xs rounded-lg flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Small Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="modal-smallTitle" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Small Title *</Label>
                  <Input
                    id="modal-smallTitle"
                    value={smallTitle}
                    onChange={(e) => setSmallTitle(e.target.value)}
                    placeholder="e.g. Lord Balaji Gold Frame"
                    required
                    className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="modal-category" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="bg-background border-border text-foreground rounded-xl text-sm">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {categoriesData?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Base Price */}
                <div className="space-y-1.5 md:col-span-3">
                  <Label htmlFor="modal-basePrice" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Base Price (₹) *</Label>
                  <Input
                    id="modal-basePrice"
                    type="number"
                    value={basePrice}
                    onChange={(e) => handleBasePriceChange(e.target.value)}
                    placeholder="e.g. 169"
                    required
                    className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">Sets starting price. Autofills active sizes below.</p>
                </div>
              </div>

              {/* Sparkles AI Details Generator Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={generateProductDetailsAIMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-500 via-primary to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-primary-foreground font-medium py-2 rounded-xl shadow-gold flex items-center justify-center gap-2 group transition-all duration-300 hover-lift text-sm"
                >
                  {generateProductDetailsAIMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 text-amber-100 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 text-amber-100 group-hover:animate-spin" /> Generate Product Details (AI)</>
                  )}
                </Button>
              </div>

              {/* Available Sizes Section */}
              <div className="space-y-2.5 bg-secondary/20 p-4 rounded-xl border border-border">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider block font-semibold">Available Sizes & Custom Prices</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(selectedSizes).map((sizeKey) => {
                    const labelName = sizeKey === "6x8" ? "6×8 inches" : 
                                      sizeKey === "8x10" ? "8×10 inches" :
                                      sizeKey === "10x12" ? "10×12 inches" :
                                      sizeKey === "12x16" ? "12×16 inches" : `${sizeKey} inches`;
                    return (
                      <div key={sizeKey} className="flex items-center justify-between bg-card p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            id={`size-${sizeKey}`}
                            checked={selectedSizes[sizeKey].checked}
                            onCheckedChange={(checked) => handleSizeCheckboxChange(sizeKey, !!checked)}
                            className="border-border text-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                          <Label htmlFor={`size-${sizeKey}`} className="text-sm font-semibold text-foreground cursor-pointer">
                            {labelName}
                          </Label>
                        </div>
                        
                        {selectedSizes[sizeKey].checked && (
                          <div className="flex items-center gap-1 w-28">
                            <span className="text-xs text-muted-foreground">₹</span>
                            <Input
                              type="number"
                              placeholder="Price"
                              value={selectedSizes[sizeKey].price}
                              onChange={(e) => handleSizePriceChange(sizeKey, e.target.value)}
                              className="h-8 bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded text-xs px-2"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Toggles Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="flex items-center justify-between bg-secondary/10 p-3 rounded-xl border border-border/60">
                  <Label htmlFor="toggle-customizable" className="text-xs text-muted-foreground font-semibold cursor-pointer">Customizable</Label>
                  <Switch
                    id="toggle-customizable"
                    checked={customizable}
                    onCheckedChange={setCustomizable}
                    className="scale-90 data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between bg-secondary/10 p-3 rounded-xl border border-border/60">
                  <Label htmlFor="toggle-featured" className="text-xs text-muted-foreground font-semibold cursor-pointer">Featured</Label>
                  <Switch
                    id="toggle-featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                    className="scale-90 data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between bg-secondary/10 p-3 rounded-xl border border-border/60">
                  <Label htmlFor="toggle-popular" className="text-xs text-muted-foreground font-semibold cursor-pointer">Popular</Label>
                  <Switch
                    id="toggle-popular"
                    checked={popular}
                    onCheckedChange={setPopular}
                    className="scale-90 data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between bg-secondary/10 p-3 rounded-xl border border-border/60">
                  <Label htmlFor="toggle-handmade" className="text-xs text-muted-foreground font-semibold cursor-pointer">Handmade</Label>
                  <Switch
                    id="toggle-handmade"
                    checked={handmade}
                    onCheckedChange={setHandmade}
                    className="scale-90 data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              {/* COLLAPSIBLE ADVANCED SETTINGS TRIGGER */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between border-dashed border-primary/30 hover:border-primary/60 text-primary py-2.5 rounded-xl transition-all"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                    <SlidersHorizontal className="w-4 h-4" />
                    {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings (Full Name, Materials, SEO, etc.)"}
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {/* COLLAPSIBLE ADVANCED FIELDS */}
              {showAdvanced && (
                <div className="space-y-4 p-4 rounded-xl bg-secondary/10 border border-border/40 animate-fade-in">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Full Name (Alternate) */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="modal-name" className="text-muted-foreground text-xs uppercase tracking-wider">Full Name (Alternate)</Label>
                      <Input
                        id="modal-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Gold Plated Lord Balaji Pooja Frame"
                        className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                      />
                    </div>

                    {/* Orientation */}
                    <div className="space-y-1.5">
                      <Label htmlFor="modal-orientation" className="text-muted-foreground text-xs uppercase tracking-wider">Orientation</Label>
                      <Select value={orientation} onValueChange={setOrientation}>
                        <SelectTrigger className="bg-background border-border text-foreground rounded-xl text-sm">
                          <SelectValue placeholder="Orientation" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          <SelectItem value="Portrait">Portrait</SelectItem>
                          <SelectItem value="Landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Frame Type */}
                    <div className="space-y-1.5 sm:col-span-1">
                      <Label htmlFor="modal-frameType" className="text-muted-foreground text-xs uppercase tracking-wider">Frame Type</Label>
                      <Input
                        id="modal-frameType"
                        value={frameType}
                        onChange={(e) => setFrameType(e.target.value)}
                        placeholder="e.g. Teak Wood"
                        className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                      />
                    </div>

                    {/* Status Dropdown */}
                    <div className="space-y-1.5">
                      <Label htmlFor="modal-status" className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                      <Select value={productStatus} onValueChange={setProductStatus}>
                        <SelectTrigger className="bg-background border-border text-foreground rounded-xl text-sm">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Display Order (Moved to Advanced Settings) */}
                    <div className="space-y-1.5">
                      <Label htmlFor="modal-displayOrder" className="text-muted-foreground text-xs uppercase tracking-wider">Display Order</Label>
                      <Input
                        id="modal-displayOrder"
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(e.target.value)}
                        placeholder="0"
                        className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Materials selection chips */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Materials</Label>
                    <div className="bg-secondary/10 p-4 rounded-xl border border-border/40 space-y-4">
                      {Object.entries(MATERIAL_GROUPS).map(([groupName, items]) => {
                        const currentMaterialsList = materials
                          ? materials.split(",").map(m => m.trim()).filter(m => m !== "")
                          : [];
                        return (
                          <div key={groupName} className="space-y-1.5">
                            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{groupName}</h5>
                            <div className="flex flex-wrap gap-2">
                              {items.map((item) => {
                                const isSelected = currentMaterialsList.includes(item);
                                return (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() => handleMaterialToggle(item)}
                                    className={cn(
                                      "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer shadow-sm",
                                      isSelected
                                        ? "bg-primary text-primary-foreground border-primary shadow-gold/25"
                                        : "border-primary/30 text-muted-foreground hover:border-primary/60 hover:text-foreground bg-transparent"
                                    )}
                                  >
                                    {isSelected ? `✓ ${item}` : item}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-tags" className="text-muted-foreground text-xs uppercase tracking-wider">Tags (Comma Separated)</Label>
                    <Input
                      id="modal-tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="devotional, featured, gift"
                      className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-description" className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
                    <Textarea
                      id="modal-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detailed description of the product..."
                      rows={4}
                      className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-shortDescription" className="text-muted-foreground text-xs uppercase tracking-wider">Short Description (Summary)</Label>
                    <Textarea
                      id="modal-shortDescription"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Short catalog summary description..."
                      rows={2}
                      className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                    />
                  </div>

                  {/* SEO Block */}
                  <div className="space-y-4 pt-2 border-t border-border">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Search Engine Optimization (SEO)</h4>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="modal-seoTitle" className="text-muted-foreground text-xs uppercase tracking-wider">SEO Meta Title</Label>
                      <Input
                        id="modal-seoTitle"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Meta Title..."
                        className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="modal-seoDescription" className="text-muted-foreground text-xs uppercase tracking-wider">SEO Meta Description</Label>
                      <Textarea
                        id="modal-seoDescription"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Meta Description..."
                        rows={2}
                        className="bg-background border-border text-foreground focus:border-primary focus-visible:ring-primary rounded-xl text-sm"
                      />
                    </div>
                  </div>

                </div>
              )}

              <DialogFooter className="border-t border-border pt-4">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="ghost"
                  className="border border-border hover:bg-secondary text-foreground rounded-xl"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl px-5 shadow-gold hover-lift"
                >
                  {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    "Save Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* --- DELETE CONFIRMATION MODAL --- */}
        <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
          <DialogContent className="bg-card text-foreground border-border w-[92vw] sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Delete Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm text-muted-foreground">
              <p>You are about to delete <strong>{productToDelete?.title}</strong>.</p>
              {productToDelete?.isAlreadyInactive ? (
                <>
                  <p className="text-destructive font-semibold">This product is already inactive. This action will permanently remove it from the database and cannot be undone.</p>
                  <div className="pt-2">
                    <Button 
                      variant="destructive" 
                      className="w-full h-auto py-3 font-semibold text-white bg-destructive hover:bg-destructive/90"
                      onClick={() => confirmDelete(true)}
                      disabled={deleteProductMutation.isPending}
                    >
                      Permanently Delete From Database
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p>How would you like to proceed?</p>
                  <div className="space-y-3 pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 h-auto py-3"
                      onClick={() => confirmDelete(false)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <div>
                        <div className="font-semibold text-foreground">Mark as Inactive</div>
                        <div className="text-xs opacity-70">Hides from website but keeps data for later.</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left border-destructive/20 hover:bg-destructive/10 hover:text-destructive h-auto py-3"
                      onClick={() => confirmDelete(true)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <div>
                        <div className="font-semibold text-foreground">Permanently Delete</div>
                        <div className="text-xs opacity-70">Removes completely from database. Cannot be undone.</div>
                      </div>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
