# Reverse Mortgage Eligibility MCP App

Personal demo project only. This is not an EQ product and does not provide financial advice.

This local MCP App exposes one tool, `check-reverse-mortgage-eligibility`, and one inline `ui://` resource. The calculator uses an illustrative placeholder curve, not a real underwriting formula, and it does not persist user data.

## Install, Build, Run

```bash
cd /Users/fitore/Development/tirofe-ai-toolkit/demos/mcp-app-calculator
pnpm install
pnpm build
pnpm serve
```

`pnpm build` compiles the server to `dist/server` and bundles the UI as the single file `dist/ui/mcp-app.html`.

## Claude Desktop

Add this block to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "reverse-mortgage-eligibility-demo": {
      "command": "node",
      "args": [
        "/Users/fitore/Development/tirofe-ai-toolkit/demos/mcp-app-calculator/dist/server/server/stdio.js"
      ]
    }
  }
}
```

After saving the config, restart Claude Desktop so it reloads local MCP servers. Then ask Claude to check reverse mortgage eligibility or to open the app UI.

## HTTP Transport (Vercel)

`api/mcp.ts` wraps the same tool/resource registration used by the stdio server (`registerReverseMortgageApp` in `src/server/appServer.ts`) in an HTTP-speaking handler via [`mcp-handler`](https://www.npmjs.com/package/mcp-handler), so it can run as a Vercel serverless function without a framework. Claude Desktop keeps using the stdio entry point unchanged; this is a second, additive transport for hosts that need HTTP (e.g. ChatGPT).

Status: wired but not yet verified end-to-end locally or deployed. A local Streamable HTTP round-trip (initialize -> notifications/initialized -> tool call) surfaced an unresolved 500 response on the second request during manual debugging; needs a follow-up pass before relying on it. Deploying to Vercel and registering the ChatGPT connector (runbook steps 3-6) hasn't been done yet either.

## ChatGPT

ChatGPT setup is distinct from Claude Desktop's local JSON config. Current OpenAI documentation says ChatGPT custom MCP apps are configured from ChatGPT web settings, require developer mode access, and need an endpoint for the MCP server.

High-level setup path as of August 2, 2026:

1. Confirm developer mode is enabled for your account. Workspace admins can enable it from `Workspace Settings -> Permissions & Roles -> Connected Data Developer mode / Create custom MCP connectors`; authorized users may also see `Settings -> Apps -> Advanced Settings`.
2. Create the custom app from `Workspace Settings -> Apps -> Create` for admins/owners, or `Settings -> Apps -> Create` for authorized users.
3. Provide the MCP server endpoint and required app metadata.
4. Choose the authentication mechanism, if any. This demo uses no OAuth.
5. Click `Scan Tools`, wait for the scan to complete, then click `Create`.
6. Test from a new ChatGPT web chat by selecting the draft app from the tools menu or referring to it in the prompt.

ChatGPT runtime testing is still outstanding: the HTTP handler above exists but hasn't been deployed or pointed at from a ChatGPT connector yet. ChatGPT cannot connect directly to the local stdio server; it needs the Vercel-hosted `/api/mcp` endpoint (or a tunnel to it).

## Post-Demo Persistence

If the recipient needs to use this after the meeting, local config distribution is not enough. Deploy `api/mcp.ts` to Vercel (or tunnel to it) and revisit hosting, access control, and setup instructions.

## Manual Test Checklist

- Eligible case: age `65`, home value `750000`, province `ON`; expect `eligible: true`, `pct: 0.28`, and `estimatedAmount: 210000`.
- Ineligible by age: age `54`, province `ON`; expect `eligible: false` and `reason: "age"`.
- Ineligible by location: age `65`, province `OTHER`; expect `eligible: false` and `reason: "location"`.
- Host without UI support: call `check-reverse-mortgage-eligibility` directly and confirm the text content is parseable JSON.
- UI placement: in the eligible result, confirm the line `Illustrative estimate only. Not affiliated with or representative of any real lender's rates.` appears directly under the amount.
- Claude Desktop: add the config, restart Claude Desktop, call the tool, and confirm the `ui://` app renders inline.
