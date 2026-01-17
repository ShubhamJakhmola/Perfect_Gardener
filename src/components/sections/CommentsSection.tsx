import { useState } from "react";
import { Star, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

const sampleComments: Comment[] = [
  {
    id: "1",
    name: "Priya Sharma",
    rating: 5,
    text: "Amazing tips for beginners! My garden has never looked better.",
    date: "2024-12-15",
  },
  {
    id: "2",
    name: "Rahul Verma",
    rating: 4,
    text: "Great product recommendations. The grow bags are excellent quality.",
    date: "2024-12-10",
  },
];

export function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newComment: Comment = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      rating: parseInt(formData.get("rating") as string) || 5,
      text: formData.get("comment") as string,
      date: new Date().toISOString().split("T")[0],
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setComments((prev) => [newComment, ...prev]);
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();

    toast({
      title: "Comment submitted!",
      description: "Thank you for your feedback.",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted"
        )}
      />
    ));
  };

  return (
    <section className="py-12 md:py-16 bg-green-50/30">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          {/* Intro Text */}
          <div className="text-center mb-8">
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have a gardening question or want to share your own tips? This is where our community discusses plant care, solves problems, and helps each other grow better gardens.
            </p>
          </div>

          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Community Questions & Answers
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-12 p-6 bg-card rounded-xl border border-border">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  className="focus-ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="focus-ring"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Your phone number"
                  className="focus-ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select name="rating" defaultValue="5">
                  <SelectTrigger id="rating" className="focus-ring">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-[100]">
                    <SelectItem value="5">★★★★★ (5 stars)</SelectItem>
                    <SelectItem value="4">★★★★☆ (4 stars)</SelectItem>
                    <SelectItem value="3">★★★☆☆ (3 stars)</SelectItem>
                    <SelectItem value="2">★★☆☆☆ (2 stars)</SelectItem>
                    <SelectItem value="1">★☆☆☆☆ (1 star)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                name="comment"
                placeholder="Share your feedback..."
                rows={4}
                required
                className="focus-ring resize-none"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Comment
                </>
              )}
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="p-4 bg-card rounded-lg border border-border animate-fade-in"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">{comment.name}</h4>
                      <time className="text-xs text-muted-foreground">{comment.date}</time>
                    </div>
                    <div className="flex items-center gap-0.5 my-1">
                      {renderStars(comment.rating)}
                    </div>
                    <p className="text-muted-foreground text-sm">{comment.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
