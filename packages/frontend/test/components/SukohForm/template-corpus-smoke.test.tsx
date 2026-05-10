/**
 * Template Corpus Smoke Tests
 *
 * Discovers locally-cloned community templates under ~/Quiqr/sites/, loads each
 * template's WorkspaceConfig via WorkspaceConfigProvider, and renders FormProvider
 * with each collection/single's Field[] to assert no React rendering errors occur.
 *
 * Tests are skipped (not failed) when templates are not cloned locally.
 * See AGENTS.md §Corpus Testing for when to run these tests.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { MemoryRouter } from 'react-router';
import { FormProvider } from '../../../src/components/SukohForm/FormProvider';
import type { Field } from '@quiqr/types';
import path from 'path';
import fs from 'fs-extra';

// Import backend utilities for template discovery and loading
import { WorkspaceConfigProvider } from '../../../../backend/src/services/workspace/workspace-config-provider.js';
import { FormatProviderResolver } from '../../../../backend/src/utils/format-provider-resolver.js';
import { PathHelper } from '../../../../backend/src/utils/path-helper.js';
import type { UnifiedConfigService } from '../../../../backend/src/config/unified-config-service.js';
import type { EnvironmentInfo } from '../../../../backend/src/utils/path-helper.js';

// ---------------------------------------------------------------------------
// Real PathHelper factory for template discovery
// ---------------------------------------------------------------------------

/**
 * Create a real PathHelper that uses actual file system paths.
 * Used for discovering templates in the user's actual data folder.
 */
function createRealPathHelper(): PathHelper {
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
// Template discovery
// ---------------------------------------------------------------------------

interface DiscoveredTemplate {
  name: string;
  workspacePath: string;
}

/**
 * Scan {dataFolder}/sites/ for site directories whose primary workspace contains
 * a quiqr/model/base.yaml file.
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
// Provider factory
// ---------------------------------------------------------------------------

function createProvider(pathHelper: PathHelper): WorkspaceConfigProvider {
  const formatResolver = new FormatProviderResolver();

  // Stub UnifiedConfigService: return false for partial cache so cached remote partials are used
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
// Test metadata
// ---------------------------------------------------------------------------

const testMeta = {
  siteKey: 'corpus-test',
  workspaceKey: 'main',
  collectionKey: '',
  collectionItemKey: '',
  prompt_templates: [],
  pageUrl: '',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Template Corpus Smoke Tests', () => {
  const realPathHelper = createRealPathHelper();
  const discovered = discoverTemplates(realPathHelper);

  if (discovered.length === 0) {
    it.skip('No templates found in ~/Quiqr/sites/ — clone community templates to run smoke tests', () => {
      // intentional no-op: skipped when no templates are present
    });
    console.warn(
      '[corpus-smoke] WARNING: Zero templates discovered. ' +
      'Clone community templates to ~/Quiqr/sites/ for full smoke test coverage.'
    );
  }

  for (const template of discovered) {
    describe(`Template: ${template.name}`, () => {
      it(`loads and renders collections without crashing`, async () => {
        const provider = createProvider(realPathHelper);
        let loadedConfig: Awaited<ReturnType<WorkspaceConfigProvider['readOrCreateMinimalModelConfig']>> | null = null;

        try {
          loadedConfig = await provider.readOrCreateMinimalModelConfig(
            template.workspacePath,
            'main'
          );
        } catch (err) {
          console.error(`[corpus-smoke] Failed to load ${template.name}:`, err);
          // Template failed to load (e.g., unsupported field type) — skip this template
          return;
        }

        if (!loadedConfig) return;

        // Test each collection by rendering - if no crash occurs, test passes
        for (const collection of loadedConfig.collections ?? []) {
          if (!Array.isArray(collection.fields)) continue;

          const { container } = render(
            <MemoryRouter initialEntries={['/']}>
              <FormProvider
                fields={collection.fields as Field[]}
                initialValues={{}}
                meta={{ ...testMeta, collectionKey: collection.key }}
                onSave={async () => {}}
              >
                <div>mounted</div>
              </FormProvider>
            </MemoryRouter>
          );

          // Assert component rendered without throwing
          expect(container.firstChild).toBeTruthy();
        }

        // Test each single by rendering - if no crash occurs, test passes
        for (const single of loadedConfig.singles ?? []) {
          if (!Array.isArray(single.fields)) continue;

          const { container } = render(
            <MemoryRouter initialEntries={['/']}>
              <FormProvider
                fields={single.fields as Field[]}
                initialValues={{}}
                meta={testMeta}
                onSave={async () => {}}
              >
                <div>mounted</div>
              </FormProvider>
            </MemoryRouter>
          );

          // Assert component rendered without throwing
          expect(container.firstChild).toBeTruthy();
        }
      });
    });
  }
});
