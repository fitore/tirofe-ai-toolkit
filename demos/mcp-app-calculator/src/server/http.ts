import { createReverseMortgageServer } from "./appServer.js";

export function createServerForHttpTransport() {
  return createReverseMortgageServer();
}

export function startHttpServer(): never {
  throw new Error(
    "HTTP/Streamable transport is intentionally not implemented for v1. Add it here for ChatGPT remote or tunnel testing.",
  );
}
