/* eslint-disable no-console */

const isProduction = process.env.NODE_ENV === "production";

type LogArguments = unknown[];

const shouldLog = (level: "debug" | "info" | "warn" | "error") =>
  level === "error" || level === "warn" || !isProduction;

const log =
  (level: "debug" | "info" | "warn" | "error") =>
  (...args: LogArguments) => {
    if (!shouldLog(level)) {
      return;
    }

    switch (level) {
      case "debug":
        console.debug(...args);
        break;
      case "info":
        console.info(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      case "error":
        console.error(...args);
        break;
      default:
        console.log(...args);
    }
  };

export const logger = {
  debug: log("debug"),
  info: log("info"),
  warn: log("warn"),
  error: log("error"),
};

export type Logger = typeof logger;
