import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import logger from "../utils/logger.js";
import { homedir } from "node:os";

function findClaudeDir() {
  // Priority: CLAUDE_PROJECT_DIR/.claude, then ./.claude, then ~/.claude.
  if (process.env.CLAUDE_PROJECT_DIR) {
    const projectDir = join(process.env.CLAUDE_PROJECT_DIR, ".claude");
    if (existsSync(projectDir)) return projectDir;
  }

  const cwdDir = join(process.cwd(), ".claude");
  if (existsSync(cwdDir)) return cwdDir;

  const homeDir = join(homedir(), ".claude");
  if (existsSync(homeDir)) return homeDir;

  return null;
}

function findClaudeSettingsPath() {
  // Reuse the same CLAUDE_PROJECT_DIR -> cwd -> home priority used to detect
  // Claude Code. If none of those .claude dirs exist yet (fresh setup), default
  // to creating one under CLAUDE_PROJECT_DIR if set, otherwise the cwd.
  const existingDir = findClaudeDir();
  if (existingDir) {
    return join(existingDir, "settings.json");
  } else {
    logger.info(" .claude dir not found ")
  }

  const baseDir = process.cwd();
  logger.info(" using in current directory = ",join(baseDir, ".claude", "settings.json"))
  return join(baseDir, ".claude", "settings.json");
}

function initClaude() {
  if (!isClaudeCodeInstalled()) {
    logger.info("ℹ️  No claude binary found ");
    return;
  }
  logger.debug("finding .claude dir for settings.json");
  const settingsPath = findClaudeSettingsPath();
  const output = mkdirSync(dirname(settingsPath), { recursive: true });
  logger.debug(output);
  

  // const settings = readJsonSafe(settingsPath);
  // const newHooks = buildClaudeHooksBlock();

  // // Merge rather than clobber: if the user already has hooks configured for
  // // some events, we append our command alongside theirs instead of replacing.
  // settings.hooks = settings.hooks || {};
  // for (const [event, matcherGroups] of Object.entries(newHooks)) {
  //   if (!settings.hooks[event]) {
  //     settings.hooks[event] = matcherGroups;
  //   } else {
  //     // Avoid duplicate registration if init is run twice.
  //     const alreadyRegistered = JSON.stringify(settings.hooks[event]).includes("agent-hooks");
  //     if (!alreadyRegistered) {
  //       settings.hooks[event] = [...settings.hooks[event], ...matcherGroups];
  //     }
  //   }
  // }

  // writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  // logger.info(`✅ Claude Code hooks wired up at: ${settingsPath}`);
  // logger.info(`   Registered ${CLAUDE_EVENTS.length} events -> ${RECEIVER_PATH}`);
  // logger.info(
  //   `   Restart Claude Code (or start a new session) for hooks to take effect.`,
  // );
}

function isClaudeCliOnPath() {
  try {
    logger.debug("running the claude cli cmd");
    const output = execFileSync("claude", ["--version"], {
      encoding: "utf8",
    });

    logger.debug(output);
    return true;
  } catch (err) {
    logger.error(err.stderr?.toString() || err.message);
    return false;
  }
}

function isClaudeCodeInstalled() {
  return isClaudeCliOnPath();
}

function initCodex() {
  logger.warn(
      "⚠️  Codex support is not wired up yet in this version. Coming next.",
    );
}
export async function runInit(opts) {
  const target = opts.agent; // null/undefined means "default to Claude"

  if (!target) {
    logger.info(
      "\nNote: only Claude Code is supported in this build. Codex and Gemini adapters come next.",
    );

    // Default behavior: run Claude
    initClaude();
  }

  if (target === "claude") {
    initClaude();
  }

  if (target === "codex") {
    initCodex();
    
  }

  if (target === "gemini") {
    logger.warn(
      "⚠️  Gemini CLI support is not wired up yet in this version. Coming next.",
    );
    
  }
}