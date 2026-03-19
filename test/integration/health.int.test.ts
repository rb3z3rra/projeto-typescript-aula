import { createApp } from "../../src/app.js";
import { startServer } from "../setup/httpClient.js";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";


describe("Integração: GET /health", () => {
  let server: Awaited<ReturnType<typeof startServer>>;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createApp();
    server = await startServer(app);
    baseUrl = server.baseUrl;
  });

  afterAll(async () => {
    await server.close();
  });

  it("deve retornar 200 e status ok", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "ok" });
  });
});