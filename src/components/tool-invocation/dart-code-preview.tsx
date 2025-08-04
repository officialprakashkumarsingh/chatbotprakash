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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  ExternalLink, 
  Copy,
  Check,
  Play,
  FileCode,
  Smartphone,
  Monitor,
  Globe
} from "lucide-react";
import { JsonViewPopup } from "../json-view-popup";
import { useCopy } from "@/hooks/use-copy";
import { CodeBlock } from "ui/CodeBlock";

export interface DartCodePreviewProps {
  codeId: string;
  language: string;
  framework: string;
  dartVersion: string;
  description: string;
  packages: string[];
  dartPadUrl: string;
  downloadLink: string;
  instructions: string;
  code: string;
  pubspec: string | null;
  runCommands: {
    dartpad: string;
    local: string;
    compile: string;
  };
}

export function DartCodePreview(props: DartCodePreviewProps) {
  const { 
    description, 
    framework, 
    dartVersion, 
    packages, 
    dartPadUrl, 
    code, 
    pubspec, 
    runCommands 
  } = props;
  
  const { copy } = useCopy();
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedPubspec, setCopiedPubspec] = React.useState(false);

  const isFlutter = framework === "flutter";

  const handleCopyCode = React.useCallback(() => {
    copy(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [copy, code]);

  const handleCopyPubspec = React.useCallback(() => {
    if (pubspec) {
      copy(pubspec);
      setCopiedPubspec(true);
      setTimeout(() => setCopiedPubspec(false), 2000);
    }
  }, [copy, pubspec]);

  const handleOpenDartPad = React.useCallback(() => {
    window.open(dartPadUrl, '_blank');
  }, [dartPadUrl]);

  const handleDownload = React.useCallback(() => {
    const element = document.createElement('a');
    element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(code)}`;
    element.download = `${description.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.dart`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [code, description]);

  return (
    <Card className="flex flex-col bg-card">
      <CardHeader className="items-center pb-4 flex flex-col gap-2 relative">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <CardTitle className="flex items-center gap-2">
            {description}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <JsonViewPopup data={props} />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={isFlutter ? "default" : "secondary"}>
            {isFlutter ? "Flutter" : "Console"}
          </Badge>
          <Badge variant="outline">Dart {dartVersion}</Badge>
          {packages.length > 0 && (
            <Badge variant="outline">{packages.length} packages</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            onClick={handleOpenDartPad} 
            className="flex items-center gap-2"
            variant="default"
          >
            <Play className="size-4" />
            Run in DartPad
          </Button>
          <Button 
            onClick={handleCopyCode} 
            className="flex items-center gap-2"
            variant="outline"
          >
            {copiedCode ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy Code
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
            onClick={() => window.open('https://dart.dev/', '_blank')} 
            className="flex items-center gap-2"
            variant="ghost"
          >
            <ExternalLink className="size-4" />
            Dart Docs
          </Button>
        </div>

        {/* Code Tabs */}
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code">main.dart</TabsTrigger>
            {pubspec && <TabsTrigger value="pubspec">pubspec.yaml</TabsTrigger>}
            <TabsTrigger value="commands">Run Commands</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">main.dart</span>
              <Button 
                onClick={handleCopyCode}
                variant="ghost" 
                size="sm"
                className="h-8"
              >
                {copiedCode ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copiedCode ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <CodeBlock
                code={code}
                lang="dart"
                className="text-xs max-h-[400px] overflow-y-auto"
              />
            </div>
          </TabsContent>
          
          {pubspec && (
            <TabsContent value="pubspec" className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">pubspec.yaml</span>
                <Button 
                  onClick={handleCopyPubspec}
                  variant="ghost" 
                  size="sm"
                  className="h-8"
                >
                  {copiedPubspec ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copiedPubspec ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <CodeBlock
                  code={pubspec}
                  lang="yaml"
                  className="text-xs max-h-[300px] overflow-y-auto"
                />
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="commands" className="space-y-3">
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">🌐 Online (DartPad)</h4>
                <p className="text-xs text-muted-foreground mb-2">Run instantly in browser</p>
                <Button 
                  onClick={handleOpenDartPad}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  Open DartPad
                </Button>
              </div>
              
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">💻 Local Development</h4>
                <p className="text-xs text-muted-foreground mb-2">Run on your machine</p>
                <div className="bg-muted rounded p-2 text-xs font-mono">
                  {runCommands.local}
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">📦 Compile & Build</h4>
                <p className="text-xs text-muted-foreground mb-2">Create executable</p>
                <div className="bg-muted rounded p-2 text-xs font-mono">
                  {runCommands.compile}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Globe className="size-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cross Platform</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            {isFlutter ? <Smartphone className="size-5 text-muted-foreground" /> : <Monitor className="size-5 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">{isFlutter ? 'Mobile UI' : 'Console App'}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FileCode className="size-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Type Safe</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Play className="size-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Hot Reload</span>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Quick Start:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. Click &quot;Run in DartPad&quot; for instant execution</p>
            <p>2. Or copy code and paste into your Dart/Flutter project</p>
            {isFlutter && <p>3. For Flutter: Create new project and replace lib/main.dart</p>}
            {packages.length > 0 && <p>4. Add dependencies from pubspec.yaml if needed</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}