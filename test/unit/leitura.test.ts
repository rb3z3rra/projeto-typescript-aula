import { jest } from '@jest/globals';
import type Leitura from "../../src/entities/Leitura.js";
import type { Sensor } from "../../src/entities/Sensor.js";
import type { CreateLeituraDTO } from "../../src/types/createLeituraDTO.js";

const sensorMock: Sensor = {
    id: "sensor-uuid-1",
    serialNumber: "SN-001",
    fabricante: "SensorCorp",
    modelo: "TH-100",
    tipo: "Temperatura",
    status: "Ativo",
    dataInstalacao: new Date("2024-01-15"),
    cicloLeitura: 300,
    latitude: -3.119028,
    longitude: -60.021731,
    area: {} as any,
    leituras: []
} as Sensor;

const leiturasMock: Leitura[] = [
    {
        id: "uuid-1",
        umidade: 75.5,
        temperatura: 28.3,
        dataHora: new Date("2024-03-20T10:30:00"),
        sensor: sensorMock
    } as Leitura
];

const novaLeituraMock: Leitura = {
    id: "uuid-2",
    umidade: 82.1,
    temperatura: 26.5,
    dataHora: new Date(),
    sensor: sensorMock
} as Leitura;

const leituraAtualizadaMock: Leitura = {
    id: "uuid-1",
    umidade: 78.9,
    temperatura: 29.1,
    dataHora: new Date("2024-03-20T10:30:00"),
    sensor: sensorMock
} as Leitura;

const mockLeituraRepository = {
    find: jest.fn<() => Promise<Leitura[]>>().mockResolvedValue(leiturasMock),
    findOneBy: jest.fn<(criteria: any) => Promise<Leitura | null>>().mockResolvedValue(leiturasMock[0]),
    create: jest.fn<(data: any) => Leitura>().mockReturnValue(novaLeituraMock),
    save: jest.fn<(entity: any) => Promise<Leitura>>().mockResolvedValue(novaLeituraMock),
    merge: jest.fn<(target: any, source: any) => Leitura>().mockReturnValue(leituraAtualizadaMock),
    remove: jest.fn<(entity: any) => Promise<Leitura>>().mockResolvedValue(leiturasMock[0]),
    createQueryBuilder: jest.fn()
};

const mockSensorRepository = {
    findOne: jest.fn<(options: any) => Promise<Sensor | null>>().mockResolvedValue(sensorMock),
    findOneBy: jest.fn<(criteria: any) => Promise<Sensor | null>>().mockResolvedValue(sensorMock),
    find: jest.fn<() => Promise<Sensor[]>>().mockResolvedValue([sensorMock])
};

jest.unstable_mockModule("../../src/database/appDataSource.js", () => ({
    appDataSource: {
        getRepository: jest.fn((entity: any) => {
            if (entity.name === "Leitura") {
                return mockLeituraRepository;
            }
            return mockSensorRepository;
        })
    }
}));

const { default: LeituraService } = await import("../../src/services/LeituraService.js");

