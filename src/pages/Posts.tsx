import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, X, Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { postStorage, AdminPost } from "@/lib/admin-storage";
import { filterWithAutoCorrect } from "@/lib/search-utils";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  image?: string;
  featured?: boolean;
  slug?: string;
}

// Extended blog posts data (fallback)
const fallbackPosts: Post[] = [
  {
    id: "1",
    title: "10 Essential Tips for Beginning Gardeners",
    excerpt: "Starting a garden can feel overwhelming, but with these simple tips you'll be growing beautiful plants in no time.",
    content: "Full article content here...",
    date: "2024-12-15",
    readTime: "5 min read",
    category: "Beginner Guides",
    author: "Perfect Gardener",
    featured: true,
  },
  {
    id: "2",
    title: "Best Indoor Plants for Low Light Conditions",
    excerpt: "Not all plants need bright sunlight. Discover the best varieties for darker corners of your home.",
    content: "Full article content here...",
    date: "2024-12-10",
    readTime: "4 min read",
    category: "Indoor Gardening",
    author: "Perfect Gardener",
  },
  {
    id: "3",
    title: "How to Make Your Own Organic Compost",
    excerpt: "Turn your kitchen scraps into black gold for your garden with this simple composting guide.",
    content: "Full article content here...",
    date: "2024-12-05",
    readTime: "6 min read",
    category: "DIY & Tutorials",
    author: "Perfect Gardener",
    featured: true,
  },
  {
    id: "4",
    title: "Seasonal Flower Planting Guide for India",
    excerpt: "Learn which flowers to plant in each season for year-round blooms in your Indian garden.",
    content: "Full article content here...",
    date: "2024-12-01",
    readTime: "8 min read",
    category: "Flowers",
    author: "Perfect Gardener",
  },
  {
    id: "5",
    title: "Container Gardening for Small Spaces",
    excerpt: "Don't let limited space stop you! Here's how to create a thriving garden in containers.",
    content: "Full article content here...",
    date: "2024-11-28",
    readTime: "5 min read",
    category: "Indoor Gardening",
    author: "Perfect Gardener",
  },
  {
    id: "6",
    title: "Natural Pest Control Methods for Your Garden",
    excerpt: "Protect your plants from pests without harmful chemicals using these organic methods.",
    content: "Full article content here...",
    date: "2024-11-25",
    readTime: "7 min read",
    category: "Plant Care",
    author: "Perfect Gardener",
  },
  {
    id: "7",
    title: "Growing Vegetables in Your Balcony Garden",
    excerpt: "Fresh veggies from your own balcony? It's easier than you think with these tips.",
    content: "Full article content here...",
    date: "2024-11-20",
    readTime: "6 min read",
    category: "Vegetables",
    author: "Perfect Gardener",
    featured: true,
  },
  {
    id: "8",
    title: "Understanding Soil pH and Plant Health",
    excerpt: "Learn how soil pH affects your plants and how to adjust it for optimal growth.",
    content: "Full article content here...",
    date: "2024-11-15",
    readTime: "5 min read",
    category: "Plant Care",
    author: "Perfect Gardener",
  },
  {
    id: "9",
    title: "Watering Techniques for Healthy Plants",
    excerpt: "Over-watering kills more plants than under-watering. Master the art of proper watering.",
    content: "Full article content here...",
    date: "2024-11-10",
    readTime: "4 min read",
    category: "Beginner Guides",
    author: "Perfect Gardener",
  },
  {
    id: "10",
    title: "Creating a Butterfly Garden",
    excerpt: "Attract beautiful butterflies to your garden with these nectar-rich plant selections.",
    content: "Full article content here...",
    date: "2024-11-05",
    readTime: "6 min read",
    category: "Flowers",
    author: "Perfect Gardener",
  },
  {
    id: "11",
    title: "DIY Vertical Garden Ideas",
    excerpt: "Maximize your growing space with creative vertical gardening solutions.",
    content: "Full article content here...",
    date: "2024-11-01",
    readTime: "7 min read",
    category: "DIY & Tutorials",
    author: "Perfect Gardener",
  },
  {
    id: "12",
    title: "Monsoon Gardening Tips for India",
    excerpt: "Protect your garden during the rainy season with these essential monsoon care tips.",
    content: "Full article content here...",
    date: "2024-10-28",
    readTime: "5 min read",
    category: "Plant Care",
    author: "Perfect Gardener",
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Posts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  // Load posts from localStorage (admin-managed) or fallback to default
  useEffect(() => {
    const loadPosts = () => {
      const adminPosts = postStorage.getAll();
      
      if (adminPosts.length > 0) {
        // Convert AdminPost to Post format
        const convertedPosts = adminPosts.map((p): Post => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          date: p.date || new Date().toISOString().split('T')[0],
          readTime: p.readTime || "5 min read",
          category: p.category || "Uncategorized",
          author: p.author || "Perfect Gardener",
          featured: p.featured || false,
          slug: p.slug,
        }));
        setAllPosts(convertedPosts);
      } else {
        // Use fallback posts if no admin posts exist
        setAllPosts(fallbackPosts);
      }
      
      setIsLoading(false);
    };

    loadPosts();
    
    // Listen for storage changes (when admin adds/updates posts)
    const handleStorageChange = () => {
      loadPosts();
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for same-tab updates
    const interval = setInterval(loadPosts, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(allPosts.map(p => p.category)))];
  }, [allPosts]);

  const [suggestedTerm, setSuggestedTerm] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      setSuggestedTerm(null);
      setShowSuggestion(false);
      return allPosts.filter((post) => {
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
        return matchesCategory;
      });
    }

    // Use auto-correct for search
    const searchablePosts = allPosts.filter((post) => {
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      return matchesCategory;
    });

    const { filtered, suggestedTerm: suggestion } = filterWithAutoCorrect(
      searchablePosts,
      searchQuery,
      (post) => `${post.title} ${post.excerpt || ""}`,
      0.5
    );

    setSuggestedTerm(suggestion);
    setShowSuggestion(suggestion !== null && suggestion.toLowerCase() !== searchQuery.toLowerCase());

    return filtered;
  }, [allPosts, searchQuery, selectedCategory]);

  const featuredPosts = filteredPosts.filter(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "All";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="py-8 md:py-12 bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Gardening Blog
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Tips, guides, and insights to help you grow a beautiful garden. Learn from our experts.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-6 bg-muted/30 border-b border-border sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
                {showSuggestion && suggestedTerm && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50">
                    <Alert className="bg-primary/10 border-primary/20">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <AlertDescription className="text-sm">
                        Did you mean <strong>{suggestedTerm}</strong>?{" "}
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary underline"
                          onClick={() => {
                            setSearchQuery(suggestedTerm);
                            setShowSuggestion(false);
                          }}
                        >
                          Use this instead
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>

              {/* Mobile Filter Toggle */}
              <Button 
                variant="outline" 
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Categories
              </Button>

              {/* Category Filters - Desktop */}
              <div className="hidden md:flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Mobile Filters Dropdown */}
            {showFilters && (
              <div className="md:hidden mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowFilters(false);
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Results Info */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredPosts.length} of {allPosts.length} articles
              </p>
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  {selectedCategory !== "All" && (
                    <Badge variant="secondary">{selectedCategory}</Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary">"{searchQuery}"</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-6 pb-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                    </div>
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-12">
                {/* Featured Posts */}
                {featuredPosts.length > 0 && selectedCategory === "All" && !searchQuery && (
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                      ⭐ Featured Articles
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredPosts.map((post, index) => (
                        <PostCard key={post.id} post={post} index={index} featured />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Posts */}
                <div>
                  {featuredPosts.length > 0 && selectedCategory === "All" && !searchQuery && (
                    <h2 className="text-xl font-display font-bold text-foreground mb-6">
                      All Articles
                    </h2>
                  )}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(selectedCategory === "All" && !searchQuery ? regularPosts : filteredPosts).map((post, index) => (
                      <PostCard key={post.id} post={post} index={index} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/50 rounded-xl">
                <p className="text-xl font-medium text-foreground mb-2">No articles found</p>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Tools CTA */}
        <section className="py-12 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              Ready to Start Gardening?
            </h2>
            <p className="text-muted-foreground mb-6">
              Check out our free gardening tools to plan your garden.
            </p>
            <Button asChild size="lg">
              <Link to="/tools" className="group">
                Explore Tools
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

interface PostCardProps {
  post: Post;
  index: number;
  featured?: boolean;
}

const PostCard = ({ post, index, featured }: PostCardProps) => {
  const postUrl = post.slug ? `/blog/${post.slug}` : `/posts`;
  
  return (
    <Link to={postUrl}>
      <article
        className={cn(
          "group bg-card rounded-xl border overflow-hidden card-hover animate-fade-in flex flex-col cursor-pointer transition-all hover:shadow-lg",
          featured ? "border-primary/30" : "border-border"
        )}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Thumbnail Image */}
        {post.image && (
          <div className="relative w-full h-48 overflow-hidden bg-muted">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}

        <div className="p-6 flex flex-col flex-grow">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={featured ? "default" : "secondary"} className="text-xs">
              {post.category}
            </Badge>
            {featured && (
              <span className="text-xs text-primary font-medium">Featured</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default Posts;
