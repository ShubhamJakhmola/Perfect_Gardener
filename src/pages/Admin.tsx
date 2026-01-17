import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  FileText,
  Package,
  Save,
  Edit,
  Trash2,
  X,
  Check,
  ExternalLink,
  Upload,
  FileSpreadsheet,
  LogOut,
  Leaf,
} from "lucide-react";
import * as XLSX from "xlsx";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MultipleImageUpload } from "@/components/admin/MultipleImageUpload";
import {
  productStorage,
  postStorage,
  AdminProduct,
  AdminPost,
} from "@/lib/admin-storage";
import {
  sanitizeProductName,
  sanitizePrice,
  sanitizeDescription,
  sanitizeUrl,
  validateUrl,
  sanitizeHtml,
} from "@/lib/security";
import { detectSourceFromUrl } from "@/lib/product-utils";
import { plantsAPI } from "@/lib/api-client";

// Import existing products and posts data to seed on first load
import { Product } from "@/components/ProductCard";

// Sample products from Products.tsx (simplified)
const initialProducts: AdminProduct[] = [
  {
    id: "1",
    name: "White Winter Season Big-Petal Oyster Mushroom Growing Kit",
    price: "₹199",
    image: "https://m.media-amazon.com/images/I/71xAl7MObbL._SX679_.jpg",
    link: "https://www.amazon.in/dp/B0FG1M21B5",
    category: "Seeds & Kits",
    description: "Complete mushroom growing kit for beginners",
  },
  {
    id: "2",
    name: "Grow bags 260 GSM Round Shaped (Pack of 4)",
    price: "₹299",
    image: "https://m.media-amazon.com/images/I/71UWf7Q1YbL._SL1500_.jpg",
    link: "https://www.amazon.in/dp/B0CWRHRQVK",
    category: "Pots & Planters",
    description: "Durable grow bags for container gardening",
  },
];

