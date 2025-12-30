/**
 * Workspace Selection Component Tests
 *
 * Tests the UI behavior of selecting and switching between workspaces.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {  render, screen, cleanup } from '@testing-library/react';
// import { render } from '../../../test/test-utils'; // <-- use custom render

import userEvent from '@testing-library/user-event';
import SelectWorkspaceDialog from '../../../src/containers/SiteLibrary/dialogs/SelectWorkspaceDialog';
import type { Workspace } from '../../../types';

describe('SelectWorkspaceDialog', () => {
  const mockWorkspaces: Workspace[] = [
    { key: 'main', path: '/test/sites/main', state: 'ready' },
    { key: 'staging', path: '/test/sites/staging', state: 'ready' },
  ];

  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders workspace list correctly', () => {
    render(
      <SelectWorkspaceDialog
        open={true}
        workspaces={mockWorkspaces}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Select Workspace')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('staging')).toBeInTheDocument();
    expect(screen.getByText('/test/sites/main')).toBeInTheDocument();
    expect(screen.getByText('/test/sites/staging')).toBeInTheDocument();
  });

  it('allows selecting a workspace and confirming', async () => {
    const user = userEvent.setup();

    render(
      <SelectWorkspaceDialog
        open={true}
        workspaces={mockWorkspaces}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    // Click on staging workspace
    const stagingButton = screen.getByRole('button', { name: /staging/i });
    await user.click(stagingButton);

    // Confirm selection
    const openButton = screen.getByRole('button', { name: /open workspace/i });
    expect(openButton).toBeInTheDocument();
    await user.click(openButton);

    // Verify callback was called with staging workspace
    expect(mockOnSelect).toHaveBeenCalledWith(mockWorkspaces[1]);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('disables confirm button when no workspace is selected', () => {
    render(
      <SelectWorkspaceDialog
        open={true}
        workspaces={mockWorkspaces}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    const openButton = screen.getByRole('button', { name: /open workspace/i });
    expect(openButton).toBeDisabled();
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();

    render(
      <SelectWorkspaceDialog
        open={true}
        workspaces={mockWorkspaces}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('allows changing selection before confirming', async () => {
    const user = userEvent.setup();

    render(
      <SelectWorkspaceDialog
        open={true}
        workspaces={mockWorkspaces}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    );

    // Select main first
    const mainButton = screen.getByRole('button', { name: /main/i });
    await user.click(mainButton);

    // Change selection to staging
    const stagingButton = screen.getByRole('button', { name: /staging/i });
    await user.click(stagingButton);

    // Confirm
    const openButton = screen.getByRole('button', { name: /open workspace/i });
    await user.click(openButton);

    // Should have called with staging (last selection)
    expect(mockOnSelect).toHaveBeenCalledWith(mockWorkspaces[1]);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });
});
