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
  slideCount: number;
  theme: string;
  presentationId: string;
  html: string;
  downloadLink: string;
  instructions: string;
}

export function PresentationPreview(props: PresentationPreviewProps) {
  const { title, slideCount, theme, html, downloadLink } = props;
  const { copy, copied } = useCopy();

  const handleDownload = React.useCallback(() => {
    const element = document.createElement('a');
    element.href = downloadLink;
    element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [downloadLink, title]);

  const handlePreview = React.useCallback(() => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  }, [html]);

  const handleCopyHTML = React.useCallback(() => {
    copy(html);
  }, [copy, html]);

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
          <Badge variant="secondary">{slideCount} slides</Badge>
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