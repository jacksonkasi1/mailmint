# Lightweight Logger for Hr Manager

A lightweight, customizable logger for the Hr Manager project.

## Features

- Zero dependencies
- Configurable output formats (emoji, color, JSON)
- Log level filtering
- Customizable display options (timestamp, level, color)
- Child loggers for context binding

## Basic Usage

```typescript
import { logger } from "@repo/logs";

// Basic logging
logger.info("This is an info message");
logger.error("This is an error message");
logger.warn("This is a warning message");
logger.debug("This is a debug message");

// Logging with contextual data
logger.info("User login successful", { userId: 123, action: "login" });
```

## Custom Logger Configuration

You can create custom logger instances with different configurations:

```typescript
import { createLogger } from "@repo/logs";

// Create a logger with emoji indicators and timestamps
const myLogger = createLogger({
  statusType: "emoji",
  config: {
    enable_timestamp: true,
    enable_level: true,
    enable_pretty: true,
  },
});

// Create a JSON logger for structured logging
const jsonLogger = createLogger({
  config: {
    enable_pretty: false,
  },
});

// Create a logger that only shows errors and above
const errorLogger = createLogger({
  level: "error",
});
```

## Configuration Options

### Log Levels

Available log levels (from highest to lowest priority):

- `fatal` (60)
- `error` (50)
- `warn` (40)
- `info` (30)
- `debug` (20)
- `trace` (10)

### Status Type

Two display modes are available:

- `emoji`: Uses emoji indicators (default): 💀 🚨 ⚠️ ℹ️ 🔍
- `color`: Uses ANSI color codes for terminal output

### Configuration Object

The `config` object supports these options:

- `enable_timestamp`: Show ISO timestamp in log output
- `enable_level`: Show log level (INFO, ERROR, etc.)
- `enable_color`: Use color for the `color` status type
- `enable_pretty`: Pretty print logs (vs JSON format)

## Child Loggers

You can create child loggers that inherit the parent's configuration and add context to all log messages:

```typescript
const userLogger = logger.child({ module: "user-service" });

userLogger.info("User login"); // Will include { module: 'user-service' } in the log data
```

## Advanced Usage

### Importing Configuration Constants

You can import and modify the logger constants:

```typescript
import {
  LOG_STATUS_TYPE,
  LOG_STATUS_EMOJI,
  LOG_STATUS_COLOR,
  LOG_LEVELS,
} from "@repo/logs";

// You can use these constants in your own code if needed
```

### Type Definitions

Type definitions are exported for use in your code:

```typescript
import type { Level, LoggerOptions } from "@repo/logs";

// Use these types for your own logger-related code
```
