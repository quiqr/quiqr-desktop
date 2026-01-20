/**
 * Prompt Template Processor
 *
 * Processes prompt templates with variable replacement supporting:
 * - self.* variables (current file metadata and content)
 * - field.* variables (form field values)
 * - func.* functions (with pipe syntax)
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Self object - metadata and content of the current file
 */
export interface SelfObject {
  content: string;
  file_path: string;
  file_name: string;
  file_base_name: string;
}

/**
 * Field object - form field values from the prompt template
 */
export type FieldObject = Record<string, unknown>;

/**
 * Context for variable replacement
 */
export interface VariableContext {
  self: SelfObject | null;
  field: FieldObject;
  workspacePath: string;
}

/**
 * Build self object from a file path
 */
export async function buildSelfObject(
  workspacePath: string,
  filePath: string
): Promise<SelfObject> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(workspacePath, filePath);

  // Read file content
  let content = '';
  try {
    content = await fs.readFile(absolutePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file for self object: ${absolutePath}`, error);
    content = `[Could not read file: ${filePath}]`;
  }

  // Extract file path relative to workspace
  const relativePath = path.relative(workspacePath, absolutePath);

  // Extract file name
  const fileName = path.basename(absolutePath);

  // Extract base name (without extension)
  const baseName = path.basename(absolutePath, path.extname(absolutePath));

  return {
    content,
    file_path: relativePath,
    file_name: fileName,
    file_base_name: baseName,
  };
}

/**
 * Read a file relative to workspace root
 */
async function funcReadFile(
  filePath: string,
  workspacePath: string
): Promise<string> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(workspacePath, filePath);

  try {
    return await fs.readFile(absolutePath, 'utf-8');
  } catch {
    return `Could not read: ${filePath}`;
  }
}

/**
 * Convert string to uppercase
 */
function funcToUpper(input: string): string {
  return String(input).toUpperCase();
}

/**
 * Resolve a variable expression to its value
 */
function resolveVariable(
  expression: string,
  context: VariableContext
): string | unknown {
  const trimmed = expression.trim();

  // Split by first dot to get object and property path
  const firstDotIndex = trimmed.indexOf('.');
  if (firstDotIndex === -1) {
    return undefined;
  }

  const objectName = trimmed.substring(0, firstDotIndex);
  const propertyPath = trimmed.substring(firstDotIndex + 1);

  // Resolve based on object type
  if (objectName === 'self') {
    if (!context.self || !isKeyOfSelfObject(propertyPath, context)) {
      return '';
    }

    return context.self[propertyPath];
    
  } else if (objectName === 'field') {
    return context.field[propertyPath];
  }

  return undefined;
}

function isKeyOfSelfObject(value: unknown, context: VariableContext): value is keyof SelfObject {
  return typeof value === 'string' && context.self !== null && value in context.self;
}

/**
 * Apply a function to a value
 */
async function applyFunction(
  value: unknown,
  funcExpression: string,
  context: VariableContext
): Promise<unknown> {
  const trimmed = funcExpression.trim();

  // Parse function name (e.g., "func.readFile")
  if (!trimmed.startsWith('func.')) {
    throw new Error(`Invalid function expression: ${funcExpression}`);
  }

  const funcName = trimmed.substring(5); // Remove "func."

  // Convert value to string for function processing
  const stringValue = String(value || '');

  // Apply function
  switch (funcName) {
    case 'readFile':
      return await funcReadFile(stringValue, context.workspacePath);
    case 'toUpper':
      return funcToUpper(stringValue);
    default:
      throw new Error(`Unknown function: ${funcName}`);
  }
}

/**
 * Process a single variable expression (may include pipes)
 */
async function processExpression(
  expression: string,
  context: VariableContext
): Promise<string> {
  const trimmed = expression.trim();

  // Check if expression contains pipe
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|').map(p => p.trim());
    const variableExpr = parts[0];
    const functionExprs = parts.slice(1);

    // Resolve the variable first
    let value = resolveVariable(variableExpr, context);

    // Apply each function in the chain
    for (const funcExpr of functionExprs) {
      value = await applyFunction(value, funcExpr, context);
    }

    return String(value || '');
  } else {
    // No pipe, just resolve variable
    const value = resolveVariable(trimmed, context);
    return String(value ?? '');
  }
}

/**
 * Process a prompt template and replace all variables
 */
export async function processPromptTemplate(
  templateText: string,
  context: VariableContext
): Promise<string> {
  // Find all {{ ... }} patterns
  const variablePattern = /\{\{([^}]+)\}\}/g;

  let result = templateText;
  const matches = Array.from(templateText.matchAll(variablePattern));

  // Process each match (in reverse to maintain string positions)
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const fullMatch = match[0];
    const expression = match[1];
    const startIndex = match.index!;

    try {
      // Process the expression
      const replacement = await processExpression(expression, context);

      // Replace in result string
      result = result.substring(0, startIndex) +
               replacement +
               result.substring(startIndex + fullMatch.length);
    } catch (error) {
      console.error(`Error processing variable expression: ${expression}`, error);
      // Leave the variable as-is on error
    }
  }

  return result;
}
