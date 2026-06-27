const DEFAULT_LOG_LEVEL = "INFO";

const LEVELS = Object.freeze({
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  SILENT: 99,
});

const LEVEL_NAMES = Object.freeze({
  10: "DEBUG",
  20: "INFO",
  30: "WARN",
  40: "ERROR",
  99: "SILENT",
});

const LEVEL_ALIASES = Object.freeze({
  TRACE: "DEBUG",
  WARNING: "WARN",
  FATAL: "ERROR",
  CRITICAL: "ERROR",
  NOTICE: "INFO",
});

function normalizeLevel(value) {
  const raw = (value ?? "").toString().trim().toUpperCase();
  if (!raw) return DEFAULT_LOG_LEVEL;

  if (Object.hasOwn(LEVEL_ALIASES, raw)) {
    return LEVEL_ALIASES[raw];
  }

  if (Object.hasOwn(LEVELS, raw)) {
    return raw;
  }

  return DEFAULT_LOG_LEVEL;
}

function getCurrentLevel() {
  return normalizeLevel(process.env.LOG_LEVEL);
}

function shouldLog(level) {
  const currentLevel = getCurrentLevel();
  return LEVELS[level] >= LEVELS[currentLevel];
}

function formatMessage(level, args) {
  const prefix = `[${LEVEL_NAMES[LEVELS[level]]}]`;
  return [prefix, ...args];
}

function log(level, ...args) {
  if (!shouldLog(level)) return;

  const message = formatMessage(level, args);

  switch (level) {
    case "DEBUG":
      console.debug(...message);
      break;
    case "INFO":
      console.info(...message);
      break;
    case "WARN":
      console.warn(...message);
      break;
    case "ERROR":
      console.error(...message);
      break;
    default:
      console.log(...message);
  }
}

const logger = {
  debug: (...args) => log("DEBUG", ...args),
  info: (...args) => log("INFO", ...args),
  warn: (...args) => log("WARN", ...args),
  error: (...args) => log("ERROR", ...args),
  log: (...args) => log("INFO", ...args),
  setLevel(level) {
    const normalized = normalizeLevel(level);
    process.env.LOG_LEVEL = normalized;
    return normalized;
  },
  getLevel() {
    return getCurrentLevel();
  },
};

export default logger;
export { logger, getCurrentLevel, normalizeLevel, DEFAULT_LOG_LEVEL };
