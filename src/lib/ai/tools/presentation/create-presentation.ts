import { tool as createTool } from "ai";
import { z } from "zod";

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
  execute: async () => {
    return "Success";
  },
});