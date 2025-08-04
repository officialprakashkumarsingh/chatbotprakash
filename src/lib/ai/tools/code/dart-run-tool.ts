import { JSONSchema7 } from "json-schema";
import { tool as createTool } from "ai";
import { jsonSchemaToZod } from "lib/json-schema-to-zod";

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
  execute: async () => {
    return "Success";
  },
});