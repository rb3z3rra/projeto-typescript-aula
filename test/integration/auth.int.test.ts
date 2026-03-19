import {  describe,  it,  expect,  beforeAll,  beforeEach,  afterAll,} from "@jest/globals";

import { createApp } from "../../src/app.js";
import { appDataSource } from "../../src/database/appDataSource.js";
import RefreshToken from "../../src/entities/RefreshToken.js";

import { startServer, httpJson } from "../setup/httpClient.js";
import {
  initTestDatabase,
  clearDatabase,
  closeTestDatabase,
} from "../setup/testDatabase.js";

describe("Integração: Auth", () => {
  let server: Awaited<ReturnType<typeof startServer>>;
  let baseUrl: string;

  const payloadPesquisador = {
    nome: "Daniel Divino",
    email: "daniel@email.com",
    senha: "12345678",
    especialidade: "IoT",
    titulacao: "Mestrado",
    matricula: "MAT-001",
    linhaPesquisa: "Sensores inteligentes",
    dataNascimento: "1998-05-10",
  };

  beforeAll(async () => {
    await initTestDatabase();
    const app = createApp();
    server = await startServer(app);
    baseUrl = server.baseUrl;
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await server.close();
    await closeTestDatabase();
  });

  it("deve fazer login com sucesso e retornar tokens", async () => {
    await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadPesquisador,
      headers: {
        "User-Agent": "jest-test",
      },
    });

    const res = await httpJson(baseUrl, "/api/login", {
      method: "POST",
      body: {
        email: payloadPesquisador.email,
        senha: payloadPesquisador.senha,
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    expect(res.status).toBe(200);
    expect(res.data.tokens).toBeTruthy();
    expect(res.data.tokens.tokenAccess).toBeTruthy();
    expect(res.data.tokens.tokenRefresh).toBeTruthy();

    const refreshRepo = appDataSource.getRepository(RefreshToken);
    const refreshTokens = await refreshRepo.find();

    expect(refreshTokens.length).toBe(1);
    expect(refreshTokens[0].revoked).toBe(false);
  });

  it("deve retornar 401 ao fazer login com email inexistente", async () => {
    const res = await httpJson(baseUrl, "/api/login", {
      method: "POST",
      body: {
        email: "naoexiste@email.com",
        senha: "12345678",
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    expect(res.status).toBe(401);
  });

  it("deve retornar 401 ao fazer login com senha errada", async () => {
    await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadPesquisador,
      headers: {
        "User-Agent": "jest-test",
      },
    });

    const res = await httpJson(baseUrl, "/api/login", {
      method: "POST",
      body: {
        email: payloadPesquisador.email,
        senha: "senha-errada",
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    expect(res.status).toBe(401);
  });

  it("deve fazer refresh com sucesso", async () => {
    await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadPesquisador,
      headers: {
        "User-Agent": "jest-test",
      },
    });

    const loginRes = await httpJson(baseUrl, "/api/login", {
      method: "POST",
      body: {
        email: payloadPesquisador.email,
        senha: payloadPesquisador.senha,
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    const refreshTokenAntigo = loginRes.data.tokens.tokenRefresh;

    const refreshRes = await httpJson(baseUrl, "/api/refresh", {
      method: "POST",
      body: {
        refreshToken: refreshTokenAntigo,
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.data.tokens).toBeTruthy();
    expect(refreshRes.data.tokens.tokenAccess).toBeTruthy();
    expect(refreshRes.data.tokens.tokenRefresh).toBeTruthy();
    expect(refreshRes.data.tokens.tokenRefresh).not.toBe(refreshTokenAntigo);

    const refreshRepo = appDataSource.getRepository(RefreshToken);
    const refreshTokens = await refreshRepo.find();
    expect(refreshTokens.length).toBeGreaterThanOrEqual(2);

    expect(refreshTokens.length).toBeGreaterThanOrEqual(2);
  });

  it("deve retornar 401 ao fazer refresh com token inválido", async () => {
    const res = await httpJson(baseUrl, "/api/refresh", {
      method: "POST",
      body: {
        refreshToken: "token-invalido",
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    expect(res.status).toBe(401);
  });

  it("deve retornar 401 ao fazer refresh com user-agent diferente", async () => {
    await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadPesquisador,
      headers: {
        "User-Agent": "jest-test",
      },
    });

    const loginRes = await httpJson(baseUrl, "/api/login", {
      method: "POST",
      body: {
        email: payloadPesquisador.email,
        senha: payloadPesquisador.senha,
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    const res = await httpJson(baseUrl, "/api/refresh", {
      method: "POST",
      body: {
        refreshToken: loginRes.data.tokens.tokenRefresh,
      },
      headers: {
        "User-Agent": "outro-user-agent",
      },
    });

    expect(res.status).toBe(401);
  });

  it("deve fazer logout com sucesso e revogar o refresh token", async () => {
    await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadPesquisador,
      headers: {
        "User-Agent": "jest-test",
      },
    });

    const loginRes = await httpJson(baseUrl, "/api/login", {
      method: "POST",
      body: {
        email: payloadPesquisador.email,
        senha: payloadPesquisador.senha,
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    const refreshToken = loginRes.data.tokens.tokenRefresh;

    const logoutRes = await httpJson(baseUrl, "/api/logout", {
      method: "POST",
      body: {
        refreshToken,
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.data.message).toBe("Success");

    const refreshRepo = appDataSource.getRepository(RefreshToken);
    const tokens = await refreshRepo.find();

    expect(tokens.length).toBe(1);
    expect(tokens[0].revoked).toBe(true);
  });

  it("deve retornar 400 ao fazer logout com token inválido", async () => {
    const res = await httpJson(baseUrl, "/api/logout", {
      method: "POST",
      body: {
        refreshToken: "token-invalido",
      },
      headers: {
        "User-Agent": "jest-test",
      },
    });

    expect(res.status).toBe(400);
  });

  it("não deve permitir reutilizar refresh token antigo", async () => {
  
  // 1️⃣ cria usuário
  await httpJson(baseUrl, "/api/pesquisador", {
    method: "POST",
    body: payloadPesquisador,
    headers: { "User-Agent": "jest-test" },
  });

  // 2️⃣ faz login
  const loginRes = await httpJson(baseUrl, "/api/login", {
    method: "POST",
    body: {
      email: payloadPesquisador.email,
      senha: payloadPesquisador.senha,
    },
    headers: { "User-Agent": "jest-test" },
  });

  const tokenAntigo = loginRes.data.tokens.tokenRefresh;

  // 3️⃣ primeiro refresh → OK
  const refresh1 = await httpJson(baseUrl, "/api/refresh", {
    method: "POST",
    body: { refreshToken: tokenAntigo },
    headers: { "User-Agent": "jest-test" },
  });

  expect(refresh1.status).toBe(200);

  // 4️⃣ segundo refresh com mesmo token → deve falhar
  const refresh2 = await httpJson(baseUrl, "/api/refresh", {
    method: "POST",
    body: { refreshToken: tokenAntigo },
    headers: { "User-Agent": "jest-test" },
  });

  expect(refresh2.status).toBe(401);
});
});