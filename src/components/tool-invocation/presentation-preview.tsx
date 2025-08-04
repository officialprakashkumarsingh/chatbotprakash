"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  ExternalLink, 
  Eye, 
  Presentation,
  Monitor,
  Smartphone,
  FileText
} from "lucide-react";
import { JsonViewPopup } from "../json-view-popup";
import { useCopy } from "@/hooks/use-copy";

export interface PresentationPreviewProps {
  title: string;
  description?: string;
  author?: string;
  theme: string;
  slides: Array<{
    title: string;
    content: string;
    layout?: "title" | "content" | "two-column" | "image" | "quote";
    backgroundImage?: string;
    backgroundColor?: string;
    transition?: "slide" | "fade" | "convex" | "concave" | "zoom";
  }>;
  showControls?: boolean;
  showProgress?: boolean;
  enableHistory?: boolean;
  enableKeyboard?: boolean;
  autoSlide?: number;
  loop?: boolean;
  center?: boolean;
  touch?: boolean;
  embedded?: boolean;
}

export function PresentationPreview(props: PresentationPreviewProps) {
  const { 
    title, 
    theme, 
    slides,
    description = "",
    author = "",
    showControls = true,
    showProgress = true,
    enableHistory = true,
    enableKeyboard = true,
    autoSlide,
    loop = false,
    center = true,
    touch = true,
    embedded = false
  } = props;
  const { copy, copied } = useCopy();

  // Process the raw arguments to generate the presentation HTML
  const processedData = React.useMemo(() => {
    const presentationId = Math.random().toString(36).substring(7);
    
    // Generate slide HTML
    const slideElements = slides.map((slide, index) => {
      let slideStyle = "";
      
      // Apply background styling
      if (slide.backgroundImage) {
        slideStyle += `data-background-image="${slide.backgroundImage}" `;
      }
      if (slide.backgroundColor) {
        slideStyle += `data-background-color="${slide.backgroundColor}" `;
      }
      
      // Apply transition
      if (slide.transition) {
        slideStyle += `data-transition="${slide.transition}" `;
      }

      // Generate slide content based on layout
      let slideContent = "";
      
      switch (slide.layout) {
        case "title":
          slideContent = `
            <h1>${slide.title}</h1>
            ${slide.content ? `<p class="subtitle">${slide.content}</p>` : ""}
          `;
          break;
          
        case "two-column":
          const contentParts = slide.content.split("---COLUMN---");
          slideContent = `
            <h2>${slide.title}</h2>
            <div class="two-columns">
              <div class="column">
                ${contentParts[0] || ""}
              </div>
              <div class="column">
                ${contentParts[1] || ""}
              </div>
            </div>
          `;
          break;
          
        case "image":
          const imageParts = slide.content.split("---IMAGE---");
          slideContent = `
            <h2>${slide.title}</h2>
            ${imageParts[0] ? `<p>${imageParts[0]}</p>` : ""}
            ${imageParts[1] ? `<img src="${imageParts[1]}" alt="${slide.title}" style="max-width: 80%; height: auto;">` : ""}
          `;
          break;
          
        case "quote":
          slideContent = `
            <blockquote cite="">
              <p>${slide.content}</p>
            </blockquote>
            <cite>— ${slide.title}</cite>
          `;
          break;
          
        default: // content
          slideContent = `
            <h2>${slide.title}</h2>
            <div class="content">
              ${slide.content.split('\n').map(line => {
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                  return `<li>${line.trim().substring(2)}</li>`;
                }
                return line.trim() ? `<p>${line.trim()}</p>` : '';
              }).filter(Boolean).join('')}
            </div>
          `;
          
          // Wrap list items in ul tags
          slideContent = slideContent.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
          break;
      }

      return `<section ${slideStyle}>${slideContent}</section>`;
    }).join('\n        ');

    // Generate complete HTML presentation
    const presentationHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="${author}">
  
  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/theme/${theme}.css">
  
  <!-- Custom styles -->
  <style>
    .reveal .slides {
      text-align: left;
    }
    
    .reveal .slides section.center {
      text-align: center;
    }
    
    .reveal h1, .reveal h2, .reveal h3 {
      text-align: center;
      margin-bottom: 1em;
    }
    
    .reveal .subtitle {
      font-size: 1.2em;
      color: #888;
      text-align: center;
    }
    
    .reveal .two-columns {
      display: flex;
      gap: 2em;
    }
    
    .reveal .two-columns .column {
      flex: 1;
    }
    
    .reveal .content ul {
      list-style: none;
      padding-left: 0;
    }
    
    .reveal .content li {
      margin: 0.8em 0;
      position: relative;
      padding-left: 1.5em;
    }
    
    .reveal .content li:before {
      content: "▶";
      position: absolute;
      left: 0;
      color: #42b883;
    }
    
    .reveal blockquote {
      font-style: italic;
      text-align: center;
      font-size: 1.4em;
      line-height: 1.6;
      border-left: 5px solid #42b883;
      padding-left: 2em;
      margin: 2em 0;
    }
    
    .reveal cite {
      display: block;
      text-align: right;
      margin-top: 1em;
      font-size: 0.8em;
      color: #888;
    }
    
    .reveal img {
      border: none;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      border-radius: 8px;
    }
    
    .reveal .progress {
      color: #42b883;
    }
    
    .reveal .controls {
      color: #42b883;
    }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${slideElements}
    </div>
  </div>
  
  <!-- Reveal.js JavaScript -->
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/notes/notes.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/markdown/markdown.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/highlight/highlight.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/zoom/zoom.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/search/search.js"></script>
  
  <script>
    Reveal.initialize({
      hash: ${enableHistory},
      controls: ${showControls},
      progress: ${showProgress},
      center: ${center},
      touch: ${touch},
      loop: ${loop},
      embedded: ${embedded},
      keyboard: ${enableKeyboard},
      ${autoSlide ? `autoSlide: ${autoSlide},` : ''}
      transition: 'slide',
      backgroundTransition: 'fade',
      
      // Plugin configuration
      plugins: [
        RevealNotes,
        RevealMarkdown, 
        RevealHighlight,
        RevealZoom,
        RevealSearch
      ],
      
      // Keyboard shortcuts
      keyboard: {
        13: 'next', // go to the next slide when the ENTER key is pressed
        27: function() { // ESC key - toggle overview
          if (Reveal.isOverview()) {
            Reveal.toggleOverview();
          } else {
            Reveal.toggleOverview();
          }
        }
      }
    });
    
    // Add custom event listeners
    Reveal.on('ready', event => {
      console.log('Presentation ready:', event);
    });
    
    Reveal.on('slidechanged', event => {
      console.log('Slide changed to:', event.indexh, event.indexv);
    });
  </script>
</body>
</html>`;

    const downloadLink = `data:text/html;charset=utf-8,${encodeURIComponent(presentationHTML)}`;
    
    return {
      presentationHTML,
      downloadLink,
      presentationId,
      slideCount: slides.length
    };
  }, [title, description, author, theme, slides, showControls, showProgress, enableHistory, enableKeyboard, autoSlide, loop, center, touch, embedded]);

  const handleDownload = React.useCallback(() => {
    const element = document.createElement('a');
    element.href = processedData.downloadLink;
    element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [processedData.downloadLink, title]);

  const handlePreview = React.useCallback(() => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(processedData.presentationHTML);
      newWindow.document.close();
    }
  }, [processedData.presentationHTML]);

  const handleCopyHTML = React.useCallback(() => {
    copy(processedData.presentationHTML);
  }, [copy, processedData.presentationHTML]);

  return (
    <Card className="flex flex-col bg-card">
      <CardHeader className="items-center pb-4 flex flex-col gap-2 relative">
        <div className="flex items-center gap-2">
          <Presentation className="size-5 text-primary" />
          <CardTitle className="flex items-center gap-2">
            {title}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <JsonViewPopup data={props} />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{processedData.slideCount} slides</Badge>
          <Badge variant="outline">{theme} theme</Badge>
          <Badge variant="outline">Reveal.js</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Preview Area */}
        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
          <div className="aspect-video flex items-center justify-center p-8">
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-lg p-6 w-full max-w-md text-center">
              <div className="size-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Presentation className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Interactive HTML Presentation
              </p>
              <div className="flex justify-center gap-2">
                <div className="size-2 rounded-full bg-primary/40"></div>
                <div className="size-2 rounded-full bg-primary"></div>
                <div className="size-2 rounded-full bg-primary/40"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            onClick={handlePreview} 
            className="flex items-center gap-2"
            variant="default"
          >
            <Eye className="size-4" />
            Preview
          </Button>
          <Button 
            onClick={handleDownload} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="size-4" />
            Download
          </Button>
          <Button 
            onClick={handleCopyHTML} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <FileText className="size-4" />
            {copied ? 'Copied!' : 'Copy HTML'}
          </Button>
          <Button 
            onClick={() => window.open('https://revealjs.com/', '_blank')} 
            className="flex items-center gap-2"
            variant="ghost"
          >
            <ExternalLink className="size-4" />
            Reveal.js
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Monitor className="size-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Desktop Ready</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Smartphone className="size-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Mobile Friendly</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Presentation className="size-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Interactive</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ExternalLink className="size-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Shareable</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Usage Instructions:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Click &quot;Preview&quot; to open in new window</p>
            <p>• Use arrow keys or click controls to navigate</p>
            <p>• Press ESC for overview mode</p>
            <p>• Press F for fullscreen presentation</p>
            <p>• Download HTML file to host anywhere</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}