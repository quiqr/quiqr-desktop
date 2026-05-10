/**
 * Template Corpus Tests
 *
 * Validates that all locally-cloned community templates load cleanly through the
 * real WorkspaceConfigProvider and that their Field[] trees contain only known types.
 *
 * Tests are skipped (not failed) when templates are not cloned locally.
 * Run with locally-available templates before releases or when changing config loading.
 *
 * See AGENTS.md §Corpus Testing for when to run these tests.
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import { WorkspaceConfigProvider } from '../workspace-config-provider.js';
import { FormatProviderResolver } from '../../../utils/format-provider-resolver.js';
import { workspaceConfigSchema } from '@quiqr/types';
import type { UnifiedConfigService } from '../../../config/unified-config-service.js';
import type { EnvironmentInfo } from '../../../utils/path-helper.js';
import { PathHelper } from '../../../utils/path-helper.js';
import { createMockPathHelper } from '../../../../test/mocks/ssg-dependencies.js';

// ---------------------------------------------------------------------------
// Official community template names (GitHub repo names from templates.json)
// https://quiqr.github.io/quiqr-community-templates/templates.json
// Update this list when new templates are added to the registry.
// ---------------------------------------------------------------------------
const COMMUNITY_TEMPLATES = [
  'quiqr-template-bexer-remix',
  'quiqr-template-kitchen-sink',
  'quiqr-paper-themed-template',
  'quiqr-scroll-template',
  'summer-qremix',
  'quiqr-uilite-template',
  'quiqr-hugoconf2022-webslides',
  'quiqr-xmin-template',
  'quiqr-yet-another-gallery-template',
];

// ---------------------------------------------------------------------------
// Known field types — must match FieldRegistry registrations in the frontend.
// Update when adding a new field type (also register it in FieldRegistry.ts).
// ---------------------------------------------------------------------------
const KNOWN_FIELD_TYPES = new Set([
  // Text
  'string', 'markdown', 'easymde', 'readonly', 'uniq',
  // Numeric
  'number', 'slider',
  // Boolean
  'boolean',
  // Date
  'date',
  // Selection
  'select', 'select-from-query', 'chips', 'color', 'fonticon-picker', 'font-picker',
  // Image / file
  'image-select', 'bundle-manager', 'bundle-image-thumbnail',
  // Container
  'accordion', 'section', 'nest', 'pull', 'leaf-array',
  // Utility
  'hidden', 'empty-line', 'info',
  // Special
  'eisenhouwer',
]);

// ---------------------------------------------------------------------------
// Template discovery
// ---------------------------------------------------------------------------

interface DiscoveredTemplate {
  name: string;
  workspacePath: string;
}

/**
 * Scan {dataFolder}/sites/ for site directories whose primary workspace contains
 * a quiqr/model/base.yaml file.
 *
 * Structure: {dataFolder}/sites/<site-name>/<workspace>/quiqr/model/base.yaml
 * The site-name is used as the template identifier for cross-referencing
 * against the official community template list.
 */
function discoverTemplates(pathHelper: PathHelper): DiscoveredTemplate[] {
  const sitesDir = path.join(pathHelper.getRoot(), 'sites');
  if (!fs.existsSync(sitesDir)) return [];

  const templates: DiscoveredTemplate[] = [];

  const entries = fs.readdirSync(sitesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const siteName = entry.name;
    const siteDir = path.join(sitesDir, siteName);

    // Find workspace subdirectories with quiqr/model/base.yaml
    const wsEntries = fs.readdirSync(siteDir, { withFileTypes: true });
    for (const wsEntry of wsEntries) {
      if (!wsEntry.isDirectory()) continue;
      const workspacePath = path.join(siteDir, wsEntry.name);
      const modelBasePath = path.join(workspacePath, 'quiqr', 'model', 'base.yaml');
      if (fs.existsSync(modelBasePath)) {
        templates.push({ name: siteName, workspacePath });
        break; // Use the first valid workspace per site
      }
    }
  }

  return templates;
}

// ---------------------------------------------------------------------------
// Field type extraction
// ---------------------------------------------------------------------------

interface FieldTypeEntry {
  type: string;
  path: string;
}

/**
 * Recursively extract all { type, path } entries from a fields array.
 * Traverses nested fields within accordion, section, nest, pull, leaf-array,
 * and bundle-manager field types.
 */
