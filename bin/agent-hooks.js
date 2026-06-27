#!/usr/bin/env node
// bin/agent-hooks.js
// CLI entry point: `agent-hooks init` and `agent-hooks report`

import { Command } from "commander";
import { runInit } from "../src/init.js";

const program = new Command();

program
  .name("agent-hooks")
  .description("Unified hook-based action logger for Claude Code, Codex, and Gemini CLI")
  .version("0.1.0");

program
  .command("init")
  .description("Detect installed agents (Claude Code for now) and wire up hooks automatically")
  .option("--agent <name>", "only wire up a specific agent (claude|codex|gemini)")
  .action(async (opts) => {
    await runInit(opts);
  });

program.parse();
