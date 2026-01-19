/**
 * Embgit Schemas
 *
 * Zod schemas for validating responses from the embedded git binary (embgit).
 * These match the Go struct types in quiqr-docs/embgit/src.
 */

import { z } from 'zod'

/**
 * Commit entry returned by log_local and log_remote commands.
 * Matches Go jsonCommitEntry struct in main.go.
 */
export const commitEntrySchema = z.object({
  message: z.string(),
  author: z.string(),
  date: z.string(),
  ref: z.string()
})

export type CommitEntry = z.infer<typeof commitEntrySchema>

/**
 * Array of commit entries returned by log commands.
 */
export const commitLogSchema = z.array(commitEntrySchema)

export type CommitLog = z.infer<typeof commitLogSchema>

/**
 * Hugo theme repository info returned by repo_show_hugotheme command.
 * Matches Go responseHugothemeDictType struct in cmd_repo_show_hugotheme.go.
 */
export const hugoThemeRepoInfoSchema = z.object({
  Name: z.string(),
  License: z.string(),
  LicenseLink: z.string(),
  Description: z.string(),
  MinHugoVersion: z.string(),
  Author: z.string(),
  Screenshot: z.string(),
  ExampleSite: z.boolean(),
  Features: z.array(z.string()).nullable(),
  Tags: z.array(z.string()).nullable(),
  Homepage: z.string(),
  Demosite: z.string(),
  AuthorHomepage: z.string()
})

export type HugoThemeRepoInfo = z.infer<typeof hugoThemeRepoInfoSchema>

/**
 * Quiqr site repository info returned by repo_show_quiqrsite command.
 * Matches Go responseQuiqrsiteDictType struct in cmd_repo_show_quiqrsite.go.
 */
export const quiqrSiteRepoInfoSchema = z.object({
  HugoVersion: z.string(),
  HugoTheme: z.string(),
  QuiqrFormsEndPoints: z.number(),
  QuiqrModel: z.string(),
  QuiqrEtalageName: z.string(),
  QuiqrEtalageDescription: z.string(),
  QuiqrEtalageHomepage: z.string(),
  QuiqrEtalageDemoUrl: z.string(),
  QuiqrEtalageLicense: z.string(),
  QuiqrEtalageLicenseURL: z.string(),
  QuiqrEtalageAuthor: z.string(),
  QuiqrEtalageAuthorHomepage: z.string(),
  QuiqrEtalageScreenshots: z.array(z.string()),
  Screenshot: z.string(),
  ScreenshotImageType: z.string()
})

export type QuiqrSiteRepoInfo = z.infer<typeof quiqrSiteRepoInfoSchema>
