#!/usr/bin/env node

/**
 * Scaffold a new SukohForm field component.
 *
 * Usage: npm run scaffold:field -- MyFieldName
 *
 * This script will:
 * 1. Create a new field component in frontend/src/components/SukohForm/fields/
 * 2. Register the field in FieldRegistry.ts
 * 3. Add the Zod schema and type export in packages/types/src/schemas/fields.ts
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`  ${message}`, colors.dim);
}

// Convert PascalCase to kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

// Convert PascalCase to camelCase
function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// Validate field name
function validateFieldName(name) {
  if (!name) {
    return 'Field name is required';
  }
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return 'Field name must be PascalCase (e.g., MyField, Rating, ColorPicker)';
  }
  if (name.endsWith('Field')) {
    return 'Field name should not end with "Field" (it will be added automatically)';
  }
  return null;
}

// Generate the component template
function generateComponentTemplate(name) {
  const fieldType = toKebabCase(name);
  const configType = `${name}Field`;
  const configTypeAs = `${name}FieldConfig`;

  return `import FormItemWrapper from '../components/shared/FormItemWrapper';
import DefaultWrapper from '../components/shared/DefaultWrapper';
import Tip from '../../Tip';
import { useField } from '../useField';
import type { ${configType} as ${configTypeAs} } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * ${name}Field - TODO: Add description
 */
function ${name}Field({ compositeKey }: Props) {
  const { field, value, setValue } = useField<string>(compositeKey);
  const config = field as ${configTypeAs};

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  const handleChange = (newValue: string) => {
    setValue(newValue, 250);
  };

  return (
    <FormItemWrapper
      control={
        <DefaultWrapper>
          <label style={{ display: 'block', marginBottom: 8 }}>
            {config.title ?? config.key}
          </label>
          {/* TODO: Implement your field UI here */}
          <div>
            Value: {value ?? config.default ?? '(empty)'}
          </div>
        </DefaultWrapper>
      }
      iconButtons={iconButtons}
    />
  );
}

