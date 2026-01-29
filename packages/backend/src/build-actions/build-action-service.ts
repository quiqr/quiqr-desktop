import { spawn } from 'child_process'
import type { BuildActionExecute, BuildActionCommand } from '@quiqr/types'
import type { AppContainer } from '../config/container.js'
import { SITE_CATEGORIES } from '../logging/index.js'

/**
 * Platform types
 */
export enum Platform {
  WINDOWS = 'windows',
  UNIX = 'unix',
  MACOS = 'macos'
}

/**
 * Result returned from running a build action
 */
export interface BuildActionResult {
  actionName: string
  stdoutType?: string
  stdoutContent: string
  filePath: string
}

/**
 * Logger interface for dependency injection (replaces global.outputConsole)
 */
export interface BuildActionLogger {
  appendLine(message: string): void
}

/**
 * Service for executing custom build actions on documents
 *
 * Build actions allow running platform-specific commands with variable substitution.
 * Commonly used for Quarto rendering and other custom document processing.
 */
export class BuildActionService {
  private logger: BuildActionLogger
  private container?: AppContainer

  constructor(logger: BuildActionLogger, container?: AppContainer) {
    this.logger = logger
    this.container = container
  }

  /**
   * Run a build action on a document
   *
   * @param actionName - Name of the build action
   * @param executeDict - Execution configuration (windows/unix commands)
   * @param filePath - Path to the document file
   * @param sitePath - Path to the site root
   * @param siteKey - Site key for logging
   * @param workspaceKey - Workspace key for logging
   * @returns Promise with build result
   */
  async runAction(
    actionName: string,
    executeDict: BuildActionExecute,
    filePath: string,
    sitePath: string,
    siteKey?: string,
    workspaceKey?: string
  ): Promise<BuildActionResult> {
    const platform = this.detectPlatform()
    
    // Log build action start
    if (this.container && siteKey && workspaceKey) {
      this.container.logger.infoSite(
        siteKey,
        workspaceKey,
        SITE_CATEGORIES.BUILDACTION,
        'Build action started',
        { actionName, filePath, sitePath, platform }
      )
    }

    try {
      let result: BuildActionResult
      
      if (platform === Platform.WINDOWS) {
        result = await this.runOn(
          actionName,
          executeDict.windows,
          filePath,
          sitePath,
          executeDict.stdout_type,
          executeDict.variables,
          siteKey,
          workspaceKey
        )
      } else {
        // Unix or macOS
        result = await this.runOn(
          actionName,
          executeDict.unix,
          filePath,
          sitePath,
          executeDict.stdout_type,
          executeDict.variables,
          siteKey,
          workspaceKey
        )
      }
      
      // Log success
      if (this.container && siteKey && workspaceKey) {
        this.container.logger.infoSite(
          siteKey,
          workspaceKey,
          SITE_CATEGORIES.BUILDACTION,
          'Build action completed',
          { actionName, filePath, stdoutType: result.stdoutType }
        )
      }
      
      return result
    } catch (error) {
      // Log error
      if (this.container && siteKey && workspaceKey) {
        this.container.logger.errorSite(
          siteKey,
          workspaceKey,
          SITE_CATEGORIES.BUILDACTION,
          'Build action failed',
          { 
            actionName, 
            filePath, 
            error: error instanceof Error ? error.message : String(error)
          }
        )
      }
      throw error
    }
  }

  /**
   * Detect the current platform
   */
  private detectPlatform(): Platform {
    const platform = process.platform

    if (platform.startsWith('win')) {
      return Platform.WINDOWS
    } else if (platform.startsWith('darwin')) {
      return Platform.MACOS
    } else if (platform.startsWith('linux')) {
      return Platform.UNIX
    } else {
      return Platform.UNIX // Default to Unix for unknown platforms
    }
  }

  /**
   * Replace path variables in command strings
   *
   * Supported variables:
   * - %SITE_PATH or %site_path - Path to the site root
   * - %DOCUMENT_PATH or %document_path - Path to the document file
   * - Custom variables from execute.variables
   */
  private replacePathVars(
    sourcePath: string,
    filePath: string,
    sitePath: string,
    customVariables?: Array<{ name: string; value: string }>
  ): string {
    let result = sourcePath
      .replace(/%site_path/gi, sitePath)
      .replace(/%SITE_PATH/g, sitePath)
      .replace(/%document_path/gi, filePath)
      .replace(/%DOCUMENT_PATH/g, filePath)

    // Replace custom variables
    if (customVariables) {
      for (const variable of customVariables) {
        const pattern = new RegExp(`%${variable.name}`, 'g')
        result = result.replace(pattern, variable.value)
      }
    }

    return result
  }

