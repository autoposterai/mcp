# @autoposter/mcp

Official Model Context Protocol (MCP) server for [Auto Poster AI](https://autoposter.ai) — the automated social media publishing platform for X, LinkedIn, Instagram, TikTok, YouTube, Pinterest, Threads, Facebook, and Bluesky.

Connects Cursor, Windsurf, Claude Desktop, and AI coding agents directly to your Auto Poster AI workspace.

---

## ⚡ 1-Click Auto Install

Run from your terminal to automatically configure your favorite AI tool:

### Claude Desktop
```bash
npx -y @autoposter/mcp install claude --key YOUR_API_KEY
```

### Cursor
```bash
npx -y @autoposter/mcp install cursor --key YOUR_API_KEY
```

### VS Code / GitHub Copilot
```bash
npx -y @autoposter/mcp install vscode --key YOUR_API_KEY
```

### Windsurf
```bash
npx -y @autoposter/mcp install windsurf --key YOUR_API_KEY
```

*Don't have an API key? Generate one at [https://app.autoposter.ai/ai-agents](https://app.autoposter.ai/ai-agents).*

---

## 🛠 Manual Configuration

Add to your MCP config file (e.g. `claude_desktop_config.json` or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "autoposter": {
      "command": "npx",
      "args": ["-y", "@autoposter/mcp"],
      "env": {
        "AUTOPOSTER_API_KEY": "ap_live_your_api_key_here"
      }
    }
  }
}
```

---

## 🧰 Available Tools

The CLI proxies to the hosted server, so tools always match it.

| Tool | Description |
|---|---|
| `autoposter_list_accounts` | Lists connected social channels (X, LinkedIn, Instagram, TikTok, YouTube, Pinterest, etc.) and workspace timezone. |
| `autoposter_get_rules` | Returns platform character limits, aspect ratios, and media constraints. |
| `autoposter_upload_media` | Uploads media (images/videos up to 100MB) directly to the workspace media library. |
| `autoposter_get_media_upload_url` | Generates presigned S3 upload URLs for direct upload of files up to 5GB without timeout limits. |
| `autoposter_create_upload_link` | Creates a short-lived link where the user uploads images from their device into the media library. |
| `autoposter_list_media` | Lists uploaded media files (images/videos) in the workspace library with CDN URLs. |
| `autoposter_draft_post` | Creates a post draft for human review. If direct publish is not enabled, automatically requests approval. |
| `autoposter_schedule_post` | Schedules a post for a future date/time. Automatically handles local workspace timezone. |
| `autoposter_list_posts` | Lists recent, scheduled, and draft posts with state filtering and keyword search. |
| `autoposter_publish_draft` | Approves and triggers publishing of an existing draft. |
| `autoposter_get_post` | Retrieves post state, error details, or live published URLs. |
| `autoposter_get_post_status` | Checks post delivery status and live platform links. |
| `autoposter_delete_post` | Deletes or cancels a draft, scheduled, or pending post. |
| `autoposter_get_analytics` | Reads per-post metrics (with totals) or account-level snapshots (followers, reach, impressions, engagement) for a date range. |
| `autoposter_update_post` | Edits a draft, scheduled, or pending post in place (text, media, title, visibility, first comment/thread, schedule time). |
| `get_profile` | Returns the profile behind the authenticated credentials. |

---

## 🌐 Remote MCP (Streamable HTTP)

Auto Poster AI also hosts a managed cloud MCP server supporting Streamable HTTP:

- **Endpoint:** `https://agent.autoposter.ai/mcp`
- **Header:** `Authorization: Bearer ap_live_...` (or `x-api-key: ap_live_...`)

---

## 📄 License

MIT © [Auto Poster AI](https://autoposter.ai)
