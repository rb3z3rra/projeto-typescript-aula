import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";

import { createApp } from "../../src/app.js";
import { appDataSource } from "../../src/database/appDataSource.js";

import Area from "../../src/entities/Area.js";
import { Sensor } from "../../src/entities/Sensor.js";
import RefreshToken from "../../src/entities/RefreshToken.js";
import Pesquisador from "../../src/entities/Pesquisador.js";

import { startServer, httpJson } from "../setup/httpClient.js";
import {
  initTestDatabase,
  closeTestDatabase,
} from "../setup/testDatabase.js";

describe("Integração: Área", () => {
  let server: Awaited<ReturnType<typeof startServer>>;
  let baseUrl: string;

  const payloadArea = {
    nome: "Área Florestal",
    descricao: "Área usada nos testes",
    bioma: "Floresta",
    latitude: -3.1190275,
    longitude: -60.0217314,
    largura: 150,
    comprimento: 250,
    relevo: "Plano",
  };

  beforeAll(async () => {
    await initTestDatabase();
    const app = createApp();
    server = await startServer(app);
    baseUrl = server.baseUrl;
  });

  beforeEach(async () => {
    await appDataSource.createQueryBuilder().delete().from(RefreshToken).execute();
    await appDataSource.createQueryBuilder().delete().from(Sensor).execute();
    await appDataSource.createQueryBuilder().delete().from(Area).execute();
    await appDataSource.createQueryBuilder().delete().from(Pesquisador).execute();
  });

  afterAll(async () => {
    await server.close();
    await closeTestDatabase();
  });

  it("deve criar área com sucesso", async () => {
    const res = await httpJson(baseUrl, "/api/area", {
      method: "POST",
      body: payloadArea,
    });

    expect(res.status).toBe(201);
    expect(res.data).toBeTruthy();
    expect(res.data.nome).toBe(payloadArea.nome);
    expect(res.data.bioma).toBe(payloadArea.bioma);

    const areaRepo = appDataSource.getRepository(Area);
    const areaSalva = await areaRepo.findOneBy({ nome: payloadArea.nome });

    expect(areaSalva).toBeTruthy();
  });

  it("deve listar áreas", async () => {
    await httpJson(baseUrl, "/api/area", {
      method: "POST",
      body: payloadArea,
    });

    const res = await httpJson(baseUrl, "/api/area");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBe(1);
    expect(res.data[0].nome).toBe(payloadArea.nome);
  });

  it("deve buscar área por id", async () => {
    const createRes = await httpJson(baseUrl, "/api/area", {
      method: "POST",
      body: payloadArea,
    });

    const id = createRes.data.id;

    const res = await httpJson(baseUrl, `/api/area/${id}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(id);
    expect(res.data.nome).toBe(payloadArea.nome);
  });

  it("deve atualizar área com sucesso", async () => {
    const createRes = await httpJson(baseUrl, "/api/area", {
      method: "POST",
      body: payloadArea,
    });

    const id = createRes.data.id;

    const res = await httpJson(baseUrl, `/api/area/${id}`, {
      method: "PUT",
      body: {
        nome: "Área Atualizada",
        relevo: "Montanhoso",
      },
    });

    expect(res.status).toBe(200);
    expect(res.data.nome).toBe("Área Atualizada");
    expect(res.data.relevo).toBe("Montanhoso");
  });

  it("deve deletar área com sucesso", async () => {
    const createRes = await httpJson(baseUrl, "/api/area", {
      method: "POST",
      body: payloadArea,
    });

    const id = createRes.data.id;

    const deleteRes = await httpJson(baseUrl, `/api/area/${id}`, {
      method: "DELETE",
    });

    expect(deleteRes.status).toBe(204);

    const areaRepo = appDataSource.getRepository(Area);
    const area = await areaRepo.findOneBy({ id });

    expect(area).toBeNull();
  });

  it("deve retornar 404 ao buscar área inexistente", async () => {
    const res = await httpJson(
      baseUrl,
      "/api/area/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
  });

  it("deve retornar 404 ao atualizar área inexistente", async () => {
    const res = await httpJson(
      baseUrl,
      "/api/area/00000000-0000-0000-0000-000000000000",
      {
        method: "PUT",
        body: {
          nome: "Área fantasma",
        },
      },
    );

    expect(res.status).toBe(404);
  });

  it("deve retornar 404 ao deletar área inexistente", async () => {
    const res = await httpJson(
      baseUrl,
      "/api/area/00000000-0000-0000-0000-000000000000",
      {
        method: "DELETE",
      },
    );

    expect(res.status).toBe(404);
  });
});