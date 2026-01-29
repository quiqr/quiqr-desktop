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
import matter from 'gray-matter';

/**
 * Self object - metadata and content of the current file (for page context)
 */
export interface PageSelfObject {
  content: string;
  file_path: string;
  file_name: string;
  file_base_name: string;
  fields: Record<string, { content: unknown }>;
}

/**
 * Self object for field context - represents the current field
 */
export interface FieldSelfObject {
  content: string;
  key: string;
  type: string;
}

/**
 * Parent page object - represents the parent page in field context
 */
export interface ParentPageObject {
  content: string;
  file_path: string;
  file_name: string;
  file_base_name: string;
  fields: Record<string, { content: unknown }>;
}

/**
 * Legacy self object for backward compatibility
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
 * Context for page variable replacement
 */
export interface PageVariableContext {
  self: PageSelfObject | null;
  field: FieldObject;
  workspacePath: string;
  contextType: 'page';
}

/**
 * Context for field variable replacement
 */
export interface FieldVariableContext {
  self: FieldSelfObject | null;
  parent_page: ParentPageObject | null;
  field: FieldObject;
  workspacePath: string;
  contextType: 'field';
}

/**
 * Union type for all variable contexts
 */
export type VariableContext = PageVariableContext | FieldVariableContext;

/**
 * Parse frontmatter from content string
 */
function parseFrontmatter(content: string): {
  data: Record<string, unknown>;
  body: string;
} {
  try {
    const parsed = matter(content);
    return {
      data: parsed.data || {},
      body: parsed.content || '',
    };
  } catch (error) {
    console.error('Failed to parse frontmatter:', error);
    return {
      data: {},
      body: content,
    };
  }
}

/**
 * Convert frontmatter data to fields object
 */
function buildFieldsFromFrontmatter(
  data: Record<string, unknown>
): Record<string, { content: unknown }> {
  const fields: Record<string, { content: unknown }> = {};
  for (const [key, value] of Object.entries(data)) {
    fields[key] = { content: value };
  }
  return fields;
}

/**
 * Build page self object from a file path (with parsed frontmatter fields)
 */
export async function buildPageSelfObject(
  workspacePath: string,
  filePath: string
): Promise<PageSelfObject> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(workspacePath, filePath);

  // Read file content
  let content = '';
  try {
    content = await fs.readFile(absolutePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file for page self object: ${absolutePath}`, error);
    content = `[Could not read file: ${filePath}]`;
  }

  // Parse frontmatter
  const { data } = parseFrontmatter(content);
  const fields = buildFieldsFromFrontmatter(data);

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
    fields,
  };
}

/**
 * Build field self object (represents the current field in field context)
 */
export function buildFieldSelfObject(
  fieldKey: string,
  fieldType: string,
  fieldContent: string
): FieldSelfObject {
  return {
    content: fieldContent,
    key: fieldKey,
    type: fieldType,
  };
}

/**
 * Build parent page object (represents the parent page in field context)
 */
export async function buildParentPageObject(
  workspacePath: string,
  filePath: string
): Promise<ParentPageObject> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(workspacePath, filePath);

  // Read file content
  let content = '';
  try {
    content = await fs.readFile(absolutePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file for parent page object: ${absolutePath}`, error);
    content = `[Could not read file: ${filePath}]`;
  }

  // Parse frontmatter
  const { data } = parseFrontmatter(content);
  const fields = buildFieldsFromFrontmatter(data);

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
    fields,
  };
}

/**
 * Build self object from a file path (legacy - for backward compatibility)
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
 * Resolve a nested property path in an object
 * Supports paths like "fields.title.content" or "fields[key].content"
 */
function resolveNestedPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    // Handle array-like access with brackets (e.g., "fields[key]")
    const bracketMatch = part.match(/^(\w+)\[([^\]]+)\]$/);
    if (bracketMatch) {
      const objKey = bracketMatch[1];
      const nestedKey = bracketMatch[2];
      current = (current as Record<string, unknown>)[objKey];
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[nestedKey];
      } else {
        return undefined;
      }
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }

  return current;
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

  // Handle page context
  if (context.contextType === 'page') {
    if (objectName === 'self') {
      if (!context.self) {
        return '';
      }

      // Check for simple properties
      if (propertyPath in context.self) {
        return context.self[propertyPath as keyof PageSelfObject];
      }

      // Check for nested paths (e.g., "fields.title.content")
      return resolveNestedPath(context.self, propertyPath);
    } else if (objectName === 'field') {
      return resolveNestedPath(context.field, propertyPath);
    }
  }

  // Handle field context
  if (context.contextType === 'field') {
    if (objectName === 'self') {
      if (!context.self) {
        return '';
      }

      // Simple field properties
      if (propertyPath in context.self) {
        return context.self[propertyPath as keyof FieldSelfObject];
      }

      return '';
    } else if (objectName === 'parent_page') {
      if (!context.parent_page) {
        return '';
      }

      // Check for simple properties
      if (propertyPath in context.parent_page) {
        return context.parent_page[propertyPath as keyof ParentPageObject];
      }

      // Check for nested paths (e.g., "fields.title.content")
      return resolveNestedPath(context.parent_page, propertyPath);
    } else if (objectName === 'field') {
      return resolveNestedPath(context.field, propertyPath);
    }
  }

  return undefined;
}

function isKeyOfSelfObject(value: unknown, context: VariableContext): value is keyof SelfObject {
  // This function is now less useful with our new context types, but kept for potential legacy use
  return typeof value === 'string';
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