// Sample posts from Posts.tsx (simplified)
const initialPosts: AdminPost[] = [
  {
    id: "1",
    title: "10 Essential Tips for Beginning Gardeners",
    slug: "beginner-gardening-tips",
    excerpt: "Starting a garden can feel overwhelming, but with these simple tips you'll be growing beautiful plants in no time.",
    content: "<p>Starting a garden is an exciting journey! Here are 10 essential tips to get you started:</p><h2>1. Choose the Right Location</h2><p>Most plants need at least 6 hours of sunlight per day. Observe your space to find the best spot.</p><h2>2. Start with Good Soil</h2><p>Quality soil is the foundation of a healthy garden. Invest in good potting mix or enrich your garden soil with compost.</p>",
    date: "2025-12-15",
    readTime: "5 min read",
    category: "Beginner Guides",
    author: "Perfect Gardener",
    featured: true,
  },
  {
    id: "2",
    title: "Best Indoor Plants for Low Light Conditions",
    slug: "low-light-indoor-plants",
    excerpt: "Not all plants need bright sunlight. Discover the best varieties for darker corners of your home.",
    content: "<p>Low light doesn't mean no plants! Here are some excellent options:</p><h2>Snake Plant</h2><p>Extremely hardy and can survive in very low light conditions.</p><h2>ZZ Plant</h2><p>Another tough plant that thrives in low light and requires minimal care.</p>",
    date: "2025-12-10",
    readTime: "4 min read",
    category: "Indoor Gardening",
    author: "Perfect Gardener",
  },
];

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [plants, setPlants] = useState<any[]>([]);

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Logout handler
  const handleLogout = () => {
    // Clear all authentication state
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_user");
    
    // Redirect to login page
    navigate("/admin/login");
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Product form state
  const [productForm, setProductForm] = useState<Omit<AdminProduct, "id">>({
    name: "",
    price: "",
    image: "",
    images: [],
    link: "",
    category: "",
    description: "",
    source: "",
    subCategory: "",
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Post form state
  const [postForm, setPostForm] = useState<Omit<AdminPost, "id">>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    author: "Perfect Gardener",
    date: new Date().toISOString().split("T")[0],
    readTime: "5 min read",
    featured: false,
  });
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Plant form state
  const [plantForm, setPlantForm] = useState({
    name: "",
    region: "",
    growingMonths: "",
    season: "",
    soilRequirements: "",
    bloomHarvestTime: "",
    sunlightNeeds: "",
    careInstructions: "",
    image: "",
    plantType: "",
  });
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);

  // Delete confirmation dialogs
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deletePlantId, setDeletePlantId] = useState<string | null>(null);

  // Loading states
  const [savingPost, setSavingPost] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingPlant, setSavingPlant] = useState(false);
  const [importingProducts, setImportingProducts] = useState(false);
  const [importingPlants, setImportingPlants] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load products from API
        const storedProducts = await productStorage.getAll();
        if (storedProducts.length === 0) {
          // First time: seed with initial data
          const seededProducts: AdminProduct[] = [];
          for (const p of initialProducts) {
            const created = await productStorage.add(p);
            seededProducts.push(created);
          }
          setProducts(seededProducts);
        } else {
          setProducts(storedProducts);
        }

        // Load posts from API
        const storedPosts = await postStorage.getAll();
        if (storedPosts.length === 0) {
          // First time: seed with initial data
          const seededPosts: AdminPost[] = [];
          for (const p of initialPosts) {
            const created = await postStorage.add(p);
            seededPosts.push(created);
          }
          setPosts(seededPosts);
        } else {
          setPosts(storedPosts);
        }

        // Load plants from API
        try {
          const allPlants = await plantsAPI.getAll();
          setPlants(allPlants);
        } catch (error) {
          console.error('Error loading plants:', error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load products and posts. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []);

  // Product Management Functions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSavingProduct(true);
    
    try {
      // Auto-detect source if not set
      let finalSource = productForm.source;
      let finalSubCategory = productForm.subCategory;
      if (productForm.link && !finalSource) {
        const detected = detectSourceFromUrl(productForm.link);
        if (detected !== "unknown" && detected !== "other") {
          finalSource = detected;
          finalSubCategory = detected;
        }
      }

      // Sanitize and validate inputs
      const sanitizedForm = {
        ...productForm,
        name: sanitizeProductName(productForm.name),
        price: sanitizePrice(productForm.price),
        description: sanitizeDescription(productForm.description || ""),
        link: productForm.link ? sanitizeUrl(productForm.link) : "",
        category: productForm.category ? sanitizeProductName(productForm.category) : "",
        source: finalSource || undefined,
        subCategory: finalSubCategory || undefined,
      };

      // Validate required fields
      if (!sanitizedForm.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Product name is required.",
          variant: "destructive",
        });
        return;
      }

      if (!sanitizedForm.price.trim()) {
        toast({
          title: "Validation Error",
          description: "Product price is required.",
          variant: "destructive",
        });
        return;
      }

      // Validate link if provided
      if (sanitizedForm.link && !validateUrl(sanitizedForm.link)) {
        toast({
          title: "Invalid URL",
          description: "Please provide a valid URL for the buy link.",
          variant: "destructive",
        });
        return;
      }

      // Prepare product data
      const productData: AdminProduct = {
        id: editingProductId || crypto.randomUUID(),
        ...sanitizedForm,
        // Use images array if available, otherwise fallback to single image
        images: sanitizedForm.images && sanitizedForm.images.length > 0
          ? sanitizedForm.images
          : sanitizedForm.image
            ? [sanitizedForm.image]
            : [],
      };

      if (editingProductId) {
        // Update existing product
        await productStorage.update(editingProductId, productData);
        const updatedProducts = await productStorage.getAll();
        setProducts(updatedProducts);
        toast({
          title: "Product Updated",
          description: "Product has been successfully updated.",
        });
        setEditingProductId(null);
      } else {
        // Add new product
        await productStorage.add(productData);
        const updatedProducts = await productStorage.getAll();
        setProducts(updatedProducts);
        toast({
          title: "Product Added",
          description: "New product has been added successfully.",
        });
      }

      // Reset form
      setProductForm({
        name: "",
        price: "",
        image: "",
        images: [],
        link: "",
        category: "",
        description: "",
        source: "",
        subCategory: "",
      });
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error Saving Product",
        description: error.message || "An error occurred while saving the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProduct = (product: AdminProduct) => {
    // Support both legacy single image and new images array
    const images = product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image || "",
      images: images,
      link: product.link || "",
      category: product.category || "",
      description: product.description || "",
      source: product.source || "",
      subCategory: product.subCategory || "",
    });
    setEditingProductId(product.id);
    // Scroll to form
    document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productStorage.delete(id);
      const updatedProducts = await productStorage.getAll();
      setProducts(updatedProducts);
      setDeleteProductId(null);
      toast({
        title: "Product Deleted",
        description: "Product has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelProductEdit = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      price: "",
      image: "",
      images: [],
      link: "",
      category: "",
      description: "",
      source: "",
      subCategory: "",
    });
  };

  // Post Management Functions
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!postForm.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Post title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!postForm.slug?.trim()) {
      toast({
        title: "Validation Error",
        description: "Post slug is required.",
        variant: "destructive",
      });
      return;
    }

    if (!postForm.content?.trim() || postForm.content.trim() === '<p><br></p>') {
      toast({
        title: "Validation Error",
        description: "Post content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!postForm.excerpt?.trim()) {
      toast({
        title: "Validation Error",
        description: "Post excerpt is required.",
        variant: "destructive",
      });
      return;
    }

    setSavingPost(true);
    
    try {
      // Sanitize HTML content before saving
      const sanitizedContent = sanitizeHtml(postForm.content);
      const sanitizedPostForm = {
        ...postForm,
        content: sanitizedContent,
      };

      if (editingPostId) {
        // Update existing post - wait for backend confirmation
        const updatedPost = await postStorage.update(editingPostId, sanitizedPostForm);
        
        // Only refresh list and show success after backend confirms
        const updatedPosts = await postStorage.getAll();
        setPosts(updatedPosts);
        toast({
          title: "Post Updated",
          description: "Post has been successfully updated.",
        });
        setEditingPostId(null);
      } else {
        // Add new post - wait for backend confirmation
        const newPost: AdminPost = {
          id: crypto.randomUUID(),
          ...sanitizedPostForm,
          date: sanitizedPostForm.date || new Date().toISOString().split("T")[0],
          author: sanitizedPostForm.author || "Perfect Gardener",
        };
        const createdPost = await postStorage.add(newPost);
        
        // Only refresh list and show success after backend confirms
        const updatedPosts = await postStorage.getAll();
        setPosts(updatedPosts);
        toast({
          title: "Post Created",
          description: `New post created! It will be available at /blog/${createdPost.slug}`,
        });
      }

      // Reset form only after successful save
      setPostForm({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        author: "Perfect Gardener",
        date: new Date().toISOString().split("T")[0],
        readTime: "5 min read",
        featured: false,
      });
    } catch (error: any) {
      console.error("Error saving post:", error);
      
      // Determine error type for better messaging
      let errorTitle = "Error Saving Post";
      let errorMessage = error.message || "An error occurred while saving the post. Please try again.";
      
      // Check for specific error types
      if (error.message?.includes("timeout") || error.message?.includes("Network error")) {
        errorTitle = "Request Timeout";
        errorMessage = "The request took too long. Please check if the post was saved and try again if needed.";
      } else if (error.message?.includes("409") || error.message?.includes("already exists")) {
        errorTitle = "Duplicate Entry";
        errorMessage = error.message || "A post with this slug already exists. Please use a different slug.";
      } else if (error.message?.includes("400") || error.message?.includes("Validation")) {
        errorTitle = "Validation Error";
        errorMessage = error.message || "Please check your input and try again.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Do NOT auto-retry on timeout errors - let user decide
    } finally {
      setSavingPost(false);
    }
  };

  const handleEditPost = (post: AdminPost) => {
    setPostForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category || "",
      author: post.author || "Perfect Gardener",
      date: post.date || new Date().toISOString().split("T")[0],
      readTime: post.readTime || "5 min read",
      featured: post.featured || false,
    });
    setEditingPostId(post.id);
    // Scroll to form
    document.getElementById("post-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeletePost = async (id: string) => {
    try {
      await postStorage.delete(id);
      const updatedPosts = await postStorage.getAll();
      setPosts(updatedPosts);
      setDeletePostId(null);
      toast({
        title: "Post Deleted",
        description: "Post has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelPostEdit = () => {
    setEditingPostId(null);
    setPostForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      author: "Perfect Gardener",
      date: new Date().toISOString().split("T")[0],
      readTime: "5 min read",
      featured: false,
      image: "",
    });
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Plant Management Functions
  const handlePlantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSavingPlant(true);
    
    try {
      if (!plantForm.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Plant name is required.",
          variant: "destructive",
        });
        return;
      }

      if (editingPlantId) {
        // Update existing plant
        await plantsAPI.update(editingPlantId, plantForm);
        const updatedPlants = await plantsAPI.getAll();
        setPlants(updatedPlants);
        toast({
          title: "Plant Updated",
          description: "Plant has been successfully updated.",
        });
        setEditingPlantId(null);
      } else {
        // Add new plant
        await plantsAPI.create({
          ...plantForm,
          dataSource: 'manual'
        });
        const updatedPlants = await plantsAPI.getAll();
        setPlants(updatedPlants);
        toast({
          title: "Plant Added",
          description: "New plant has been added successfully.",
        });
      }

      // Reset form
      setPlantForm({
        name: "",
        region: "",
        growingMonths: "",
        season: "",
        soilRequirements: "",
        bloomHarvestTime: "",
        sunlightNeeds: "",
        careInstructions: "",
        image: "",
        plantType: "",
      });
    } catch (error: any) {
      console.error("Error saving plant:", error);
      let errorMessage = "An error occurred while saving the plant. Please try again.";
      
      // Provide specific error messages
      if (error.message) {
        if (error.message.includes("required")) {
          errorMessage = error.message;
        } else if (error.message.includes("Network error")) {
          errorMessage = "Network error: Unable to connect to server. Please check your connection.";
        } else if (error.message.includes("duplicate") || error.message.includes("already exists")) {
          errorMessage = "A plant with this name already exists. Please use a different name.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error Saving Plant",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSavingPlant(false);
    }
  };

  const handleEditPlant = (plant: any) => {
    setPlantForm({
      name: plant.name || "",
      region: plant.region || "",
      growingMonths: plant.growing_months || "",
      season: plant.season || "",
      soilRequirements: plant.soil_requirements || "",
      bloomHarvestTime: plant.bloom_harvest_time || "",
      sunlightNeeds: plant.sunlight_needs || "",
      careInstructions: plant.care_instructions || "",
      image: plant.image || "",
      plantType: plant.plant_type || "",
    });
    setEditingPlantId(plant.id);
    document.getElementById("plant-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeletePlant = async (id: string) => {
    try {
      await plantsAPI.delete(id);
      const updatedPlants = await plantsAPI.getAll();
      setPlants(updatedPlants);
      setDeletePlantId(null);
      toast({
        title: "Plant Deleted",
        description: "Plant has been removed successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting plant:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the plant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelPlantEdit = () => {
    setEditingPlantId(null);
    setPlantForm({
      name: "",
      region: "",
      growingMonths: "",
      season: "",
      soilRequirements: "",
      bloomHarvestTime: "",
      sunlightNeeds: "",
      careInstructions: "",
      image: "",
      plantType: "",
    });
  };

  // Handle Plant File Import (CSV, XLSX, JSON)
  const handlePlantFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || (fileExtension !== 'csv' && fileExtension !== 'xlsx' && fileExtension !== 'xls' && fileExtension !== 'json')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV, XLSX, or JSON file.",
        variant: "destructive",
      });
      return;
    }

    setImportingPlants(true);
    
    try {
      let jsonData: any[] = [];

      if (fileExtension === 'json') {
        // Parse JSON
        const text = await file.text();
        const parsed = JSON.parse(text);
        // Handle both array and object with Plants array
        if (Array.isArray(parsed)) {
          jsonData = parsed;
        } else if (parsed.Plants && Array.isArray(parsed.Plants)) {
          jsonData = parsed.Plants;
        } else {
          throw new Error('Invalid JSON format');
        }
      } else {
        // Parse CSV/XLSX
        const fileData = await file.arrayBuffer();
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }

      if (jsonData.length === 0) {
        toast({
          title: "Empty File",
          description: "The file contains no data.",
          variant: "destructive",
        });
        return;
      }

      // Normalize column names
      const normalizeKey = (key: string) => {
        const normalized = key.toLowerCase().trim().replace(/[\s_]/g, '');
        const mappings: Record<string, string> = {
          'plantname': 'name',
          'name': 'name',
          'title': 'name',
          'region': 'region',
          'growingmonths': 'growingMonths',
          'growing_months': 'growingMonths',
          'season': 'season',
          'soilrequirements': 'soilRequirements',
          'soil_requirements': 'soilRequirements',
          'bloomharvesttime': 'bloomHarvestTime',
          'bloom_harvest_time': 'bloomHarvestTime',
          'sunlightneeds': 'sunlightNeeds',
          'sunlight_needs': 'sunlightNeeds',
          'careinstructions': 'careInstructions',
          'care_instructions': 'careInstructions',
          'image': 'image',
          'planttype': 'plantType',
          'plant_type': 'plantType',
        };
        return mappings[normalized] || normalized;
      };

      let importedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const row of jsonData) {
        const normalizedRow: any = {};
        Object.keys(row).forEach(key => {
          const normalizedKey = normalizeKey(key);
          normalizedRow[normalizedKey] = row[key];
        });

        // Validate required fields
        if (!normalizedRow.name) {
          skippedCount++;
          continue;
        }

        try {
          // Create plant
          const newPlant = {
            name: String(normalizedRow.name || '').trim(),
            region: normalizedRow.region ? String(normalizedRow.region).trim() : undefined,
            growingMonths: normalizedRow.growingMonths ? String(normalizedRow.growingMonths).trim() : undefined,
            season: normalizedRow.season ? String(normalizedRow.season).trim() : undefined,
            soilRequirements: normalizedRow.soilRequirements ? String(normalizedRow.soilRequirements).trim() : undefined,
            bloomHarvestTime: normalizedRow.bloomHarvestTime ? String(normalizedRow.bloomHarvestTime).trim() : undefined,
            sunlightNeeds: normalizedRow.sunlightNeeds ? String(normalizedRow.sunlightNeeds).trim() : undefined,
            careInstructions: normalizedRow.careInstructions ? String(normalizedRow.careInstructions).trim() : undefined,
            image: normalizedRow.image ? String(normalizedRow.image).trim() : undefined,
            plantType: normalizedRow.plantType ? String(normalizedRow.plantType).trim() : undefined,
            dataSource: fileExtension === 'json' ? 'imported_json' : fileExtension === 'csv' ? 'imported_csv' : 'imported_xlsx'
          };

          await plantsAPI.create(newPlant);
          importedCount++;
        } catch (rowError: any) {
          errorCount++;
          const plantName = String(normalizedRow.name || '').trim();
          errors.push(`Row "${plantName}": ${rowError.message || 'Unknown error'}`);
          // Continue processing other rows
        }
      }

      const updatedPlants = await plantsAPI.getAll();
      setPlants(updatedPlants);
      
      // Show detailed import results
      const totalProcessed = jsonData.length;
      const successMessage = `Import completed: ${importedCount} inserted, ${skippedCount} skipped, ${errorCount} errors out of ${totalProcessed} total records.`;
      
      if (errorCount > 0 && errors.length > 0) {
        // Show first 3 errors in toast, full list in console
        console.error('Import errors:', errors);
        toast({
          title: "Import Completed with Errors",
          description: `${successMessage} First errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import Successful",
          description: successMessage,
        });
      }

      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      console.error('Plant import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "An error occurred while importing the file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setImportingPlants(false);
    }
  };

  // Handle CSV/XLSX file import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || (fileExtension !== 'csv' && fileExtension !== 'xlsx' && fileExtension !== 'xls')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV or XLSX file.",
        variant: "destructive",
      });
      return;
    }

    setImportingProducts(true);
    
    try {
      const fileData = await file.arrayBuffer();
      let jsonData: any[] = [];

      if (fileExtension === 'csv') {
        // Parse CSV
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        // Parse XLSX/XLS
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }

      if (jsonData.length === 0) {
        toast({
          title: "Empty File",
          description: "The file contains no data.",
          variant: "destructive",
        });
        return;
      }

      // Expected columns: name, price, image, link, category, description
      let importedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const row of jsonData) {
        // Normalize column names (case-insensitive, handle spaces/underscores)
        const normalizeKey = (key: string) => {
          const normalized = key.toLowerCase().trim().replace(/[\s_]/g, '');
          const mappings: Record<string, string> = {
            'productname': 'name',
            'name': 'name',
            'title': 'name',
            'product': 'name',
            'price': 'price',
            'cost': 'price',
            'amount': 'price',
            'image': 'image',
            'imageurl': 'image',
            'img': 'image',
            'photo': 'image',
            'link': 'link',
            'buylink': 'link',
            'url': 'link',
            'category': 'category',
            'cat': 'category',
            'type': 'category',
            'description': 'description',
            'desc': 'description',
            'details': 'description',
          };
          return mappings[normalized] || normalized;
        };

        const normalizedRow: any = {};
        Object.keys(row).forEach(key => {
          const normalizedKey = normalizeKey(key);
          normalizedRow[normalizedKey] = row[key];
        });

        // Validate required fields
        if (!normalizedRow.name || !normalizedRow.price) {
          skippedCount++;
          continue;
        }

        try {
          // Detect source from link
          const link = String(normalizedRow.link || '').trim();
          const detectedSource = detectSourceFromUrl(link);

          // Create product
          const newProduct: AdminProduct = {
            id: crypto.randomUUID(),
            name: String(normalizedRow.name || '').trim(),
            price: String(normalizedRow.price || '').trim(),
            image: String(normalizedRow.image || '').trim(),
            link: link,
            category: String(normalizedRow.category || '').trim(),
            description: String(normalizedRow.description || '').trim(),
            source: detectedSource !== "unknown" && detectedSource !== "other" ? detectedSource : undefined,
            subCategory: detectedSource !== "unknown" && detectedSource !== "other" ? detectedSource : undefined,
          };

          await productStorage.add(newProduct);
          importedCount++;
        } catch (rowError: any) {
          errorCount++;
          const productName = String(normalizedRow.name || '').trim();
          errors.push(`Row "${productName}": ${rowError.message || 'Unknown error'}`);
          // Continue processing other rows
        }
      }

      const updatedProducts = await productStorage.getAll();
      setProducts(updatedProducts);
      
      // Show detailed import results
      const totalProcessed = jsonData.length;
      const successMessage = `Import completed: ${importedCount} inserted, ${skippedCount} skipped, ${errorCount} errors out of ${totalProcessed} total records.`;
      
      if (errorCount > 0 && errors.length > 0) {
        // Show first 3 errors in toast, full list in console
        console.error('Import errors:', errors);
        toast({
          title: "Import Completed with Errors",
          description: `${successMessage} First errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import Successful",
          description: successMessage,
        });
      }

      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "An error occurred while importing the file. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setImportingProducts(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main id="main-content" className="flex-1 pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-8 md:py-12 bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Manage products, blog posts, and content from a powerful admin panel.
                  All data is persisted in your browser's localStorage.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2 shrink-0"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 w-full">
          <div className="container mx-auto px-4 w-full">
            <Tabs defaultValue="products" className="space-y-6 w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Products ({products.length})
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Posts ({posts.length})
                </TabsTrigger>
                <TabsTrigger value="plants" className="flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Plants ({plants.length})
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                {/* Bulk Import Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5" />
                      Bulk Import Products
                    </CardTitle>
                    <CardDescription>
                      Import multiple products at once from a CSV or XLSX file. Expected columns: name, price, image, link, category, description.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileImport}
                        className="flex-1"
                        id="file-import"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-import')?.click()}
                        className="flex items-center gap-2"
                        disabled={importingProducts}
                      >
                        <Upload className="w-4 h-4" />
                        {importingProducts ? "Importing..." : "Choose File"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      CSV/XLSX format: name (required), price (required), image, link, category, description
                    </p>
                  </CardContent>
                </Card>

                {/* Product Form */}
                <Card id="product-form">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {editingProductId ? (
                        <>
                          <Edit className="w-4 h-4" />
                          Edit Product
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Product
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {editingProductId
                        ? "Update the product information below."
                        : "Fill in the details to add a new product."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm({ ...productForm, name: e.target.value })
                            }
                            required
                            placeholder="e.g. Premium Potting Mix 5kg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price *</Label>
                          <Input
                            id="price"
                            name="price"
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm({ ...productForm, price: e.target.value })
                            }
                            required
                            placeholder="₹399"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            name="category"
                            value={productForm.category}
                            onChange={(e) =>
                              setProductForm({ ...productForm, category: e.target.value })
                            }
                            placeholder="e.g. Seeds & Kits"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <MultipleImageUpload
                            images={productForm.images || (productForm.image ? [productForm.image] : [])}
                            onChange={(images) => {
                              setProductForm({ 
                                ...productForm, 
                                images: images,
                                // Keep first image as legacy image for backward compatibility
                                image: images.length > 0 ? images[0] : ""
                              });
                            }}
                            label="Product Images"
                            maxImages={10}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="link">Buy Link</Label>
                          <Input
                            id="link"
                            name="link"
                            type="url"
                            value={productForm.link}
                            onChange={(e) => {
                              const link = e.target.value;
                              const detectedSource = detectSourceFromUrl(link);
                              setProductForm({ 
                                ...productForm, 
                                link: link,
                                source: detectedSource !== "unknown" && detectedSource !== "other" ? detectedSource : productForm.source,
                                subCategory: detectedSource !== "unknown" && detectedSource !== "other" ? detectedSource : productForm.subCategory,
                              });
                            }}
                            placeholder="https://amazon.in/..."
                          />
                          <p className="text-xs text-muted-foreground">
                            Source will be auto-detected from URL (amazon, meesho, flipkart, etc.)
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="source">Source</Label>
                          <Input
                            id="source"
                            name="source"
                            value={productForm.source || ""}
                            onChange={(e) =>
                              setProductForm({ ...productForm, source: e.target.value })
                            }
                            placeholder="amazon, meesho, flipkart..."
                          />
                          <p className="text-xs text-muted-foreground">
                            Auto-detected from URL, or enter manually
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subCategory">Sub Category (Source)</Label>
                          <Input
                            id="subCategory"
                            name="subCategory"
                            value={productForm.subCategory || ""}
                            onChange={(e) =>
                              setProductForm({ ...productForm, subCategory: e.target.value })
                            }
                            placeholder="amazon, meesho, flipkart..."
                          />
                          <p className="text-xs text-muted-foreground">
                            Same as source, used for product comparison
                          </p>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={productForm.description}
                            onChange={(e) =>
                              setProductForm({ ...productForm, description: e.target.value })
                            }
                            rows={3}
                            placeholder="Brief product description..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        {editingProductId && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelProductEdit}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                        <Button type="submit" disabled={savingProduct}>
                          <Save className="w-4 h-4 mr-2" />
                          {savingProduct ? "Saving..." : editingProductId ? "Update Product" : "Add Product"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Products List */}
                {products.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Products ({products.length})</CardTitle>
                      <CardDescription>
                        Click on a product to edit or delete it.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                          <Card key={product.id} className="relative">
                            <CardContent className="p-4">
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-48 object-cover rounded-lg mb-3"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              )}
                              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                                {product.name}
                              </h3>
                              <p className="text-primary font-medium mb-2">{product.price}</p>
                              {product.category && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {product.category}
                                </p>
                              )}
                              {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {product.description}
                                </p>
                              )}
                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditProduct(product)}
                                  className="flex-1"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setDeleteProductId(product.id)}
                                  className="flex-1"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Posts Tab */}
              <TabsContent value="posts" className="space-y-6">
                {/* Post Form */}
                <Card id="post-form">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {editingPostId ? (
                        <>
                          <Edit className="w-4 h-4" />
                          Edit Post
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create New Post
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {editingPostId
                        ? "Update the post content below."
                        : "Create a new blog post. The slug will be used to generate the post URL (/blog/your-slug)."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePostSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="post-title">Post Title *</Label>
                          <Input
                            id="post-title"
                            name="title"
                            value={postForm.title}
                            onChange={(e) => {
                              const title = e.target.value;
                              setPostForm({
                                ...postForm,
                                title,
                                slug: postForm.slug || generateSlug(title),
                              });
                            }}
                            required
                            placeholder="e.g. How to Grow Tomatoes on a Balcony"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="post-slug">Slug (URL) *</Label>
                          <Input
                            id="post-slug"
                            name="slug"
                            value={postForm.slug}
                            onChange={(e) =>
                              setPostForm({
                                ...postForm,
                                slug: generateSlug(e.target.value),
                              })
                            }
                            required
                            placeholder="tomato-growing-guide"
                          />
                          <p className="text-xs text-muted-foreground">
                            URL: <code>/blog/{postForm.slug || "your-slug"}</code>
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="post-category">Category</Label>
                          <Input
                            id="post-category"
                            name="category"
                            value={postForm.category}
                            onChange={(e) =>
                              setPostForm({ ...postForm, category: e.target.value })
                            }
                            placeholder="e.g. Beginner Guides"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="post-excerpt">Short Excerpt *</Label>
                          <Textarea
                            id="post-excerpt"
                            name="excerpt"
                            value={postForm.excerpt}
                            onChange={(e) =>
                              setPostForm({ ...postForm, excerpt: e.target.value })
                            }
                            required
                            rows={2}
                            placeholder="Brief summary shown in blog listings..."
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <ImageUpload
                            value={postForm.image || ""}
                            onChange={(value) =>
                              setPostForm({ ...postForm, image: value })
                            }
                            label="Post Thumbnail Image"
                            placeholder="https://example.com/post-thumbnail.jpg or upload from computer"
                          />
                          <p className="text-xs text-muted-foreground">
                            This image will be displayed on the main page and post listings.
                          </p>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="post-content">Post Content *</Label>
                          <RichTextEditor
                            value={postForm.content}
                            onChange={(content) =>
                              setPostForm({ ...postForm, content })
                            }
                            placeholder="Write your post content here..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        {editingPostId && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelPostEdit}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                        <Button type="submit" disabled={savingPost}>
                          <Save className="w-4 h-4 mr-2" />
                          {savingPost ? "Saving..." : editingPostId ? "Update Post" : "Create Post"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Posts List */}
                {posts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Posts ({posts.length})</CardTitle>
                      <CardDescription>
                        Click on a post to edit or delete it. Posts are automatically available at /blog/[slug].
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {posts.map((post) => (
                          <Card key={post.id} className="relative">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-foreground">
                                      {post.title}
                                    </h3>
                                    {post.featured && (
                                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {post.excerpt}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <ExternalLink className="w-3 h-3" />
                                      /blog/{post.slug}
                                    </span>
                                    {post.category && (
                                      <span>• {post.category}</span>
                                    )}
                                    {post.date && (
                                      <span>• {new Date(post.date).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditPost(post)}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeletePostId(post.id)}
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Plants Tab */}
              <TabsContent value="plants" className="space-y-6 w-full">
                {/* Bulk Import Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5" />
                      Import Plant Dataset
                    </CardTitle>
                    <CardDescription>
                      Import multiple plants from CSV, XLSX, or JSON file. Expected columns: name, region, growing_months, season, soil_requirements, bloom_harvest_time, sunlight_needs, care_instructions, image, plant_type.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls,.json"
                        onChange={handlePlantFileImport}
                        className="flex-1"
                        id="plant-file-import"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('plant-file-import')?.click()}
                        className="flex items-center gap-2"
                        disabled={importingPlants}
                      >
                        <Upload className="w-4 h-4" />
                        {importingPlants ? "Importing..." : "Choose File"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: CSV, XLSX, XLS, JSON
                    </p>
                  </CardContent>
                </Card>

                {/* Plant Form */}
                <Card id="plant-form">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {editingPlantId ? (
                        <>
                          <Edit className="w-4 h-4" />
                          Edit Plant
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Plant
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {editingPlantId
                        ? "Update the plant information below."
                        : "Fill in the details to add a new plant to the database."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePlantSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="plant-name">Plant Name *</Label>
                          <Input
                            id="plant-name"
                            name="name"
                            value={plantForm.name}
                            onChange={(e) =>
                              setPlantForm({ ...plantForm, name: e.target.value })
                            }
                            required
                            placeholder="e.g. Marigold, Tomato, Rose"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plant-region">Region</Label>
                          <Input
                            id="plant-region"
                            name="region"
                            value={plantForm.region}
                            onChange={(e) =>
                              setPlantForm({ ...plantForm, region: e.target.value })
                            }
                            placeholder="e.g. North India, South India"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plant-type">Plant Type</Label>
                          <Input
                            id="plant-type"
                            name="plantType"
                            value={plantForm.plantType}
                            onChange={(e) =>
                              setPlantForm({ ...plantForm, plantType: e.target.value })
                            }
                            placeholder="e.g. flower, vegetable, herb, fruit"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plant-growing-months">Growing Months</Label>
                          <Input
                            id="plant-growing-months"
                            name="growingMonths"
                            value={plantForm.growingMonths}
                            onChange={(e) =>
                              setPlantForm({ ...plantForm, growingMonths: e.target.value })
                            }
                            placeholder="e.g. January-March, June-September"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plant-season">Season</Label>
                          <Input
                            id="plant-season"
                            name="season"
                            value={plantForm.season}
                            onChange={(e) =>
                              setPlantForm({ ...plantForm, season: e.target.value })
                            }
                            placeholder="e.g. Summer, Winter, Monsoon"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plant-bloom-harvest">Bloom/Harvest Time</Label>
                          <Input
                            id="plant-bloom-harvest"
                            name="bloomHarvestTime"
                            value={plantForm.bloomHarvestTime}
                            onChange={(e) =>
                              setPlantForm({ ...plantForm, bloomHarvestTime: e.target.value })
                            }
                            placeholder="e.g. 60-90 days, March-April"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plant-sunlight">Sunlight Needs</Label>
                          <Input
                            id="plant-sunlight"
                            name="sunlightNeeds"
                            value={plantForm.sunlightNeeds}
                            onChange={(e) =>
                              setPlantForm({ ...plantForm, sunlightNeeds: e.target.value })
                            }
                            placeholder="e.g. Full sun, Partial shade"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="plant-soil">Soil Requirements</Label>
                          <Textarea
                            id="plant-soil"
                            name="soilRequirements"
                            value={plantForm.soilRequirements}
                            onChange={(e) =>
                              setPlantForm({ ...plantForm, soilRequirements: e.target.value })
                            }
                            rows={2}
                            placeholder="e.g. Well-drained, loamy soil with pH 6.0-7.0"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="plant-care">Care Instructions</Label>
                          <Textarea
                            id="plant-care"
                            name="careInstructions"
                            value={plantForm.careInstructions}
                            onChange={(e) =>
                              setPlantForm({ ...plantForm, careInstructions: e.target.value })
                            }
                            rows={4}
                            placeholder="Detailed care instructions..."
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <ImageUpload
                            value={plantForm.image || ""}
                            onChange={(value) =>
                              setPlantForm({ ...plantForm, image: value })
                            }
                            label="Plant Image URL"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {editingPlantId && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelPlantEdit}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button type="submit" className="flex-1" disabled={savingPlant}>
                          <Save className="w-4 h-4 mr-2" />
                          {savingPlant ? "Saving..." : editingPlantId ? "Update Plant" : "Add Plant"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Plants List */}
                {plants.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Plants ({plants.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {plants.map((plant) => (
                          <Card key={plant.id}>
                            <CardContent className="p-4">
                              {plant.image && (
                                <img
                                  src={plant.image}
                                  alt={plant.name}
                                  className="w-full h-48 object-cover rounded-lg mb-3"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              )}
                              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                                {plant.name}
                              </h3>
                              {plant.plant_type && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  Type: {plant.plant_type}
                                </p>
                              )}
                              {plant.region && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  Region: {plant.region}
                                </p>
                              )}
                              {plant.season && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  Season: {plant.season}
                                </p>
                              )}
                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditPlant(plant)}
                                  className="flex-1"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setDeletePlantId(plant.id)}
                                  className="flex-1"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog
        open={deleteProductId !== null}
        onOpenChange={() => setDeleteProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDeleteProduct(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog
        open={deletePostId !== null}
        onOpenChange={() => setDeletePostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              and it will no longer be accessible at its URL.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && handleDeletePost(deletePostId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Plant Confirmation Dialog */}
      <AlertDialog
        open={deletePlantId !== null}
        onOpenChange={() => setDeletePlantId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plant?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the plant
              from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePlantId && handleDeletePlant(deletePlantId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
