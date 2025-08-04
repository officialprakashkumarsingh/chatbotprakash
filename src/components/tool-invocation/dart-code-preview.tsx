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
  code: string;
  description?: string;
  isFlutter?: boolean;
  packages?: string[];
  dartVersion?: string;
}

export function DartCodePreview(props: DartCodePreviewProps) {
  const { 
    code, 
    description = "Dart code example", 
    isFlutter = false, 
    packages = [], 
    dartVersion = "3.0" 
  } = props;
  
  const { copy } = useCopy();
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedPubspec, setCopiedPubspec] = React.useState(false);

  // Process the raw arguments to generate the formatted code and derived data
  const processedData = React.useMemo(() => {
    const codeId = Math.random().toString(36).substring(7);
    
    // Clean up and format the code
    let formattedCode = code.trim();
    
    // Add main function if not present and not Flutter
    if (!isFlutter && !formattedCode.includes('void main(') && !formattedCode.includes('main(')) {
      // Wrap code in main function if it's not already there
      if (!formattedCode.startsWith('import ') && !formattedCode.startsWith('library ')) {
        formattedCode = `void main() {\n  ${formattedCode.split('\n').join('\n  ')}\n}`;
      }
    }

    // For Flutter, ensure it has proper widget structure
    if (isFlutter && !formattedCode.includes('class ') && !formattedCode.includes('Widget')) {
      formattedCode = `import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text('${description}')),
        body: Center(
          child: ${formattedCode.includes('Widget') ? formattedCode : `Text('${formattedCode}')`},
        ),
      ),
    );
  }
}`;
    }

    // Generate pubspec.yaml content if packages are specified
    let pubspecContent = "";
    if (packages.length > 0) {
      pubspecContent = `name: dart_example_${codeId}
description: ${description}
version: 1.0.0

environment:
  sdk: '>=${dartVersion} <4.0.0'
  ${isFlutter ? 'flutter: ">=3.0.0"' : ''}

dependencies:
  ${isFlutter ? 'flutter:\n    sdk: flutter' : ''}
  ${packages.map(pkg => {
    // Handle package:version format
    if (pkg.includes(':')) {
      const [name, version] = pkg.split(':');
      return `${name}: ^${version}`;
    }
    return `${pkg}: ^1.0.0`;
  }).join('\n  ')}

${isFlutter ? `dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true` : ''}`;
    }

    // Create DartPad URL for easy access
    const dartPadUrl = `https://dartpad.dev/?null_safety=true${isFlutter ? '&run=dart&split=false' : ''}`;
    
    // Generate download link for the code
    const downloadLink = `data:text/plain;charset=utf-8,${encodeURIComponent(formattedCode)}`;

    const runCommands = {
      dartpad: dartPadUrl,
      local: isFlutter ? "flutter run" : "dart run main.dart",
      compile: isFlutter ? "flutter build" : "dart compile exe main.dart"
    };

    return {
      formattedCode,
      pubspecContent: pubspecContent || null,
      dartPadUrl,
      downloadLink,
      runCommands,
      framework: isFlutter ? "flutter" : "console"
    };
  }, [code, description, isFlutter, packages, dartVersion]);

  const handleCopyCode = React.useCallback(() => {
    copy(processedData.formattedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [copy, processedData.formattedCode]);

  const handleCopyPubspec = React.useCallback(() => {
    if (processedData.pubspecContent) {
      copy(processedData.pubspecContent);
      setCopiedPubspec(true);
      setTimeout(() => setCopiedPubspec(false), 2000);
    }
  }, [copy, processedData.pubspecContent]);

  const handleOpenDartPad = React.useCallback(() => {
    window.open(processedData.dartPadUrl, '_blank');
  }, [processedData.dartPadUrl]);

  const handleDownload = React.useCallback(() => {
    const element = document.createElement('a');
    element.href = processedData.downloadLink;
    element.download = `${description.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.dart`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [processedData.downloadLink, description]);

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
            {processedData.pubspecContent && <TabsTrigger value="pubspec">pubspec.yaml</TabsTrigger>}
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
                code={processedData.formattedCode}
                lang="dart"
                className="text-xs max-h-[400px] overflow-y-auto"
              />
            </div>
          </TabsContent>
          
          {processedData.pubspecContent && (
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
                  code={processedData.pubspecContent}
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
                  {processedData.runCommands.local}
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">📦 Compile & Build</h4>
                <p className="text-xs text-muted-foreground mb-2">Create executable</p>
                <div className="bg-muted rounded p-2 text-xs font-mono">
                  {processedData.runCommands.compile}
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