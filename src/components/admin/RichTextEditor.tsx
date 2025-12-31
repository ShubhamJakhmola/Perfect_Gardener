import { useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Rich Text Editor Component
 * Provides a modern WYSIWYG editor with formatting options:
 * - Text formatting: Bold, Italic, Underline
 * - Headings: H1, H2, H3
 * - Alignment: Left, Center, Right
 * - Media: Images, Videos
 * - Lists and other formatting options
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const isInitializedRef = useRef(false);

  // Prevent re-initialization issues
  useEffect(() => {
    if (quillRef.current && !isInitializedRef.current) {
      isInitializedRef.current = true;
    }
  }, []);

  // Configure the toolbar with all required formatting options
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }], // Headings H1-H3
        ["bold", "italic", "underline", "strike"], // Text formatting
        [{ align: [] }], // Alignment (left, center, right, justify)
        [{ list: "ordered" }, { list: "bullet" }], // Lists
        ["blockquote", "code-block"], // Block elements
        ["link", "image", "video"], // Media support
        [{ color: [] }, { background: [] }], // Colors
        ["clean"], // Remove formatting
      ],
      handlers: {
        // Custom image handler - allows URL input or local file upload
        image: function () {
          const quill = quillRef.current?.getEditor();
          if (!quill) return;

          // Create file input for local upload
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.style.display = "none";
          document.body.appendChild(input);

          input.addEventListener("change", () => {
            const file = input.files?.[0];
            if (file) {
              // Check file size (max 5MB)
              if (file.size > 5 * 1024 * 1024) {
                alert("Image size must be less than 5MB");
                document.body.removeChild(input);
                return;
              }

              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, "image", dataUrl);
                document.body.removeChild(input);
              };
              reader.onerror = () => {
                alert("Error reading image file");
                document.body.removeChild(input);
              };
              reader.readAsDataURL(file);
            } else {
              // Fallback to URL input if no file selected
              const url = prompt("Enter image URL (or cancel to upload from computer):");
              if (url) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, "image", url);
              }
              document.body.removeChild(input);
            }
          });

          // Also show URL option
          const useUrl = confirm("Click OK to enter image URL, or Cancel to upload from computer");
          if (useUrl) {
            const url = prompt("Enter image URL:");
            if (url) {
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "image", url);
            }
            document.body.removeChild(input);
          } else {
            input.click();
          }
        },
        // Custom video handler - allows URL input
        video: function () {
          const quill = quillRef.current?.getEditor();
          if (!quill) return;

          const url = prompt("Enter video URL (YouTube, Vimeo, etc.):");
          if (url) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "video", url);
          }
        },
      },
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
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
  ];

  return (
    <div className={cn("rich-text-editor-wrapper", className)} onBlur={(e) => {
      // Prevent editor from losing focus unexpectedly
      if (quillRef.current && !e.currentTarget.contains(e.relatedTarget as Node)) {
        const editor = quillRef.current.getEditor();
        if (editor && document.activeElement !== editor.root) {
          // Editor is still valid, just lost focus naturally
        }
      }
    }}>
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
      `}</style>
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
    </div>
  );
}

