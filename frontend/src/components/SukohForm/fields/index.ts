/**
 * Field Components Index
 *
 * This directory contains the new functional field components that will
 * replace the legacy *Dynamic.tsx class components.
 *
 * Migration status:
 * - Phase 2: Simple fields (HiddenField, EmptyLineField, ToggleField, etc.)
 * - Phase 3: Medium fields (StringField, NumberField, SelectField, etc.)
 * - Phase 4: Complex fields (AccordionField, BundleManagerField, etc.)
 *
 * Each field component receives a single prop: compositeKey
 * and uses the useField() hook to access its value and configuration.
 */

// Note: Individual field exports will be added as components are migrated
// The FieldRegistry uses dynamic imports, so explicit exports aren't required
