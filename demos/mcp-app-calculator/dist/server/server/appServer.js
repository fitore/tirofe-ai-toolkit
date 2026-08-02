import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { checkReverseMortgageEligibility } from "../shared/eligibility.js";
export const serverName = "reverse-mortgage-eligibility-demo";
export const toolName = "check-reverse-mortgage-eligibility";
export const resourceUri = "ui://reverse-mortgage-eligibility/mcp-app.html";
const provinceSchema = z.enum(["ON", "BC", "AB", "QC", "OTHER"]);
const toolInputSchema = {
    age: z.number().describe("Borrower age in years."),
    homeValue: z.number().describe("Home value in CAD."),
    province: provinceSchema.describe("Canadian province code for the property."),
};
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const bundledUiPath = path.resolve(serverDir, "../../ui/mcp-app.html");
export function registerReverseMortgageApp(server) {
    registerAppTool(server, toolName, {
        title: "Check Reverse Mortgage Eligibility",
        description: "Returns illustrative, non-underwriting reverse mortgage eligibility and estimate JSON for a personal local demo.",
        inputSchema: toolInputSchema,
        annotations: {
            readOnlyHint: true,
        },
        _meta: {
            ui: { resourceUri },
        },
    }, async (input) => {
        const result = checkReverseMortgageEligibility(input);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result),
                },
            ],
        };
    });
    registerAppResource(server, resourceUri, resourceUri, { mimeType: RESOURCE_MIME_TYPE }, async () => {
        const html = await readFile(bundledUiPath, "utf8");
        return {
            contents: [
                {
                    uri: resourceUri,
                    mimeType: RESOURCE_MIME_TYPE,
                    text: html,
                },
            ],
        };
    });
}
export function createReverseMortgageServer() {
    const server = new McpServer({
        name: serverName,
        version: "0.1.0",
    });
    registerReverseMortgageApp(server);
    return server;
}
