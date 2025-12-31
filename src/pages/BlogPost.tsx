import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { postStorage, AdminPost } from "@/lib/admin-storage";
import { Card, CardContent } from "@/components/ui/card";
import { CommentSection } from "@/components/comments/CommentSection";

/**
 * Blog Post Detail Page
 * Dynamically renders blog posts created in the admin panel
 * Accessible at /blog/:slug
 */
const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<AdminPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const foundPost = postStorage.getBySlug(slug);
      setPost(foundPost || null);
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 mb-8 animate-pulse" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-display font-bold text-foreground mb-4">
                Post Not Found
              </h1>
              <p className="text-muted-foreground mb-8">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/posts">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Posts
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-16">
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-8">
              <Link to="/posts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Posts
              </Link>
            </Button>

            {/* Post Header */}
            <header className="mb-8">
              {post.category && (
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                  {post.category}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                {post.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

              {/* Post Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {post.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </span>
                )}
                {post.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                {post.readTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                )}
              </div>
            </header>

            {/* Post Content */}
            <Card className="mb-8">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <div
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-display prose-headings:text-foreground
                    prose-p:text-foreground/90 prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground prose-img:rounded-lg prose-img:shadow-lg
                    prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4
                    prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-muted prose-pre:text-foreground"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div className="mt-12">
              <CommentSection postSlug={post.slug} />
            </div>

            {/* Navigation */}
            <div className="flex justify-center mt-8">
              <Button asChild variant="outline">
                <Link to="/posts">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  View All Posts
                </Link>
              </Button>
            </div>
          </div>
        </article>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default BlogPost;

