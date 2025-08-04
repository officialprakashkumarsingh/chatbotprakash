"use client";

import React from "react";
import { Badge } from "ui/badge";
import { Button } from "ui/button";
import { Card, CardContent, CardHeader } from "ui/card";
import { Copy, Download, ExternalLink, Check } from "lucide-react";
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
  
  const { copy, copied } = useCopy();

  // Process the raw arguments to generate the formatted code
  const formattedCode = React.useMemo(() => {
    let processedCode = code.trim();
    
    // Add main function if not present and not Flutter
    if (!isFlutter && !processedCode.includes('void main(') && !processedCode.includes('main(')) {
      // Wrap code in main function if it's not already there
      if (!processedCode.startsWith('import ') && !processedCode.startsWith('library ')) {
        processedCode = `void main() {\n  ${processedCode.split('\n').join('\n  ')}\n}`;
      }
    }

    // For Flutter, ensure it has proper widget structure
    if (isFlutter && !processedCode.includes('class ') && !processedCode.includes('Widget')) {
      processedCode = `import 'package:flutter/material.dart';

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
          child: ${processedCode.includes('Widget') ? processedCode : `Text('${processedCode}')`},
        ),
      ),
    );
  }
}`;
    }

    return processedCode;
  }, [code, description, isFlutter]);

  const handleCopy = React.useCallback(() => {
    copy(formattedCode);
  }, [copy, formattedCode]);

  const handleOpenDartPad = React.useCallback(() => {
    window.open(`https://dartpad.dev/?null_safety=true${isFlutter ? '&run=dart&split=false' : ''}`, '_blank');
  }, [isFlutter]);

  const handleDownload = React.useCallback(() => {
    const element = document.createElement('a');
    element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(formattedCode)}`;
    element.download = `${description.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.dart`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [formattedCode, description]);

  return (
    <Card className="flex flex-col bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Dart Code</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleOpenDartPad}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
            >
              <ExternalLink className="size-3 mr-1" />
              DartPad
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
            >
              <Download className="size-3 mr-1" />
              Download
            </Button>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={isFlutter ? "default" : "secondary"}>
            {isFlutter ? "Flutter" : "Dart"}
          </Badge>
          <Badge variant="outline">v{dartVersion}</Badge>
          {packages.length > 0 && (
            <Badge variant="outline">{packages.length} packages</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="border rounded-lg overflow-hidden">
          <CodeBlock
            code={formattedCode}
            lang="dart"
            className="text-sm max-h-[500px] overflow-y-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
}