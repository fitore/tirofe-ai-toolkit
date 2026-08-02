import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createReverseMortgageServer } from "./appServer.js";

const server = createReverseMortgageServer();
const transport = new StdioServerTransport();

await server.connect(transport);