export default ${name}Field;
`;
}

// Generate the schema addition
function generateSchemaAddition(name) {
  const fieldType = toKebabCase(name);
  const schemaName = `${toCamelCase(name)}FieldSchema`;

  return {
    schema: `export const ${schemaName} = baseFieldSchema.extend({
  type: z.literal('${fieldType}'),
  default: z.string().optional(),
  tip: z.string().optional(),
  autoSave: z.boolean().optional()
})`,
    schemaName,
    typeName: `${name}Field`,
    fieldType,
  };
}

// Update FieldRegistry.ts
function updateFieldRegistry(name, rootDir) {
  const registryPath = path.join(
    rootDir,
    'frontend/src/components/SukohForm/FieldRegistry.ts'
  );

  if (!fs.existsSync(registryPath)) {
    throw new Error(`FieldRegistry.ts not found at ${registryPath}`);
  }

  const content = fs.readFileSync(registryPath, 'utf-8');
  const fieldType = toKebabCase(name);
  const componentName = `${name}Field`;

  // Check if already registered
  if (content.includes(`'${fieldType}'`)) {
    return { skipped: true, reason: `Field type '${fieldType}' already registered` };
  }

  // Find the line with 'not-found' registration (insert before it)
  const notFoundLine = "this.components.set('not-found'";
  const insertPosition = content.indexOf(notFoundLine);

  if (insertPosition === -1) {
    throw new Error("Could not find insertion point in FieldRegistry.ts");
  }

  // Find the start of the line
  let lineStart = insertPosition;
  while (lineStart > 0 && content[lineStart - 1] !== '\n') {
    lineStart--;
  }

  // Get the indentation
  const indentation = content.slice(lineStart, insertPosition).match(/^\s*/)[0];

  // Create the new registration line
  const newLine = `${indentation}this.components.set('${fieldType}', () => import('./fields/${componentName}'));\n\n`;

  // Insert the new line
  const updatedContent = content.slice(0, lineStart) + newLine + content.slice(lineStart);

  fs.writeFileSync(registryPath, updatedContent);
  return { skipped: false };
}

// Update fields.ts schema file
function updateFieldsSchema(name, rootDir) {
  const schemaPath = path.join(
    rootDir,
    'packages/types/src/schemas/fields.ts'
  );

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`fields.ts not found at ${schemaPath}`);
  }

  let content = fs.readFileSync(schemaPath, 'utf-8');
  const { schema, schemaName, typeName, fieldType } = generateSchemaAddition(name);

  // Check if already exists
  if (content.includes(schemaName)) {
    return { skipped: true, reason: `Schema '${schemaName}' already exists` };
  }

  // 1. Add schema definition (before CoreFields)
  const coreFieldsMarker = 'export const CoreFields = {';
  const coreFieldsPosition = content.indexOf(coreFieldsMarker);

  if (coreFieldsPosition === -1) {
    throw new Error("Could not find CoreFields in fields.ts");
  }

  const schemaInsertion = `${schema}\n\n`;
  content = content.slice(0, coreFieldsPosition) + schemaInsertion + content.slice(coreFieldsPosition);

  // 2. Add to CoreFields object - find the closing } as const
  const coreFieldsStart = content.indexOf(coreFieldsMarker);
  const coreFieldsEndMarker = '} as const';
  const coreFieldsEnd = content.indexOf(coreFieldsEndMarker, coreFieldsStart);

  if (coreFieldsEnd === -1) {
    throw new Error("Could not find end of CoreFields in fields.ts");
  }

  // Insert before the closing brace
  const camelName = toCamelCase(name);
  const newCoreFieldEntry = `,\n  ${camelName}: ${schemaName}\n`;
  // Find the position right before "} as const" (trim any trailing whitespace/newlines from entries)
  let insertPos = coreFieldsEnd;
  while (insertPos > 0 && /\s/.test(content[insertPos - 1])) {
    insertPos--;
  }
  content = content.slice(0, insertPos) + newCoreFieldEntry + content.slice(coreFieldsEnd);

  // 3. Add to coreFieldSchemas array
  const coreFieldSchemasMarker = 'export const coreFieldSchemas = [';
  const coreFieldSchemasStart = content.indexOf(coreFieldSchemasMarker);
  const coreFieldSchemasEnd = content.indexOf('] as const', coreFieldSchemasStart);

  if (coreFieldSchemasEnd === -1) {
    throw new Error("Could not find end of coreFieldSchemas in fields.ts");
  }

  // Insert before the closing bracket
  const newSchemaEntry = `,\n  ${schemaName}\n`;
  insertPos = coreFieldSchemasEnd;
  while (insertPos > 0 && /\s/.test(content[insertPos - 1])) {
    insertPos--;
  }
  content = content.slice(0, insertPos) + newSchemaEntry + content.slice(coreFieldSchemasEnd);

  // 4. Add type export (at the end, before the last export type Field line)
  const fieldTypeExportMarker = 'export type Field = z.infer<typeof fieldSchema>';
  const fieldTypeExportPosition = content.indexOf(fieldTypeExportMarker);

  if (fieldTypeExportPosition !== -1) {
    const typeExport = `export type ${typeName} = z.infer<typeof ${schemaName}>\n`;
    content = content.slice(0, fieldTypeExportPosition) + typeExport + content.slice(fieldTypeExportPosition);
  }

  fs.writeFileSync(schemaPath, content);
  return { skipped: false, fieldType };
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const name = args[0];

  // Validate
  const validationError = validateFieldName(name);
  if (validationError) {
    logError(validationError);
    console.log('\nUsage: npm run scaffold:field -- FieldName');
    console.log('\nExamples:');
    console.log('  npm run scaffold:field -- Rating');
    console.log('  npm run scaffold:field -- ColorPicker');
    console.log('  npm run scaffold:field -- DateRange');
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, '..');
  const fieldType = toKebabCase(name);
  const componentName = `${name}Field`;

  log(`\nScaffolding new field: ${componentName}`, colors.cyan);
  log(`Field type: "${fieldType}"`, colors.dim);
  console.log('');

  // 1. Create component file
  const componentDir = path.join(rootDir, 'frontend/src/components/SukohForm/fields');
  const componentPath = path.join(componentDir, `${componentName}.tsx`);

  if (fs.existsSync(componentPath)) {
    logWarning(`Component file already exists: ${componentName}.tsx`);
  } else {
    const template = generateComponentTemplate(name);
    fs.writeFileSync(componentPath, template);
    logSuccess(`Created component: frontend/src/components/SukohForm/fields/${componentName}.tsx`);
  }

  // 2. Update FieldRegistry
  try {
    const registryResult = updateFieldRegistry(name, rootDir);
    if (registryResult.skipped) {
      logWarning(`Registry: ${registryResult.reason}`);
    } else {
      logSuccess(`Registered field type "${fieldType}" in FieldRegistry.ts`);
    }
  } catch (err) {
    logError(`Failed to update FieldRegistry: ${err.message}`);
  }

  // 3. Update schema
  try {
    const schemaResult = updateFieldsSchema(name, rootDir);
    if (schemaResult.skipped) {
      logWarning(`Schema: ${schemaResult.reason}`);
    } else {
      logSuccess(`Added schema and type to packages/types/src/schemas/fields.ts`);
    }
  } catch (err) {
    logError(`Failed to update schema: ${err.message}`);
  }

  // Summary
  console.log('');
  log('Next steps:', colors.cyan);
  console.log('');
  logInfo(`1. Edit the component: frontend/src/components/SukohForm/fields/${componentName}.tsx`);
  logInfo(`2. Add field-specific properties to the schema in packages/types/src/schemas/fields.ts`);
  logInfo(`3. Rebuild types: npm run build -w @quiqr/types`);
  logInfo(`4. Test in a form with: { type: "${fieldType}", key: "myKey" }`);
  console.log('');
}

main();
