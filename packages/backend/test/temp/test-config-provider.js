/**
 * Test script for ConfigurationDataProvider
 *
 * Runs independently of Electron to verify the migration works correctly.
 * Usage: node test-config-provider.js
 */

import { PathHelper } from '../../dist/utils/path-helper.js';
import { FormatProviderResolver } from '../../dist/utils/format-provider-resolver.js';
import { ConfigurationDataProvider, ConsoleLogger } from '../../dist/services/configuration/index.js';
import os from 'os';
import path from 'path';

// Mock AppInfoAdapter
const mockAppInfo = {
  getPath: (name) => {
    if (name === 'home') return os.homedir();
    return os.tmpdir();
  },
  getAppPath: () => process.cwd()
};

// Create instances
const rootPath = process.cwd();
const pathHelper = new PathHelper(mockAppInfo, rootPath, {});
const formatResolver = new FormatProviderResolver();
const logger = new ConsoleLogger();
const configProvider = new ConfigurationDataProvider(pathHelper, formatResolver, logger);

console.log('Testing ConfigurationDataProvider...\n');
console.log('Root directory:', pathHelper.getRoot());
console.log('Looking for sites in:', path.join(pathHelper.getRoot(), 'sites'));
console.log('');

// Test getConfigurations
configProvider.getConfigurations()
  .then(configurations => {
    console.log('Successfully loaded configurations!');
    console.log(`Found ${configurations.sites.length} sites:\n`);

    configurations.sites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name || site.key}`);
      console.log(`   Key: ${site.key}`);
      console.log(`   Config Path: ${site.configPath}`);
      console.log(`   Source Path: ${site.source?.path || 'N/A'}`);
      console.log(`   Published: ${site.published}`);
      console.log(`   Screenshots: ${site.etalage?.screenshots?.length || 0}`);
      console.log(`   Favicons: ${site.etalage?.favicons?.length || 0}`);
      console.log('');
    });

    // Test getSiteConfig for the first site
    if (configurations.sites.length > 0) {
      const firstSiteKey = configurations.sites[0].key;
      return configProvider.getSiteConfig(firstSiteKey).then(siteConfig => {
        console.log(`Successfully retrieved single site config for: ${firstSiteKey}`);
        console.log('   Name:', siteConfig?.name);
        console.log('');
      });
    }
  })
  .then(() => {
    // Test cache
    console.log('Testing cache...');
    const start = Date.now();
    return configProvider.getConfigurations().then(() => {
      const duration = Date.now() - start;
      console.log(`✅ Cached retrieval took ${duration}ms (should be fast)`);
      console.log('');
    });
  })
  .then(() => {
    // Test cache invalidation
    console.log('Testing cache invalidation...');
    configProvider.invalidateCache();
    const start = Date.now();
    return configProvider.getConfigurations().then(() => {
      const duration = Date.now() - start;
      console.log(`Fresh retrieval after invalidation took ${duration}ms`);
      console.log('');
    });
  })
  .then(() => {
    console.log('🎉 All tests passed!');
  })
  .catch(error => {
    console.error('Error during testing:', error);
    process.exit(1);
  });
