import type { BuildActionLogger } from './build-action-service.js'

/**
 * Simple console-based logger implementation
 * Logs build action output to console.log
 */
export class ConsoleLogger implements BuildActionLogger {
  appendLine(message: string): void {
    console.log(message)
  }
}
