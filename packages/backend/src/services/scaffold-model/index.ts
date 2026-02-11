/**
 * Scaffold Model Service
 *
 * Re-exports for the scaffold model service module.
 */

export {
  ScaffoldModelService,
  createScaffoldModelService,
  type ScaffoldModelServiceDependencies,
} from './scaffold-model-service.js';

export { inferFieldType, parseKeysToFields, inferFieldsFromData } from './field-inferrer.js';

export type {
  ScaffoldDataType,
  ScaffoldSupportedExtension,
  InferredField,
  SingleModelConfig,
  CollectionModelConfig,
  ScaffoldResult,
} from './types.js';

export { SCAFFOLD_SUPPORTED_EXTENSIONS } from './types.js';
