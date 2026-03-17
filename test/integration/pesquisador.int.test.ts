import { createApp } from "../../src/app.js";
import Pesquisador from "../../src/entities/Pesquisador.js";
import { appDataSource } from "../../src/database/appDataSource.js";
import { startServer, httpJson } from "../setup/httpClient.js";
import {
  initTestDatabase,
  clearDatabase,
  closeTestDatabase,
} from "../setup/testDatabase.js";

describe("Integração: Pesquisador", () => {
  let server: Awaited<ReturnType<typeof startServer>>;
  let baseUrl: string;

  const payloadValido = {
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

  it("deve criar pesquisador com sucesso", async () => {
    const res = await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadValido,
    });

    expect(res.status).toBe(201);
    expect(res.data).toBeTruthy();
    expect(res.data.nome).toBe(payloadValido.nome);
    expect(res.data.email).toBe(payloadValido.email);
    expect(res.data.matricula).toBe(payloadValido.matricula);

    const repository = appDataSource.getRepository(Pesquisador);
    const pesquisadorSalvo = await repository.findOneBy({
      email: payloadValido.email,
    });

    expect(pesquisadorSalvo).toBeTruthy();
    expect(pesquisadorSalvo?.senha).not.toBe(payloadValido.senha);
  });

  it("deve listar pesquisadores", async () => {
    await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadValido,
    });

    const res = await httpJson(baseUrl, "/api/pesquisador");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBe(1);
    expect(res.data[0].email).toBe(payloadValido.email);
  });

  it("deve buscar pesquisador por id", async () => {
    const createRes = await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadValido,
    });

    const id = createRes.data.id;

    const res = await httpJson(baseUrl, `/api/pesquisador/${id}`);

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(id);
    expect(res.data.email).toBe(payloadValido.email);
  });

  it("deve atualizar pesquisador", async () => {
    const createRes = await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadValido,
    });

    const id = createRes.data.id;

    const res = await httpJson(baseUrl, `/api/pesquisador/${id}`, {
      method: "PUT",
      body: {
        nome: "Daniel Atualizado",
        especialidade: "Automação",
      },
    });

    expect(res.status).toBe(200);
    expect(res.data.nome).toBe("Daniel Atualizado");
    expect(res.data.especialidade).toBe("Automação");
  });

  it("deve deletar pesquisador", async () => {
    const createRes = await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadValido,
    });

    const id = createRes.data.id;

    const deleteRes = await httpJson(baseUrl, `/api/pesquisador/${id}`, {
      method: "DELETE",
    });

    expect(deleteRes.status).toBe(204);

    const repository = appDataSource.getRepository(Pesquisador);
    const pesquisador = await repository.findOneBy({ id });

    expect(pesquisador).toBeNull();
  });

  it("deve retornar 400 ao criar pesquisador duplicado", async () => {
    await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadValido,
    });

    const res = await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: payloadValido,
    });

    expect(res.status).toBe(400);
  });

  it("deve retornar 404 ao buscar pesquisador inexistente", async () => {
    const res = await httpJson(
      baseUrl,
      "/api/pesquisador/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
  });

  it("deve retornar 400 ao criar pesquisador com body inválido", async () => {
    const res = await httpJson(baseUrl, "/api/pesquisador", {
      method: "POST",
      body: {
        nome: "",
        email: "email-invalido",
        senha: "123",
      },
    });

    expect(res.status).toBe(400);
  });
});