function extractFieldTypes(
  fields: unknown[],
  parentPath = ''
): FieldTypeEntry[] {
  const result: FieldTypeEntry[] = [];

  for (const field of fields) {
    if (typeof field !== 'object' || field === null) continue;
    const f = field as Record<string, unknown>;

    if (typeof f.type !== 'string' || typeof f.key !== 'string') continue;

    const fieldPath = parentPath ? `${parentPath}.${f.key}` : f.key;
    result.push({ type: f.type, path: fieldPath });

    if (Array.isArray(f.fields)) {
      result.push(...extractFieldTypes(f.fields as unknown[], fieldPath));
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Real PathHelper factory for template discovery
// ---------------------------------------------------------------------------

/**
 * Create a real PathHelper that uses actual file system paths (not mocks).
 * Used for discovering templates in the user's actual data folder.
 */
function createRealPathHelper(): PathHelper {
  // Create a minimal real AppInfoAdapter for test use
  const appInfo = {
    getPath: (name: string) => {
      if (name === 'home') {
        return process.env.HOME || process.env.USERPROFILE || '/tmp';
      }
      return '/tmp';
    },
    isPackaged: () => false,
    getAppPath: () => process.cwd(),
    getVersion: () => '0.0.0-test',
  };

  // PathHelper will default to ~/Quiqr when no dataFolder is set
  return new PathHelper(appInfo, process.cwd(), {});
}

// ---------------------------------------------------------------------------
// Provider factory
// ---------------------------------------------------------------------------

function createProvider(): WorkspaceConfigProvider {
  const formatResolver = new FormatProviderResolver();

  // Mock PathHelper: getApplicationResourcesDir returns a non-existent path so
  // glob for dogfood includes returns [] — dogfood model is optional.
  const pathHelper = createMockPathHelper();

  // Stub UnifiedConfigService: only getInstanceSetting is used by the provider
  // (for 'dev.disablePartialCache'). Return false so cached remote partials are used.
  const unifiedConfig = {
    getInstanceSetting: (key: string) => {
      if (key === 'dev.disablePartialCache') return false;
      return undefined;
    },
  } as unknown as UnifiedConfigService;

  const environmentInfo: EnvironmentInfo = {
    platform: process.platform === 'darwin' ? 'macOS' : process.platform === 'win32' ? 'windows' : 'linux',
    isPackaged: false,
  };

  return new WorkspaceConfigProvider(
    formatResolver,
    pathHelper,
    unifiedConfig,
    environmentInfo
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Template Corpus Tests', () => {
  // Use real PathHelper for template discovery to find actual user templates
  const realPathHelper = createRealPathHelper();
  const discovered = discoverTemplates(realPathHelper);

  if (discovered.length === 0) {
    it.skip('No templates found in {dataFolder}/sites/ — clone community templates to run corpus tests', () => {
      // intentional no-op: skipped when no templates are present
    });
    console.warn(
      '[corpus] WARNING: Zero templates discovered. ' +
      'Clone community templates to get full corpus coverage.'
    );
  } else {
    // Cross-reference: log any community templates not present locally
    const foundNames = new Set(discovered.map((t) => t.name));
    for (const official of COMMUNITY_TEMPLATES) {
      if (!foundNames.has(official)) {
        console.warn(`[corpus] Template not cloned locally (skipping): ${official}`);
      }
    }
  }

  for (const template of discovered) {
    describe(`Template: ${template.name}`, () => {
      let loadedConfig: Awaited<ReturnType<WorkspaceConfigProvider['readOrCreateMinimalModelConfig']>> | null = null;
      let loadError: Error | null = null;

      // Load config once; subsequent assertions use the result
      it(`loads quiqr/model/base.yaml without errors`, async () => {
        const provider = createProvider();
        const configPath = path.join(template.workspacePath, 'quiqr', 'model', 'base.yaml');

        try {
          loadedConfig = await provider.readOrCreateMinimalModelConfig(
            template.workspacePath,
            'main'
          );
          loadError = null;
        } catch (err) {
          loadError = err instanceof Error ? err : new Error(String(err));
          loadedConfig = null;
        }

        if (loadError) {
          // Parse Zod validation errors and format them for developer clarity
          let detail = loadError.message;
          try {
            const issues: Array<{
              path: (string | number)[];
              message: string;
              code?: string;
              received?: unknown;
              options?: string[];
            }> = JSON.parse(loadError.message);

            detail = issues
              .map((issue) => {
                const pathStr = issue.path.map((p, i) =>
                  typeof p === 'number' ? `[${p}]` : (i === 0 ? p : `.${p}`)
                ).join('');

                // Determine which YAML file likely contains this path
                const topLevelKey = issue.path[0];
                const likelyFile = ['collections', 'singles'].includes(topLevelKey as string)
                  ? path.join(template.workspacePath, 'quiqr', 'model', 'includes', `${topLevelKey}.yaml`)
                  : configPath;

                // Special formatting for invalid field type errors
                if (issue.code === 'invalid_union_discriminator' && issue.options) {
                  const validTypes = issue.options.slice(0, 10).join(', ') +
                    (issue.options.length > 10 ? `, ... (${issue.options.length} total)` : '');

                  return [
                    '',
                    `  Invalid field type at ${pathStr}`,
                    `  File: ${likelyFile}`,
                    `  Valid types: ${validTypes}`,
                    ''
                  ].join('\n');
                }

                // Generic format for other validation errors
                return `\n  ${pathStr}: ${issue.message}\n  File: ${likelyFile}`;
              })
              .join('\n');

          } catch (parseErr) {
            // Not a structured Zod error — use raw message
            detail = loadError.message;
          }

          expect.fail(`Config validation failed:\n${detail}`);
        }
      });

      it(`config satisfies workspaceConfigSchema`, () => {
        if (loadError !== null || loadedConfig === null) {
          // Already failed in the load test — don't double-report
          return;
        }
        const result = workspaceConfigSchema.safeParse(loadedConfig);
        expect(
          result.success,
          `Zod validation failed: ${result.success ? '' : JSON.stringify(result.error.flatten(), null, 2)}`
        ).toBe(true);
      });

      it(`all field types are in the known-types list`, () => {
        if (loadedConfig === null) return;

        const unknownTypes: string[] = [];

        const allFields = [
          ...(loadedConfig.collections ?? []).flatMap((c) =>
            extractFieldTypes(Array.isArray(c.fields) ? c.fields : [], `${c.key}`)
          ),
          ...(loadedConfig.singles ?? []).flatMap((s) =>
            extractFieldTypes(Array.isArray(s.fields) ? s.fields : [], `${s.key}`)
          ),
        ];

        for (const { type, path: fieldPath } of allFields) {
          if (!KNOWN_FIELD_TYPES.has(type)) {
            unknownTypes.push(
              `Template ${template.name}: unknown field type '${type}' at path ${fieldPath}`
            );
          }
        }

        expect(unknownTypes, unknownTypes.join('\n')).toHaveLength(0);
      });
    });
  }
});
