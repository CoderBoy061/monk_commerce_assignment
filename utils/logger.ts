type LogLevel = "info" | "warn" | "error";

function timestamp(): string {
  return new Date().toISOString();
}

function format(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): string {
  const payload = {
    time: timestamp(),
    level,
    message,
    ...(meta && Object.keys(meta).length > 0 ? meta : {}),
  };
  return JSON.stringify(payload);
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(format("info", message, meta));
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(format("warn", message, meta));
  },
  error(message: string, meta?: Record<string, unknown>): void {
    console.error(format("error", message, meta));
  },
};
