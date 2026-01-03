import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { postStorage, AdminPost } from "@/lib/admin-storage";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image?: string;
  slug?: string;
}

interface PostsSectionProps {
  limit?: number;
}

export function PostsSection({ limit = 3 }: PostsSectionProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const adminPosts = await postStorage.getAll();
        
        if (adminPosts.length > 0) {
          // Convert AdminPost to Post format
          const convertedPosts = adminPosts
            .sort((a, b) => {
              // Sort by date (newest first)
              const dateA = a.date ? new Date(a.date).getTime() : 0;
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA;
            })
            .map((p): Post => ({
              id: p.id,
              title: p.title,
              excerpt: p.excerpt,
              date: p.date || new Date().toISOString().split("T")[0],
              readTime: p.readTime || "5 min read",
              image: p.image || "",
              slug: p.slug,
            }));
          setPosts(convertedPosts.slice(0, limit));
        } else {
          // Fallback sample posts
          setPosts([
            {
              id: "1",
              title: "10 Essential Tips for Beginning Gardeners",
              excerpt: "Starting a garden can feel overwhelming, but with these simple tips you'll be growing beautiful plants in no time.",
              date: "2024-12-15",
              readTime: "5 min read",
            },
            {
              id: "2",
              title: "Best Indoor Plants for Low Light Conditions",
              excerpt: "Not all plants need bright sunlight. Discover the best varieties for darker corners of your home.",
              date: "2024-12-10",
              readTime: "4 min read",
            },
            {
              id: "3",
              title: "How to Make Your Own Organic Compost",
              excerpt: "Turn your kitchen scraps into black gold for your garden with this simple composting guide.",
              date: "2024-12-05",
              readTime: "6 min read",
            },
          ].slice(0, limit));
        }
      } catch (error) {
        console.error('Error loading posts:', error);
        // Keep fallback posts on error
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
    
    // Refresh posts every 5 minutes (reduced from 30 seconds for better performance)
    const interval = setInterval(loadPosts, 300000);
    
    return () => {
      clearInterval(interval);
    };
  }, [limit]);

  return (
    <section id="posts" className="py-20 md:py-32 relative overflow-hidden wavy-top wavy-bottom">
      {/* Premium Background Gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 50%, hsl(199 85% 70% / 0.08) 0%, transparent 70%)"
        }}
      />
      
      <div className="section-container">
        {/* Premium Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            <span className="gradient-text">Latest Posts</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Insights and tips from Perfect Gardener to help your garden flourish.
          </p>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
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
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post, index) => {
              const postUrl = post.slug ? `/blog/${post.slug}` : `/posts`;
              return (
                <Link key={post.id} to={postUrl}>
                  <article
                    className={cn(
                      "group glass-card rounded-2xl overflow-hidden animate-fade-in transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer"
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
                    
                    <div className="p-8">
                      <h3 className="font-display font-bold text-xl text-foreground mb-4 line-clamp-2 group-hover:gradient-text transition-all duration-300">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-base mb-6 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* Premium Actions */}
        <div className="flex flex-wrap justify-center gap-4 mt-16">
          <Button asChild variant="gradient" size="lg" className="px-8 py-6 text-lg font-semibold">
            <Link to="/posts" className="group">
              View all posts
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold">
            <Link to="/tools">
              Explore Tools
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
