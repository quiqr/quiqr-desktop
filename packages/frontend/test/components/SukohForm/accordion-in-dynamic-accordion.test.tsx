/**
 * Accordion nested inside a dynamic accordion — integration tests
 *
 * Covers the bug where a type:accordion field living inside a dynFormSearchKey
 * accordion (e.g. a "logos" accordion inside a "block_partner_logos" partial that
 * is an item of "content_blocks") could not be opened:
 *   - navigation dropped the parent item's array index, producing an unresolvable
 *     path like "content_blocks.logos" ("Nested field not found")
 *   - even with the index, the focused view flattened the nested accordion's
 *     children instead of rendering it as an accordion
 *
 * These tests drive the real AccordionField via the nest URL and assert the
 * nested accordion renders and drills to arbitrary depth.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router';
import AccordionField from '../../../src/components/SukohForm/fields/AccordionField';
import { FormProvider } from '../../../src/components/SukohForm/FormProvider';
import type { Field } from '@quiqr/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

// The dynamic partial for content_type "block_partner_logos": a section_title
// string plus a NESTED accordion "logos". (image-select is simplified to string
// here — the field type under test is the nested accordion, not image-select.)
const logosPartialFields: Field[] = [
  { key: 'section_title', type: 'string', title: 'Section Title' },
  {
    key: 'logos',
    type: 'accordion',
    title: 'Logos',
    fields: [
      { key: 'image', type: 'string', title: 'Logo image' },
      { key: 'alt', type: 'string', title: 'Alt text', arrayTitle: true },
    ],
  } as unknown as Field,
];

vi.mock('../../../src/services/service', () => ({
  default: {
    api: {
      getDynFormFields: vi.fn(async (_root: string, q: { key: string; val: unknown }) =>
        q.val === 'block_partner_logos' ? { fields: logosPartialFields } : null
      ),
      readConfKey: vi.fn(async () => ({})),
      getCurrentFormAccordionIndex: vi.fn(async () => ''),
      setCurrentFormAccordionIndex: vi.fn(async () => true),
    },
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const testMeta = {
  siteKey: 'test-site',
  workspaceKey: 'test-ws',
  collectionKey: '',
  collectionItemKey: '',
  prompt_templates: [],
  pageUrl: '',
};

// Static top-level schema: content_blocks is a dynamic accordion, so "logos"
// is NOT part of its static fields — it only appears via the loaded partial.
const contentBlocksField = {
  key: 'content_blocks',
  type: 'accordion',
  title: 'Content Blocks',
  dynFormSearchKey: 'content_type',
  fields: [
    { key: 'disabled', type: 'boolean' },
    { key: 'content_type', type: 'string', arrayTitle: true },
  ],
} as unknown as Field;

const initialValues = {
  content_blocks: [
    {
      content_type: 'block_partner_logos',
      section_title: 'Onze partners',
      logos: [
        { image: 'aws.png', alt: 'AWS badge' },
        { image: 'finops.png', alt: 'FinOps badge' },
      ],
    },
  ],
};

function renderContentBlocks(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route
          path="*"
          element={
            <FormProvider
              fields={[contentBlocksField]}
              initialValues={initialValues}
              meta={testMeta}
              onSave={vi.fn().mockResolvedValue(undefined)}
            >
              <AccordionField compositeKey="root.content_blocks" />
            </FormProvider>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockNavigate.mockClear();
});

// ---------------------------------------------------------------------------
// Navigation: index is preserved (Change 1)
// ---------------------------------------------------------------------------

describe('nested accordion navigation URL', () => {
  it('preserves the parent item index (mirrors the fixed handleNavigateToAccordion)', () => {
    // The fix navigates to the accordion's own full fieldPath, not a rebuilt
    // "currentNestPath + key" that would drop the [index].
    const compositeKey = 'root.content_blocks[0].logos';
    const fieldPath = compositeKey.replace(/^root\./, '');
    const basePath = '/sites/s/singles/home';
    const expected = `${basePath}/nest/${encodeURIComponent(fieldPath)}`;
    expect(expected).toBe('/sites/s/singles/home/nest/content_blocks%5B0%5D.logos');
    // The buggy behaviour produced "content_blocks.logos" (no index).
    expect(expected).not.toContain('/nest/content_blocks.logos');
  });
});

// ---------------------------------------------------------------------------
// Focused rendering: nested accordion renders as an accordion (Change 2)
// ---------------------------------------------------------------------------

describe('opening a nested accordion via the nest URL', () => {
  it('renders the nested "logos" accordion instead of "Nested field not found"', async () => {
    renderContentBlocks('/sites/s/singles/home/nest/content_blocks[0].logos');

    // The nested accordion (title "Logos") renders once dynamic fields load.
    expect(await screen.findByText('Logos')).toBeInTheDocument();
    // Its items are shown (label comes from the arrayTitle field "alt").
    expect(await screen.findByText('AWS badge')).toBeInTheDocument();
    expect(screen.getByText('FinOps badge')).toBeInTheDocument();
  });

  it('drills to a leaf inside the nested accordion (arbitrary depth)', async () => {
    renderContentBlocks('/sites/s/singles/home/nest/content_blocks[0].logos[1].alt');

    // Should focus the single "alt" field of logos item 1, with its current value.
    const input = await screen.findByDisplayValue('FinOps badge');
    expect(input).toBeInTheDocument();
    // The other logo's value is not rendered in this focused leaf view.
    expect(screen.queryByDisplayValue('AWS badge')).toBeNull();
  });
});
