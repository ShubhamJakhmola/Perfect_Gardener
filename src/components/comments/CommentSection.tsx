import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Reply, Send, ChevronDown, ChevronUp } from "lucide-react";
import { commentStorage, Comment } from "@/lib/comment-storage";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  postSlug: string;
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState({ author: "", content: "" });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    const loadComments = () => {
      const postComments = commentStorage.getByPostSlug(postSlug);
      setComments(postComments);
    };

    loadComments();
    const interval = setInterval(loadComments, 1000);
    return () => clearInterval(interval);
  }, [postSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      postSlug,
      author: newComment.author,
      content: newComment.content,
      date: new Date().toISOString(),
      replies: [],
    };

    commentStorage.add(comment);
    setNewComment({ author: "", content: "" });
    toast({
      title: "Comment Added",
      description: "Your comment has been posted!",
    });
    
    // Refresh comments
    const postComments = commentStorage.getByPostSlug(postSlug);
    setComments(postComments);
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }

    const reply: Comment = {
      id: crypto.randomUUID(),
      postSlug,
      author: "Guest", // You can make this dynamic
      content: replyContent,
      date: new Date().toISOString(),
      parentId,
    };

    commentStorage.addReply(parentId, reply);
    setReplyContent("");
    setReplyingTo(null);
    toast({
      title: "Reply Added",
      description: "Your reply has been posted!",
    });
    
    // Refresh comments
    const postComments = commentStorage.getByPostSlug(postSlug);
    setComments(postComments);
  };

  const displayedComments = showAll ? comments : comments.slice(0, 3);
  const hasMore = comments.length > 3;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Comment Form */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-display font-bold">Leave a Comment</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your Name"
              value={newComment.author}
              onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
              required
              className="bg-background"
            />
            <Textarea
              placeholder="Write your comment here..."
              value={newComment.content}
              onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
              required
              rows={4}
              className="bg-background resize-none"
            />
            <div className="flex justify-center">
              <Button type="submit" className="w-full sm:w-auto">
                <Send className="w-4 h-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-display font-bold mb-4">
              Comments ({comments.length})
            </h3>
            
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
              {displayedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={() => setReplyingTo(comment.id)}
                  isReplying={replyingTo === comment.id}
                  replyContent={replyContent}
                  onReplyChange={setReplyContent}
                  onReplySubmit={() => handleReply(comment.id)}
                  onCancelReply={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show All Comments ({comments.length - 3} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {comments.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  onReply: () => void;
  isReplying: boolean;
  replyContent: string;
  onReplyChange: (value: string) => void;
  onReplySubmit: () => void;
  onCancelReply: () => void;
}

function CommentItem({
  comment,
  onReply,
  isReplying,
  replyContent,
  onReplyChange,
  onReplySubmit,
  onCancelReply,
}: CommentItemProps) {
  const allComments = commentStorage.getAll();
  const replies = allComments.filter((c) => c.parentId === comment.id);

  return (
    <div className="border-b border-border pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-semibold text-sm">
            {comment.author.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{comment.author}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.date), { addSuffix: true })}
            </span>
          </div>
          <p className="text-foreground/90 mb-2 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          
          {/* Reply Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReply}
            className="h-8 text-xs"
          >
            <Reply className="w-3 h-3 mr-1" />
            Reply
          </Button>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 ml-4 space-y-2">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => onReplyChange(e.target.value)}
                rows={2}
                className="bg-background resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={onReplySubmit}>
                  <Send className="w-3 h-3 mr-1" />
                  Post Reply
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelReply}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3 ml-4 space-y-3 border-l-2 border-primary/20 pl-4">
              {replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent-foreground font-semibold text-xs">
                      {reply.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{reply.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

