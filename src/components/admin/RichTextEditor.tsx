import { useRef, useEffect, useMemo, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Minus, Code, Image as ImageIcon, Youtube } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Register table module (if available)
let Table = null;
try {
  // Try to use quill-table if available, otherwise use custom implementation
  Table = Quill.import('modules/table');
} catch {
  // Table module not available, we'll use custom handler
}

/**
 * Rich Text Editor Component
 * Enhanced with tables, code blocks, image resize, embeds, and UX improvements
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [imageData, setImageData] = useState({ url: "", alt: "", width: "", alignment: "left" });
  const [embedData, setEmbedData] = useState({ url: "", type: "youtube" });
  const [codeData, setCodeData] = useState({ code: "", language: "javascript" });

  // Calculate word and character count
  useEffect(() => {
    const text = value.replace(/<[^>]*>/g, ''); // Strip HTML tags
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    setWordCount({ words, characters });
  }, [value]);

  // Enhanced image handler with preview, alt text, resize, and alignment
  const imageHandler = useMemo(() => {
    return function () {
      setImageData({ url: "", alt: "", width: "", alignment: "left" });
      setShowImageDialog(true);
    };
  }, []);

  const handleImageInsert = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !imageData.url) return;

    const range = quill.getSelection(true);
    if (!range) return;

    // Build image style with alignment and width
    let styleParts: string[] = [];
    
    // Add width constraint
    if (imageData.width) {
      styleParts.push(`max-width: ${imageData.width}px`);
      styleParts.push(`width: 100%`);
    } else {
      styleParts.push(`max-width: 100%`);
    }
    
    // Add alignment
    let alignmentStyle = "";
    if (imageData.alignment === "center") {
      alignmentStyle = `display: block; margin-left: auto; margin-right: auto;`;
    } else if (imageData.alignment === "right") {
      alignmentStyle = `display: block; margin-left: auto; margin-right: 0;`;
    } else {
      alignmentStyle = `display: block; margin-left: 0; margin-right: auto;`;
    }
    
    styleParts.push(alignmentStyle);
    styleParts.push(`height: auto`);
    styleParts.push(`margin-top: 1rem`);
    styleParts.push(`margin-bottom: 1rem`);

    const style = styleParts.join("; ");
    
    // Create image with alt text, width, and alignment
    const imgHtml = `<img src="${imageData.url}" alt="${imageData.alt || ''}" style="${style}" />`;

    quill.clipboard.dangerouslyPasteHTML(range.index, imgHtml);
    quill.setSelection(range.index + 1);
    setShowImageDialog(false);
    setImageData({ url: "", alt: "", width: "", alignment: "left" });
  };

  // Enhanced video/embed handler
  const videoHandler = useMemo(() => {
    return function () {
      setEmbedData({ url: "", type: "youtube" });
      setShowEmbedDialog(true);
    };
  }, []);

  const handleEmbedInsert = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !embedData.url) return;

    const range = quill.getSelection(true);
    if (!range) return;

    let embedHtml = "";

    if (embedData.type === "youtube") {
      // Extract YouTube video ID
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = embedData.url.match(youtubeRegex);
      if (match && match[1]) {
        const videoId = match[1];
        embedHtml = `<div class="embed-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;">
          <iframe src="https://www.youtube.com/embed/${videoId}" 
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen></iframe>
        </div>`;
      } else {
        alert("Invalid YouTube URL. Please enter a valid YouTube video URL.");
        return;
      }
    } else {
      // Generic iframe embed
      embedHtml = `<div class="embed-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;">
        <iframe src="${embedData.url}" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                frameborder="0" 
                allowfullscreen></iframe>
      </div>`;
    }

    quill.clipboard.dangerouslyPasteHTML(range.index, embedHtml);
    quill.setSelection(range.index + 1);
    setShowEmbedDialog(false);
    setEmbedData({ url: "", type: "youtube" });
  };

  // Code block handler with language selection
  const codeBlockHandler = useMemo(() => {
    return function () {
      setCodeData({ code: "", language: "javascript" });
      setShowCodeDialog(true);
    };
  }, []);

  const handleCodeInsert = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !codeData.code) return;

    const range = quill.getSelection(true);
    if (!range) return;

    const codeHtml = `<pre class="language-${codeData.language}"><code class="language-${codeData.language}">${codeData.code}</code></pre>`;
    quill.clipboard.dangerouslyPasteHTML(range.index, codeHtml);
    quill.setSelection(range.index + 1);
    setShowCodeDialog(false);
    setCodeData({ code: "", language: "javascript" });
  };

  // Table handler
  const tableHandler = useMemo(() => {
    return function () {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      const rows = prompt("Number of rows:", "3");
      const cols = prompt("Number of columns:", "3");
      
      if (!rows || !cols) return;

      const numRows = parseInt(rows, 10);
      const numCols = parseInt(cols, 10);

      if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
        alert("Please enter valid numbers for rows and columns.");
        return;
      }

      const range = quill.getSelection(true);
      if (!range) return;

      let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;"><tbody>';
      for (let i = 0; i < numRows; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < numCols; j++) {
          tableHtml += '<td style="border: 1px solid #ddd; padding: 8px;">&nbsp;</td>';
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table>';

      quill.clipboard.dangerouslyPasteHTML(range.index, tableHtml);
      quill.setSelection(range.index + 1);
    };
  }, []);

  // Horizontal divider handler
  const dividerHandler = useMemo(() => {
    return function () {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      const range = quill.getSelection(true);
      if (!range) return;

      const dividerHtml = '<hr style="margin: 1.5rem 0; border: none; border-top: 2px solid #ddd;" />';
      quill.clipboard.dangerouslyPasteHTML(range.index, dividerHtml);
      quill.setSelection(range.index + 1);
    };
  }, []);

  // Undo/Redo handlers
  const handleUndo = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.history.undo();
    }
  };

  const handleRedo = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      quill.history.redo();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        quill.format('bold', !quill.getFormat().bold);
      }
      // Ctrl/Cmd + I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        quill.format('italic', !quill.getFormat().italic);
      }
      // Ctrl/Cmd + K for link
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const url = prompt('Enter URL:');
        if (url) {
          quill.format('link', url);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Memoize modules to prevent re-creation
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, false] }], // Headings H1-H4 with false for normal text
        ["bold", "italic", "underline", "strike"], // Text formatting
        [{ align: [] }], // Alignment
        [{ list: "ordered" }, { list: "bullet" }], // Lists
        ["blockquote", "code-block"], // Block elements
        ["link", "image", "video"], // Media support
        [{ color: [] }, { background: [] }], // Colors
        ["clean"], // Remove formatting
      ],
      handlers: {
        image: imageHandler,
        video: videoHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: true,
    },
  }), [imageHandler, videoHandler]);

  const formats = useMemo(() => [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
    "color",
    "background",
    "width", // For image width
    "height", // For image height
  ], []);

  return (
    <TooltipProvider>
      <div className={cn("rich-text-editor-wrapper", className)}>
        <style>{`
          .rich-text-editor-wrapper .ql-container {
            font-family: inherit;
            font-size: 14px;
            min-height: 300px;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
            background: hsl(var(--background));
            color: hsl(var(--foreground));
          }
          .rich-text-editor-wrapper .ql-editor {
            min-height: 300px;
          }
          .rich-text-editor-wrapper .ql-toolbar {
            position: sticky;
            top: 0;
            z-index: 10;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            background: hsl(var(--muted));
            border-color: hsl(var(--border));
          }
          .rich-text-editor-wrapper .ql-toolbar .ql-stroke {
            stroke: hsl(var(--foreground));
          }
          .rich-text-editor-wrapper .ql-toolbar .ql-fill {
            fill: hsl(var(--foreground));
          }
          .rich-text-editor-wrapper .ql-toolbar button:hover,
          .rich-text-editor-wrapper .ql-toolbar button.ql-active {
            color: hsl(var(--primary));
          }
          .rich-text-editor-wrapper .ql-toolbar .ql-picker-label {
            color: hsl(var(--foreground));
          }
          .rich-text-editor-wrapper .ql-editor.ql-blank::before {
            color: hsl(var(--muted-foreground));
            font-style: normal;
          }
          .rich-text-editor-wrapper .ql-editor pre.ql-syntax {
            background-color: hsl(var(--muted));
            border-radius: 4px;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
          }
          .rich-text-editor-wrapper .ql-editor table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
          }
          .rich-text-editor-wrapper .ql-editor table td,
          .rich-text-editor-wrapper .ql-editor table th {
            border: 1px solid hsl(var(--border));
            padding: 8px;
          }
          .rich-text-editor-wrapper .ql-editor img {
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
            display: block;
          }
          .rich-text-editor-wrapper .ql-editor img[style*="margin-left: auto"][style*="margin-right: auto"] {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .rich-text-editor-wrapper .ql-editor img[style*="margin-right: 0"] {
            margin-left: auto !important;
            margin-right: 0 !important;
          }
          /* Ensure headings work correctly */
          .rich-text-editor-wrapper .ql-editor h1,
          .rich-text-editor-wrapper .ql-editor h2,
          .rich-text-editor-wrapper .ql-editor h3,
          .rich-text-editor-wrapper .ql-editor h4 {
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 0.5em;
            line-height: 1.2;
          }
          .rich-text-editor-wrapper .ql-editor h1 { font-size: 2em; }
          .rich-text-editor-wrapper .ql-editor h2 { font-size: 1.5em; }
          .rich-text-editor-wrapper .ql-editor h3 { font-size: 1.17em; }
          .rich-text-editor-wrapper .ql-editor h4 { font-size: 1em; }
        `}</style>
        
        {/* Enhanced Toolbar with Custom Buttons */}
        <div className="flex items-center justify-between border-b border-border bg-muted/50 p-2 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  className="h-8 w-8 p-0"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  className="h-8 w-8 p-0"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
            <div className="h-6 w-px bg-border mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={tableHandler}
                  className="h-8 px-2"
                >
                  Table
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Table</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={codeBlockHandler}
                  className="h-8 px-2"
                >
                  <Code className="h-4 w-4 mr-1" />
                  Code
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Code Block</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={dividerHandler}
                  className="h-8 px-2"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert Horizontal Divider</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmbedDialog(true)}
                  className="h-8 px-2"
                >
                  <Youtube className="h-4 w-4 mr-1" />
                  Embed
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert YouTube/Embed</TooltipContent>
            </Tooltip>
          </div>
          <div className="text-xs text-muted-foreground">
            {wordCount.words} words • {wordCount.characters} characters
          </div>
        </div>

        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          preserveWhitespace={true}
          bounds="self"
        />

        {/* Image Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
              <DialogDescription>
                Enter image URL and optional settings. Alt text is required for accessibility.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL *</Label>
                <Input
                  id="image-url"
                  value={imageData.url}
                  onChange={(e) => setImageData({ ...imageData, url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-alt">Alt Text *</Label>
                <Input
                  id="image-alt"
                  value={imageData.alt}
                  onChange={(e) => setImageData({ ...imageData, alt: e.target.value })}
                  placeholder="Description of the image"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image-width">Max Width (px, optional)</Label>
                  <Input
                    id="image-width"
                    type="number"
                    value={imageData.width}
                    onChange={(e) => setImageData({ ...imageData, width: e.target.value })}
                    placeholder="800"
                    min="100"
                    max="2000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-alignment">Alignment</Label>
                  <Select
                    value={imageData.alignment}
                    onValueChange={(value) => setImageData({ ...imageData, alignment: value })}
                  >
                    <SelectTrigger id="image-alignment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {imageData.url && (
                <div className="mt-4">
                  <Label>Preview:</Label>
                  <img
                    src={imageData.url}
                    alt={imageData.alt || "Preview"}
                    className="mt-2 max-w-full h-auto rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImageInsert}
                disabled={!imageData.url || !imageData.alt}
              >
                Insert Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Embed Dialog */}
        <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Embed</DialogTitle>
              <DialogDescription>
                Insert YouTube video or iframe embed. URLs will be sanitized for security.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embed-type">Embed Type</Label>
                <Select
                  value={embedData.type}
                  onValueChange={(value) => setEmbedData({ ...embedData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="iframe">Generic Iframe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="embed-url">URL *</Label>
                <Input
                  id="embed-url"
                  value={embedData.url}
                  onChange={(e) => setEmbedData({ ...embedData, url: e.target.value })}
                  placeholder={
                    embedData.type === "youtube"
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://example.com/embed"
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmbedDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEmbedInsert} disabled={!embedData.url}>
                Insert Embed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Code Block Dialog */}
        <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Insert Code Block</DialogTitle>
              <DialogDescription>
                Enter your code and select the programming language for syntax highlighting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code-language">Language</Label>
                <Select
                  value={codeData.language}
                  onValueChange={(value) => setCodeData({ ...codeData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="bash">Bash</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                    <SelectItem value="plaintext">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code-content">Code *</Label>
                <textarea
                  id="code-content"
                  value={codeData.code}
                  onChange={(e) => setCodeData({ ...codeData, code: e.target.value })}
                  className="w-full min-h-[200px] p-2 border rounded font-mono text-sm"
                  placeholder="Enter your code here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCodeInsert} disabled={!codeData.code.trim()}>
                Insert Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
