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
    
    // Create instructions based on type
    const instructions = isFlutter ? `
🎯 **Flutter Code Generated Successfully!**

**${description}** (Dart ${dartVersion})
- Type: Flutter UI Application  
- Packages: ${packages.length > 0 ? packages.join(', ') : 'Flutter core only'}

**How to run this Flutter code:**

1. **DartPad (Recommended for quick testing):**
   - Visit: ${dartPadUrl}
   - Select "Flutter" mode
   - Paste the code and click "Run"
   - See live preview in browser

2. **Local Flutter Development:**
   \`\`\`bash
   # Create new Flutter project
   flutter create dart_example_${codeId}
   cd dart_example_${codeId}
   
   # Replace lib/main.dart with the generated code
   # If packages needed, update pubspec.yaml
   
   # Run the app
   flutter run
   \`\`\`

3. **VS Code / Android Studio:**
   - Create new Flutter project
   - Replace main.dart content
   - Press F5 or click "Run" button

**Features included:**
- Material Design components
- Responsive layout
- Hot reload support
- Cross-platform compatibility (iOS, Android, Web, Desktop)

**Next steps:**
- Modify the UI in the build() method
- Add state management with StatefulWidget
- Include navigation, animations, or custom widgets
- Test on different devices and screen sizes
    ` : `
🚀 **Dart Code Generated Successfully!**

**${description}** (Dart ${dartVersion})
- Type: Console Application
- Packages: ${packages.length > 0 ? packages.join(', ') : 'Dart core only'}

**How to run this Dart code:**

1. **DartPad (Quick online testing):**
   - Visit: ${dartPadUrl}
   - Paste the code and click "Run"
   - See output in console panel

2. **Local Dart Development:**
   \`\`\`bash
   # Save code as main.dart
   # Run directly
   dart run main.dart
   
   # Or compile and run
   dart compile exe main.dart
   ./main.exe
   \`\`\`

3. **VS Code with Dart extension:**
   - Create new .dart file
   - Paste the code
   - Press F5 or Ctrl+F5 to run

4. **Command line with Dart SDK:**
   \`\`\`bash
   # Install Dart SDK from dart.dev
   dart --version
   dart run main.dart
   \`\`\`

**Features demonstrated:**
- Modern Dart syntax with null safety
- ${packages.length > 0 ? `External packages: ${packages.join(', ')}` : 'Core Dart libraries'}
- Type-safe programming
- Async/await if applicable

**Learning resources:**
- Official Dart docs: dart.dev
- Dart packages: pub.dev
- Language tour: dart.dev/language
    `;

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
      instructions,
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