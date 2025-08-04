import { JSONSchema7 } from "json-schema";
import { tool as createTool } from "ai";
import { jsonSchemaToZod } from "lib/json-schema-to-zod";
import { nanoid } from "nanoid";

const dartCodeDescription = `Dart code that will be executed. This tool provides properly formatted Dart code along with instructions for running it.

Features available in Dart:
- Strong static typing with type inference
- Object-oriented programming with classes and mixins
- Async/await for asynchronous programming
- Futures and Streams for reactive programming
- Rich standard library (dart:core, dart:io, dart:async, dart:convert, dart:math)
- Package imports from pub.dev (when running locally)
- Null safety by default

Use print() for output display. For Flutter widgets, this tool will provide complete runnable Flutter code.

Example code structure:
void main() {
  // Your code here
  print('Hello, Dart!');
}`;

export const dartExecutionSchema: JSONSchema7 = {
  type: "object",
  properties: {
    code: {
      type: "string",
      description: dartCodeDescription,
    },
    description: {
      type: "string",
      description: "Brief description of what this Dart code does",
    },
    isFlutter: {
      type: "boolean",
      description: "Whether this is Flutter UI code (default: false for console apps)",
      default: false,
    },
    packages: {
      type: "array",
      items: { type: "string" },
      description: "List of pub.dev packages used in this code (optional)",
    },
    dartVersion: {
      type: "string",
      description: "Minimum Dart version required (e.g., '3.0')",
      default: "3.0",
    },
  },
  required: ["code"],
};

export const dartExecutionTool = createTool({
  description: `Generate and provide Dart code with execution instructions. 
    Perfect for demonstrating Dart language features, algorithms, data structures, 
    Flutter widgets, async programming, and more. Provides ready-to-run code 
    with multiple execution options including DartPad, local development, and Flutter.`,
  parameters: jsonSchemaToZod(dartExecutionSchema),
  execute: async ({ 
    code, 
    description = "Dart code example", 
    isFlutter = false, 
    packages = [], 
    dartVersion = "3.0" 
  }) => {
    const codeId = nanoid(8);
    
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
    const codeBlob = encodeURIComponent(formattedCode);
    const downloadLink = `data:text/plain;charset=utf-8,${codeBlob}`;

    return {
      success: true,
      codeId,
      language: "dart",
      framework: isFlutter ? "flutter" : "console",
      dartVersion,
      description,
      packages,
      dartPadUrl,
      downloadLink,
      instructions: "Dart code generated successfully! Use DartPad for quick testing or copy to your local project.",
      code: formattedCode,
      pubspec: pubspecContent || null,
      runCommands: {
        dartpad: dartPadUrl,
        local: isFlutter ? "flutter run" : "dart run main.dart",
        compile: isFlutter ? "flutter build" : "dart compile exe main.dart"
      }
    };
  },
});