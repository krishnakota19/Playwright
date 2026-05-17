/**
 * Logger utility for consistent logging across the framework
 */
export class Logger {
  private className: string;

  constructor(className: string) {
    this.className = className;
  }

  private formatMessage(message: string): string {
    return `[${new Date().toISOString()}] [${this.className}] ${message}`;
  }

  info(message: string): void {
    console.log(this.formatMessage(`INFO: ${message}`));
  }

  debug(message: string): void {
    console.debug(this.formatMessage(`DEBUG: ${message}`));
  }

  warn(message: string): void {
    console.warn(this.formatMessage(`WARN: ${message}`));
  }

  error(message: string): void {
    console.error(this.formatMessage(`ERROR: ${message}`));
  }
}
