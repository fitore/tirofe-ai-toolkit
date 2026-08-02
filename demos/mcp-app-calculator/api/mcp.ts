import { createMcpHandler } from "mcp-handler";
import { registerReverseMortgageApp, serverName } from "../src/server/appServer.js";

const handler = createMcpHandler(
  (server) => {
    registerReverseMortgageApp(server);
  },
  {
    serverInfo: {
      name: serverName,
      version: "0.1.0",
    },
  },
  {
    // Matches this file's own route (/api/mcp.ts -> /api/mcp), so the
    // handler's internal endpoint check accepts requests routed here.
    basePath: "/api",
  },
);

export default { fetch: handler };