describe("Leitura Unitário", () => {
    let service: InstanceType<typeof LeituraService>;

    beforeAll(() => {
        service = new LeituraService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("findAll", () => {
        it("deve retornar todas as leituras com sensores relacionados", async () => {
            const result = await service.findAll();

            expect(mockLeituraRepository.find).toHaveBeenCalledWith({
                relations: {
                    sensor: true
                }
            });
            expect(result).toEqual(leiturasMock);
        });

        it("deve retornar array vazio quando não há leituras cadastradas", async () => {
            mockLeituraRepository.find.mockResolvedValueOnce([]);

            const result = await service.findAll();

            expect(mockLeituraRepository.find).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe("findById", () => {
        it("deve retornar a leitura quando o id existe", async () => {
            mockLeituraRepository.findOneBy.mockResolvedValueOnce(leiturasMock[0]);

            const result = await service.findById("uuid-1");

            expect(mockLeituraRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-1" });
            expect(result).toEqual(leiturasMock[0]);
        });

        it("deve lançar Error quando o id não existe", async () => {
            mockLeituraRepository.findOneBy.mockResolvedValueOnce(null);

            await expect(service.findById("uuid-inexistente")).rejects.toThrow("Leitura não encontrada");
            expect(mockLeituraRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-inexistente" });
        });
    });

    describe("create", () => {
        it("deve criar e retornar a nova leitura quando o sensor existe", async () => {
            const createLeituraDTO: CreateLeituraDTO = {
                umidade: 82.1,
                temperatura: 26.5,
                sensor_id: "sensor-uuid-1"
            };

            mockSensorRepository.findOne.mockResolvedValueOnce(sensorMock);
            mockLeituraRepository.create.mockReturnValueOnce(novaLeituraMock);
            mockLeituraRepository.save.mockResolvedValueOnce(novaLeituraMock);

            const result = await service.create(createLeituraDTO);

            expect(mockSensorRepository.findOne).toHaveBeenCalledWith({
                where: { id: "sensor-uuid-1" }
            });
            expect(mockLeituraRepository.create).toHaveBeenCalled();
            expect(mockLeituraRepository.save).toHaveBeenCalled();
            expect(result).toEqual(novaLeituraMock);
        });

        it("deve lançar Error quando o sensor não existe", async () => {
            const createLeituraDTO: CreateLeituraDTO = {
                umidade: 82.1,
                temperatura: 26.5,
                sensor_id: "sensor-inexistente"
            };

            mockSensorRepository.findOne.mockResolvedValueOnce(null);

            await expect(service.create(createLeituraDTO)).rejects.toThrow("Sensor não foi encontrado!");
            expect(mockSensorRepository.findOne).toHaveBeenCalledWith({
                where: { id: "sensor-inexistente" }
            });
            expect(mockLeituraRepository.create).not.toHaveBeenCalled();
        });

        it("deve criar uma leitura com valores válidos de temperatura e umidade", async () => {
            const createLeituraDTO: CreateLeituraDTO = {
                umidade: 95.5,
                temperatura: 35.2,
                sensor_id: "sensor-uuid-1"
            };

            mockSensorRepository.findOne.mockResolvedValueOnce(sensorMock);
            mockLeituraRepository.create.mockReturnValueOnce(novaLeituraMock);
            mockLeituraRepository.save.mockResolvedValueOnce(novaLeituraMock);

            const result = await service.create(createLeituraDTO);

            expect(result).toEqual(novaLeituraMock);
            expect(mockLeituraRepository.save).toHaveBeenCalled();
        });
    });

    describe("update", () => {
        it("deve atualizar e retornar a leitura modificada", async () => {
            mockLeituraRepository.findOneBy.mockResolvedValueOnce(leiturasMock[0]);
            mockLeituraRepository.create.mockReturnValueOnce(leituraAtualizadaMock);
            mockLeituraRepository.merge.mockReturnValueOnce(leituraAtualizadaMock);
            mockLeituraRepository.save.mockResolvedValueOnce(leituraAtualizadaMock);

            const result = await service.update("uuid-1", leituraAtualizadaMock);

            expect(mockLeituraRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-1" });
            expect(mockLeituraRepository.create).toHaveBeenCalled();
            expect(mockLeituraRepository.merge).toHaveBeenCalled();
            expect(mockLeituraRepository.save).toHaveBeenCalled();
            expect(result).toEqual(leituraAtualizadaMock);
        });

        it("deve permitir atualização dos valores de temperatura e umidade", async () => {
            const leituraAtualizada: Leitura = {
                id: "uuid-1",
                umidade: 65.0,
                temperatura: 22.5,
                dataHora: new Date(),
                sensor: sensorMock
            } as Leitura;

            mockLeituraRepository.findOneBy.mockResolvedValueOnce(leiturasMock[0]);
            mockLeituraRepository.create.mockReturnValueOnce(leituraAtualizada);
            mockLeituraRepository.merge.mockReturnValueOnce(leituraAtualizada);
            mockLeituraRepository.save.mockResolvedValueOnce(leituraAtualizada);

            const result = await service.update("uuid-1", leituraAtualizada);

            expect(result.umidade).toEqual(65.0);
            expect(result.temperatura).toEqual(22.5);
        });

        it("deve lançar Error quando a leitura não existe", async () => {
            mockLeituraRepository.findOneBy.mockResolvedValueOnce(null);

            await expect(service.update("uuid-inexistente", leituraAtualizadaMock)).rejects.toThrow("Leitura não encontrada");
            expect(mockLeituraRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-inexistente" });
        });
    });

    describe("delete", () => {
        it("deve deletar a leitura quando existir", async () => {
            mockLeituraRepository.findOneBy.mockResolvedValueOnce(leiturasMock[0]);
            mockLeituraRepository.remove.mockResolvedValueOnce(leiturasMock[0]);

            await service.delete("uuid-1");

            expect(mockLeituraRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-1" });
            expect(mockLeituraRepository.remove).toHaveBeenCalledWith(leiturasMock[0]);
        });

        it("deve lançar Error quando tenta deletar uma leitura que não existe", async () => {
            mockLeituraRepository.findOneBy.mockResolvedValueOnce(null);

            await expect(service.delete("uuid-inexistente")).rejects.toThrow("Leitura não encontrada");
            expect(mockLeituraRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-inexistente" });
            expect(mockLeituraRepository.remove).not.toHaveBeenCalled();
        });
    });
});
