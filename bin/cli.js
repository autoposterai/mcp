#!/usr/bin/env node

/**
 * Auto Poster AI Stdio MCP Server
 * Compatible with Cursor, Windsurf, Claude Desktop, Claude Code, and all MCP stdio clients.
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Handle CLI auto-install command: npx -y @autoposter/mcp install <target>
if (process.argv[2] === "install") {
  const target = (process.argv[3] || "").toLowerCase();
  let key = process.env.AUTOPOSTER_API_KEY || "";
  const keyIndex = process.argv.indexOf("--key");
  if (keyIndex !== -1 && process.argv[keyIndex + 1]) {
    key = process.argv[keyIndex + 1];
  }

  let configPath = "";
  if (target === "claude" || target === "claude-desktop") {
    if (process.platform === "darwin") {
      configPath = path.join(os.homedir(), "Library/Application Support/Claude/claude_desktop_config.json");
    } else if (process.platform === "win32") {
      configPath = path.join(process.env.APPDATA || "", "Claude/claude_desktop_config.json");
    } else {
      configPath = path.join(os.homedir(), ".config/Claude/claude_desktop_config.json");
    }
  } else if (target === "cursor") {
    configPath = path.join(process.cwd(), ".cursor/mcp.json");
  } else if (target === "vscode" || target === "copilot") {
    configPath = path.join(process.cwd(), ".vscode/mcp.json");
  } else if (target === "windsurf") {
    configPath = path.join(os.homedir(), ".codeium/windsurf/mcp_config.json");
  } else {
    console.error("Unknown target. Supported targets: claude, cursor, vscode, windsurf");
    console.error("Usage: npx @autoposter/mcp install <claude|cursor|vscode|windsurf> [--key <your_api_key>]");
    process.exit(1);
  }

  const isWorkspaceConfig = target === "cursor" || target === "vscode" || target === "copilot";

  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    let config = {};
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      } catch (e) {
        console.error(`Failed to parse existing configuration at ${configPath}: ${e.message}`);
        process.exit(1);
      }
    }

    const serverDef = {
      command: "npx",
      args: ["-y", "@autoposter/mcp"],
      env: {
        AUTOPOSTER_API_KEY: isWorkspaceConfig
          ? "${env:AUTOPOSTER_API_KEY}"
          : (key || "PASTE_YOUR_API_KEY_HERE"),
      },
    };

    if (target === "vscode" || target === "copilot") {
      if (!config.servers) config.servers = {};
      config.servers.autoposter = serverDef;
    } else {
      if (!config.mcpServers) config.mcpServers = {};
      config.mcpServers.autoposter = serverDef;
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

    if (!isWorkspaceConfig && key) {
      try {
        fs.chmodSync(configPath, 0o600);
      } catch (e) {}
    }

    console.log(`\x1b[32m✓ Successfully configured Auto Poster AI MCP in ${configPath}\x1b[0m`);
    if (isWorkspaceConfig) {
      console.log(`\x1b[36mi Workspace config references \${env:AUTOPOSTER_API_KEY}. Set AUTOPOSTER_API_KEY in your environment to keep secrets out of git.\x1b[0m`);
    } else if (!key) {
      console.log(`\x1b[33m! Remember to replace PASTE_YOUR_API_KEY_HERE with your real API key in ${configPath}\x1b[0m`);
    }
    process.exit(0);
  } catch (err) {
    console.error(`Failed to write config: ${err.message}`);
    process.exit(1);
  }
}

const API_KEY = process.env.AUTOPOSTER_API_KEY || "";
const API_URL = (process.env.AUTOPOSTER_API_URL || "https://agent.autoposter.ai").replace(/\/+$/, "");

if (!API_KEY) {
  process.stderr.write(
    "[autoposter-mcp] ERROR: AUTOPOSTER_API_KEY environment variable is missing.\n" +
    "[autoposter-mcp] Generate a key at https://app.autoposter.ai/ai-agents\n"
  );
}


const VERSION = require("../package.json").version;
let sessionId = null;

// Thin proxy: forward each JSON-RPC message to the hosted MCP server so tools never drift from it.
async function forward(msg) {
  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": `autoposter-mcp/${VERSION}`,
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const isRequest = msg.id !== undefined && msg.id !== null;
  try {
    const res = await fetch(`${API_URL}/mcp`, { method: "POST", headers, body: JSON.stringify(msg) });
    sessionId = res.headers.get("mcp-session-id") || sessionId;
    const text = await res.text();
    if (!isRequest) return;
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200) || "empty response"}`);
    }
    process.stdout.write(JSON.stringify(data) + "\n");
  } catch (err) {
    process.stderr.write(`[autoposter-mcp] error: ${err.message}\n`);
    if (isRequest) {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: err.message } }) + "\n");
    }
  }
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch (err) {
    process.stderr.write(`[autoposter-mcp] invalid JSON: ${err.message}\n`);
    return;
  }
  forward(msg);
});
