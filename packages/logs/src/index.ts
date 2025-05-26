/**
 * Standalone logger implementation that mimics Pino's functionality
 * without external dependencies.
 *
 * @author Won
 */

// customize
const LOG_STATUS_TYPE: "emoji" | "color" = "emoji";
const LOG_STATUS_EMOJI = {
  fatal: "💀",
  error: "🚨",
  warn: "⚠️",
  info: "ℹ️",
  debug: "🔍",
  trace: "🔍",
} as const;

const LOG_STATUS_COLOR = {
  fatal: "\x1b[35m",
  error: "\x1b[31m",
  warn: "\x1b[33m",
  info: "\x1b[32m",
  debug: "\x1b[36m",
  trace: "\x1b[90m",
} as const;

const config = {
  enable_timestamp: false,
  enable_level: false,
  enable_color: true,
  enable_pretty: true,
};

// Define log levels and their numeric values for comparison
const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
} as const;

// Define the Level type based on LOG_LEVELS keys
type Level = keyof typeof LOG_LEVELS;

// Define types to match the original interface
interface LoggerOptions {
  level?: Level;
  prettyPrint?: boolean;
  statusType?: "emoji" | "color";
  config?: {
    enable_timestamp?: boolean;
    enable_level?: boolean;
    enable_color?: boolean;
    enable_pretty?: boolean;
  };
}

interface LogObject {
  level: string;
  time: string;
  msg?: string;
  [key: string]: any;
}

type LogFunction = (msg: string, ...args: any[]) => void;

class Logger {
  private level: Level;
  private levelValue: number;
  private prettyPrint: boolean;
  private statusType: "emoji" | "color";
  private config: {
    enable_timestamp: boolean;
    enable_level: boolean;
    enable_color: boolean;
    enable_pretty: boolean;
  };

  constructor({
    level = "info" as Level,
    prettyPrint = false,
    statusType = LOG_STATUS_TYPE,
    config: customConfig = {
      enable_timestamp: false,
    },
  }: LoggerOptions = {}) {
    this.level = level;
    this.levelValue = LOG_LEVELS[this.level];
    this.prettyPrint = prettyPrint;
    this.statusType = statusType;
    this.config = {
      ...config,
      ...customConfig,
    };
  }

  // Generate ISO timestamp in the same format as stdTimeFunctions.isoTime
  private getISOTime(): string {
    return new Date().toISOString();
  }

  // Format the log object based on configuration
  private formatLogObject(level: Level, msg: string, extraData: object = {}): LogObject {
    return {
      level: level.toUpperCase(),
      time: this.getISOTime(),
      msg,
      ...extraData,
    };
  }

  // Determine if the provided level should be logged based on the configured level
  private shouldLog(level: Level): boolean {
    return LOG_LEVELS[level] >= this.levelValue;
  }

  // Get status indicator based on LOG_STATUS_TYPE
  private getStatusIndicator(level: Level): string {
    if (this.statusType === "emoji") {
      return LOG_STATUS_EMOJI[level];
    }
    return this.config.enable_color ? LOG_STATUS_COLOR[level] : "";
  }

  // Output the log entry with appropriate formatting
  private output(logObject: LogObject): void {
    if (this.config.enable_pretty) {
      const levelLowercase = logObject.level.toLowerCase() as Level;
      const resetCode = "\x1b[0m";

      // Get status indicator based on type
      const statusIndicator = this.getStatusIndicator(levelLowercase);

      // Format pretty output with colors or emoji
      const { level, time, msg, ...rest } = logObject;
      const extraData = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";

      const logParts = [];

      // Add timestamp if enabled
      if (this.config.enable_timestamp) {
        logParts.push(`[${time}]`);
      }

      // Add level if enabled
      if (this.config.enable_level) {
        if (this.statusType === "emoji") {
          logParts.push(`${statusIndicator} ${level}:`);
        } else if (this.config.enable_color) {
          logParts.push(`${statusIndicator}${level}:${resetCode}`);
        } else {
          logParts.push(`${level}:`);
        }
      } else {
        // Just show the indicator
        if (this.statusType === "emoji") {
          logParts.push(statusIndicator);
        } else if (this.config.enable_color) {
          logParts.push(`${statusIndicator}■${resetCode}`);
        }
      }

      // Add message
      logParts.push(msg + extraData);

      console.log(logParts.join(" "));
    } else {
      // Standard JSON output
      console.log(JSON.stringify(logObject));
    }
  }

  // Create log method for each level
  private createLogMethod(level: Level): LogFunction {
    return (msg: string, ...args: any[]) => {
      if (!this.shouldLog(level)) return;

      // Handle extra data if provided
      const extraData = args.length === 1 && typeof args[0] === "object" ? args[0] : {};

      const logObject = this.formatLogObject(level, msg, extraData);
      this.output(logObject);
    };
  }

  // Define log methods for all standard levels
  fatal = this.createLogMethod("fatal");
  error = this.createLogMethod("error");
  warn = this.createLogMethod("warn");
  info = this.createLogMethod("info");
  debug = this.createLogMethod("debug");
  trace = this.createLogMethod("trace");

  // Add child method to support logger nesting, similar to Pino
  child(bindings: object): Logger {
    const childLogger = new Logger({
      level: this.level,
      prettyPrint: this.prettyPrint,
      statusType: this.statusType,
      config: this.config,
    });

    // Override the log methods to include the bindings
    (Object.keys(LOG_LEVELS) as Level[]).forEach((level) => {
      const originalMethod = childLogger[level] as LogFunction;
      childLogger[level as keyof Logger] = ((msg: string, ...args: any[]) => {
        if (!this.shouldLog(level)) return;

        // Merge bindings with any additional context
        const extraData =
          args.length === 1 && typeof args[0] === "object" ? { ...bindings, ...args[0] } : bindings;

        originalMethod(msg, extraData);
      }) as any;
    });

    return childLogger;
  }
}

/**
 * Create a new logger instance with the specified options.
 *
 * @param options - Configuration options for the logger
 * @returns A logger instance
 */
function createLogger({
  level = "info" as Level,
  prettyPrint = config.enable_pretty,
  statusType = LOG_STATUS_TYPE,
  config: customConfig = {},
}: LoggerOptions = {}): Logger {
  return new Logger({
    level,
    prettyPrint,
    statusType,
    config: customConfig,
  });
}

// Create default logger instance
const logger = createLogger({
  prettyPrint: true,
});

// Export types and constants
export type { Level, LoggerOptions };
export { createLogger, logger, LOG_STATUS_TYPE, LOG_STATUS_EMOJI, LOG_STATUS_COLOR, LOG_LEVELS };
