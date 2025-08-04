import { tool as createTool } from "ai";
import { z } from "zod";
import { nanoid } from "nanoid";

const slideSchema = z.object({
  title: z.string().describe("Slide title"),
  content: z.string().describe("Slide content in markdown format"),
  layout: z.enum(["title", "content", "two-column", "image", "quote"]).default("content").describe("Slide layout type"),
  backgroundImage: z.string().optional().describe("Background image URL"),
  backgroundColor: z.string().optional().describe("Background color (hex code)"),
  transition: z.enum(["slide", "fade", "convex", "concave", "zoom"]).default("slide").describe("Slide transition effect"),
});

export const createPresentationTool = createTool({
  description: `Create beautiful, interactive HTML presentations using Reveal.js. 
    Perfect for professional presentations, educational content, pitch decks, and more. 
    Supports various slide layouts, transitions, themes, and interactive elements.`,
  parameters: z.object({
    title: z.string().describe("Presentation title"),
    description: z.string().optional().describe("Presentation description"),
    author: z.string().optional().describe("Presentation author"),
    theme: z.enum([
      "black", "white", "league", "beige", "sky", 
      "night", "serif", "simple", "solarized", "blood", "moon"
    ]).default("black").describe("Presentation theme"),
    slides: z.array(slideSchema).min(1).describe("Array of slides"),
    showControls: z.boolean().default(true).describe("Show navigation controls"),
    showProgress: z.boolean().default(true).describe("Show progress bar"),
    enableHistory: z.boolean().default(true).describe("Enable browser history"),
    enableKeyboard: z.boolean().default(true).describe("Enable keyboard navigation"),
    autoSlide: z.number().optional().describe("Auto slide duration in milliseconds (0 to disable)"),
    loop: z.boolean().default(false).describe("Loop presentation"),
    center: z.boolean().default(true).describe("Center slides vertically"),
    touch: z.boolean().default(true).describe("Enable touch navigation"),
    embedded: z.boolean().default(false).describe("Embedded mode for iframe"),
  }),
  execute: async ({
    title,
    description = "",
    author = "",
    theme,
    slides,
    showControls,
    showProgress,
    enableHistory,
    enableKeyboard,
    autoSlide,
    loop,
    center,
    touch,
    embedded,
  }) => {
    const presentationId = nanoid();
    
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
      success: true,
      presentationId,
      title,
      slideCount: slides.length,
      theme,
      downloadLink,
      html: presentationHTML,
      instructions: "Presentation created successfully! Use the preview to view, download HTML file, or open in new window."
    };
  },
});