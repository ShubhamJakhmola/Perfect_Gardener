import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateImageUrl, sanitizeUrl } from "@/lib/security";

interface MultipleImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
  maxSizeMB?: number;
}

export function MultipleImageUpload({ 
  images = [], 
  onChange, 
  label = "Product Images",
  maxImages = 10,
  maxSizeMB = 5
}: MultipleImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "Too Many Images",
        description: `Maximum ${maxImages} images allowed. You can add ${maxImages - images.length} more.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not an image file. Skipped.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size
        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: `${file.name} is too large (max ${maxSizeMB}MB). Skipped.`,
            variant: "destructive",
          });
          continue;
        }

        // Convert to Base64
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages.push(base64String);
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
        toast({
          title: "Images Uploaded",
          description: `Successfully uploaded ${newImages.length} image(s).`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading images.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Empty URL",
        description: "Please enter an image URL.",
        variant: "destructive",
      });
      return;
    }

    if (images.length >= maxImages) {
      toast({
        title: "Too Many Images",
        description: `Maximum ${maxImages} images allowed.`,
        variant: "destructive",
      });
      return;
    }

    const sanitizedUrl = sanitizeUrl(newImageUrl.trim());
    if (!validateImageUrl(sanitizedUrl)) {
      toast({
        title: "Invalid Image URL",
        description: "Please enter a valid image URL or upload from your computer.",
        variant: "destructive",
      });
      return;
    }

    onChange([...images, sanitizedUrl]);
    setNewImageUrl("");
    toast({
      title: "Image Added",
      description: "Image URL has been added successfully.",
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <Label>{label} ({images.length}/{maxImages})</Label>
      
      {/* Add Image Input */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          ref={urlInputRef}
          type="url"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddUrl();
            }
          }}
          placeholder="Enter image URL or upload from computer"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddUrl}
          disabled={isUploading || images.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add URL
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
            >
              <img
                src={image}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              
              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => handleRemoveImage(index)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => handleReorder(index, index - 1)}
                    className="h-8 w-8"
                    title="Move left"
                  >
                    ←
                  </Button>
                )}
                {index < images.length - 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => handleReorder(index, index + 1)}
                    className="h-8 w-8"
                    title="Move right"
                  >
                    →
                  </Button>
                )}
              </div>
              
              {/* Image number badge */}
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
              
              {/* Primary image indicator */}
              {index === 0 && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Add up to {maxImages} images. The first image will be used as the primary/thumbnail image. 
        Supported formats: JPG, PNG, GIF, WebP. Max size: {maxSizeMB}MB per image.
      </p>
    </div>
  );
}

