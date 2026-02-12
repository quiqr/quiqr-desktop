# Tasks: Unify Configuration Architecture

**Change ID:** `unify-configuration-architecture`

## Implementation Checklist

### Phase 1: Schema Foundation
> Define the data structures that underpin the new configuration system

- [ ] **T1.1** Define `instanceSettingsSchema` in `@quiqr/types` with storage, defaults, forced prefs
- [ ] **T1.2** Define `userPreferencesSchema` for all user-configurable settings
- [ ] **T1.3** Define `groupConfigSchema` for group-level preferences
- [ ] **T1.4** Define `instanceConfigSchema` combining settings and groups
- [ ] **T1.5** Define `userConfigSchema` for per-user config files
- [ ] **T1.6** Add environment variable mapping schema (QUIQR_* patterns)
- [ ] **T1.7** Write unit tests for schema validation edge cases

### Phase 2: Config Services
> Build the core configuration resolution logic

- [ ] **T2.1** Create `ConfigStore` class for loading/saving JSON config files
- [ ] **T2.2** Create `EnvOverrideLayer` for environment variable resolution
- [ ] **T2.3** Create `ConfigResolver` implementing 5-layer precedence algorithm
- [ ] **T2.4** Create `UnifiedConfigService` orchestrating store + resolver + env
- [ ] **T2.5** Write unit tests for layered resolution scenarios
- [ ] **T2.6** Write unit tests for environment variable override
- [ ] **T2.7** Integrate `UnifiedConfigService` into DI container

### Phase 3: Migration System
> Enable seamless upgrade from legacy configuration

- [ ] **T3.1** Create `MigrationDetector` to identify legacy config format
- [ ] **T3.2** Create `ConfigMigrator` to transform legacy → unified format
- [ ] **T3.3** Implement backup creation (`*.v1-backup`)
- [ ] **T3.4** Implement migration marker to prevent re-migration
- [ ] **T3.5** Write migration tests with sample legacy configs
- [ ] **T3.6** Document migration mapping in code comments

### Phase 4: API Integration
> Expose unified config through backend API

- [ ] **T4.1** Update `config-handlers.ts` to use `UnifiedConfigService`
- [ ] **T4.2** Add `getEffectivePreference(key, userId?)` endpoint
- [ ] **T4.3** Add `setUserPreference(key, value, userId?)` endpoint
- [ ] **T4.4** Add `getInstanceSetting(path)` endpoint
- [ ] **T4.5** Update `readConfKey` for backward compatibility
- [ ] **T4.6** Update `saveConfPrefKey` for backward compatibility
- [ ] **T4.7** Add API tests for new endpoints

### Phase 5: Frontend Updates
> Update frontend to use new configuration APIs

- [ ] **T5.1** Update `api.ts` with new typed config methods
- [ ] **T5.2** Update `ReadConfKeyMap` type for new config paths
- [ ] **T5.3** Update Preferences UI to use new API methods
- [ ] **T5.4** Test single-user mode works without code changes
- [ ] **T5.5** Document API changes in JSDoc comments

### Phase 6: Documentation & Validation
> Ensure the system is properly documented and tested

- [ ] **T6.1** Update `packages/docs/` with configuration guide
- [ ] **T6.2** Document environment variable mapping
- [ ] **T6.3** Document migration process for users
- [ ] **T6.4** Integration test: fresh install → configure → restart
- [ ] **T6.5** Integration test: legacy install → upgrade → verify migration
- [ ] **T6.6** Update `AGENTS.md` configuration section

---

## Dependencies

| Task | Depends On |
|------|------------|
| T2.* | T1.* (schemas must exist first) |
| T3.* | T2.1, T2.4 (needs config store and service) |
| T4.* | T2.* (API wraps service) |
| T5.* | T4.* (frontend uses API) |
| T6.* | All phases complete |

## Parallelizable Work

- **T1.1-T1.6** can be done in parallel (schema definitions)
- **T2.1-T2.3** can be done in parallel (independent classes)
- **T3.1-T3.4** can be done in parallel after T2.1
- **T4.2-T4.6** can be done in parallel (API endpoints)
- **T5.1-T5.3** can be done in parallel (frontend updates)

## Validation Checkpoints

1. After Phase 1: `npm run build -w @quiqr/types` succeeds
2. After Phase 2: Unit tests for config resolution pass
3. After Phase 3: Migration tests pass with legacy configs
4. After Phase 4: API integration tests pass
5. After Phase 5: `npm run dev` works with new config
6. After Phase 6: Documentation builds, all tests green
