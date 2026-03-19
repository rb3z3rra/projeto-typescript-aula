import {  describe,  it,  expect,  beforeAll,  beforeEach,  afterAll,} from "@jest/globals";

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

describe("Integração: Sensor", () => {
  let server: Awaited<ReturnType<typeof startServer>>;
  let baseUrl: string;

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

  async function criarArea() {
    const areaRepo = appDataSource.getRepository(Area);

    const area = areaRepo.create({
      nome: "Área de Teste",
      descricao: "Área criada para testes",
      bioma: "Amazônia",
      latitude: -3.1190275,
      longitude: -60.0217314,
      largura: 100,
      comprimento: 200,
      relevo: "Plano",
    });

    return await areaRepo.save(area);
  }

  const payloadBaseSensor = {
  serialNumber: "SN-001",
  fabricante: "Intelbras",
  modelo: "XT-1000",
  tipo: "temperatura",
  status: "Ativo",
  ipFixo: "192.168.0.10",
  dataInstalacao: "2026-03-01",
  dataManutencao: "2026-03-10",
  cicloLeitura: 30,
  latitude: -3.1190275,
  longitude: -60.0217314,
  finalidade: "Monitoramento ambiental",
};

  it("deve criar sensor com sucesso", async () => {
    const area = await criarArea();

    const res = await httpJson(baseUrl, "/api/sensors", {
      method: "POST",
      body: {
        ...payloadBaseSensor,
        area_id: area.id,
      },
    });

    expect(res.status).toBe(201);
    expect(res.data).toBeTruthy();
    expect(res.data.serialNumber).toBe("SN-001");

    const sensorRepo = appDataSource.getRepository(Sensor);
    const sensorSalvo = await sensorRepo.findOne({
      where: { serialNumber: "SN-001" },
      relations: ["area"],
    });

    expect(sensorSalvo).toBeTruthy();
    expect(sensorSalvo?.area.id).toBe(area.id);
  });

  it("deve listar sensores", async () => {
    const area = await criarArea();

    await httpJson(baseUrl, "/api/sensors", {
      method: "POST",
      body: {
        ...payloadBaseSensor,
        area_id: area.id,
      },
    });

    const res = await httpJson(baseUrl, "/api/sensors");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBe(1);
    expect(res.data[0].serialNumber).toBe("SN-001");
  });

  it("deve atualizar sensor com sucesso", async () => {
    const area = await criarArea();

    const createRes = await httpJson(baseUrl, "/api/sensors", {
      method: "POST",
      body: {
        ...payloadBaseSensor,
        area_id: area.id,
      },
    });

    const id = createRes.data.id;

    const res = await httpJson(baseUrl, `/api/sensors/${id}`, {
      method: "PUT",
      body: {
           nome: "Sensor Atualizado",
           tipo: "umidade",
           },
    });

    expect(res.status).toBe(200);
    expect(res.data.modelo).toBe("XT-1000");
    expect(res.data.tipo).toBe("umidade");
  });

  it("deve deletar sensor com sucesso", async () => {
    const area = await criarArea();

    const createRes = await httpJson(baseUrl, "/api/sensors", {
      method: "POST",
      body: {
        ...payloadBaseSensor,
        area_id: area.id,
      },
    });

    const id = createRes.data.id;

    const deleteRes = await httpJson(baseUrl, `/api/sensors/${id}`, {
      method: "DELETE",
    });

    expect(deleteRes.status).toBe(204);

    const sensorRepo = appDataSource.getRepository(Sensor);
    const sensor = await sensorRepo.findOneBy({ id });

    expect(sensor).toBeNull();
  });

  it("deve retornar 400 ao criar sensor com serialNumber duplicado", async () => {
    const area = await criarArea();

    await httpJson(baseUrl, "/api/sensors", {
      method: "POST",
      body: {
        ...payloadBaseSensor,
        area_id: area.id,
      },
    });

    const res = await httpJson(baseUrl, "/api/sensors", {
      method: "POST",
      body: {
        ...payloadBaseSensor,
        area_id: area.id,
      },
    });

    expect(res.status).toBe(400);
  });

  it("deve retornar 404 ao criar sensor com area inexistente", async () => {
    const res = await httpJson(baseUrl, "/api/sensors", {
      method: "POST",
      body: {
        ...payloadBaseSensor,
        area_id: "00000000-0000-0000-0000-000000000000",
      },
    });

    expect(res.status).toBe(404);
  });

  it("deve retornar 404 ao atualizar sensor inexistente", async () => {
    const res = await httpJson(
      baseUrl,
      "/api/sensors/00000000-0000-0000-0000-000000000000",
      {
        method: "PUT",
        body: {
          nome: "Novo nome",
        },
      },
    );

    expect(res.status).toBe(404);
  });

  it("deve retornar 404 ao deletar sensor inexistente", async () => {
    const res = await httpJson(
      baseUrl,
      "/api/sensors/00000000-0000-0000-0000-000000000000",
      {
        method: "DELETE",
      },
    );

    expect(res.status).toBe(404);
  });
});