  /**
   * Apply path replacements (for WSL path mapping, etc.)
   */
  private applyPathReplacements(
    path: string,
    replacements?: Array<{ search: string; replace: string }>
  ): string {
    if (!replacements || replacements.length === 0) {
      return path
    }

    let result = path
    for (const replacement of replacements) {
      // Escape special regex characters in the search string
      const searchPattern = replacement.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(searchPattern, 'g')
      result = result.replace(regex, replacement.replace)
    }

    return result
  }

  /**
   * Run a platform-specific command
   */
  private runOn(
    actionName: string,
    commandDict: BuildActionCommand,
    filePath: string,
    sitePath: string,
    stdoutType?: string,
    customVariables?: Array<{ name: string; value: string }>,
    siteKey?: string,
    workspaceKey?: string
  ): Promise<BuildActionResult> {
    // Apply document_path replacements to filePath if specified
    let processedFilePath = filePath
    if (commandDict.document_path_replace) {
      processedFilePath = this.applyPathReplacements(filePath, commandDict.document_path_replace)
    }

    // Apply site_path replacements to sitePath if specified
    let processedSitePath = sitePath
    if (commandDict.site_path_replace) {
      processedSitePath = this.applyPathReplacements(sitePath, commandDict.site_path_replace)
    }

    // Replace variables in command
    const command = this.replacePathVars(
      commandDict.command,
      processedFilePath,
      processedSitePath,
      customVariables
    )

    // Replace variables in args
    let args: string[] = []
    if (commandDict.args && commandDict.args.length > 0) {
      args = commandDict.args.map((arg) => {
        return this.replacePathVars(arg, processedFilePath, processedSitePath, customVariables)
      })
    }

    return new Promise((resolve, reject) => {
      try {
        const stdoutChunks: Buffer[] = []
        const stderrChunks: Buffer[] = []

        const child = spawn(command, args)

        child.on('exit', (code) => {
          if (code === 0) {
            let stdoutContent = Buffer.concat(stdoutChunks).toString()

            // Apply file_path replacements to stdout if it's a file path
            if (stdoutType === 'file_path' && commandDict.file_path_replace) {
              stdoutContent = this.applyPathReplacements(stdoutContent, commandDict.file_path_replace)
            }

            resolve({
              actionName,
              stdoutType,
              stdoutContent,
              filePath: processedFilePath
            })
          } else {
            const error = new Error(`Process exited with code ${code}`)
            reject(error)
          }
        })

        child.on('error', (error) => {
          this.logger.appendLine(`Build action error: ${error.message}`)
          
          // Log error to structured logs
          if (this.container && siteKey && workspaceKey) {
            this.container.logger.errorSite(
              siteKey,
              workspaceKey,
              SITE_CATEGORIES.BUILDACTION,
              'Build action process error',
              { actionName, error: error.message }
            )
          }
          
          reject(error)
        })

        child.stdout.on('data', (data: Buffer) => {
          stdoutChunks.push(data)
        })

        child.stdout.on('end', () => {
          const stdoutContent = Buffer.concat(stdoutChunks).toString()
          if (stdoutContent) {
            this.logger.appendLine(stdoutContent)
            
            // Log stdout to structured logs
            if (this.container && siteKey && workspaceKey) {
              this.container.logger.infoSite(
                siteKey,
                workspaceKey,
                SITE_CATEGORIES.BUILDACTION,
                'Build action output',
                { actionName, message: stdoutContent }
              )
            }
          }
        })

        child.stderr.on('data', (data: Buffer) => {
          stderrChunks.push(data)
          const stderrContent = Buffer.concat(stderrChunks).toString()
          if (stderrContent) {
            this.logger.appendLine(stderrContent)
            
            // Log stderr to structured logs
            if (this.container && siteKey && workspaceKey) {
              this.container.logger.errorSite(
                siteKey,
                workspaceKey,
                SITE_CATEGORIES.BUILDACTION,
                'Build action error output',
                { actionName, message: stderrContent }
              )
            }
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}
