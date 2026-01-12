import { ReactNode } from 'react';

/**
 * Props for SidebarHeader component
 */
export interface SidebarHeaderProps {
  /** Title displayed in the sidebar header */
  title: string;
  /** Optional site key for context */
  siteKey?: string;
  /** Optional workspace key for context */
  workspaceKey?: string;
  /** Whether to show the site/workspace switcher dropdown */
  showSwitcher?: boolean;
}

/**
 * Props for MainToolbar component
 */
export interface MainToolbarProps {
  /** Toolbar buttons on left */
  leftItems?: ReactNode[];
  /** Center items */
  centerItems?: ReactNode[];
  /** Right items */
  rightItems?: ReactNode[];
}

/**
 * Props for AppSidebar component
 */
export interface AppSidebarProps {
  /** Sidebar content (menu items) */
  children: ReactNode;
}

/**
 * Configuration for toolbar sections
 */
export interface ToolbarConfig {
  /** Toolbar buttons on left */
  leftItems?: ReactNode[];
  /** Center items */
  centerItems?: ReactNode[];
  /** Right items */
  rightItems?: ReactNode[];
}

/**
 * Main AppLayout props
 */
export interface AppLayoutProps {
  /** Title displayed in the sidebar header */
  title: string;
  /** Optional site key for context */
  siteKey?: string;
  /** Optional workspace key for context */
  workspaceKey?: string;
  /** Content to render in the sidebar (menu items) */
  sidebar: ReactNode;
  /** Toolbar configuration for main area */
  toolbar?: ToolbarConfig;
  /** Main content area */
  children: ReactNode;
}
