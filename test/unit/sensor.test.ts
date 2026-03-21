import { jest } from '@jest/globals';
import type { Sensor } from "../../src/entities/Sensor.js";

jest.unstable_mockModule("bcryptjs", () => ({
    default: {
        hash: jest.fn<(password: string, rounds: number) => Promise<string>>().mockResolvedValue("hashed_password_123")
    }
}));

const mockSensor: Sensor = {
    id: "sensor-id-123",
    serialNumber: "SN12345",
    fabricante: "Fabricante Test",
    modelo: "Modelo X",
    tipo: "Temperatura",
    status: "Ativo",
    ipFixo: "192.168.1.100",
    dataInstalacao: new Date("2024-01-01"),
    dataManutencao: undefined,
    cicloLeitura: 300,
    latitude: -23.5505,
    longitude: -46.6333,
    area: {} as any,
    leituras: []
} as Sensor;

const mockSensorDois: Sensor = {
    id: "sensor-id-456",
    serialNumber: "SN54321",
    fabricante: "Outro Fabricante",
    modelo: "Modelo Y",
    tipo: "Umidade",
    status: "Inativo",
    ipFixo: "192.168.1.101",
    dataInstalacao: new Date("2024-02-15"),
    dataManutencao: new Date("2025-01-10"),
    cicloLeitura: 600,
    latitude: -23.6789,
    longitude: -46.7890,
    area: {} as any,
    leituras: []
} as Sensor;

const sensorAttualizadoMock: Sensor = {
    id: "sensor-id-123",
    serialNumber: "SN12345",
    fabricante: "Fabricante Atualizado",
    modelo: "Modelo X Plus",
    tipo: "Temperatura",
    status: "Manutencao",
    ipFixo: "192.168.1.105",
    dataInstalacao: new Date("2024-01-01"),
    dataManutencao: new Date("2025-03-20"),
    cicloLeitura: 350,
    latitude: -23.5505,
    longitude: -46.6333,
    area: {} as any,
    leituras: []
} as Sensor;

const mockRepository = {
    find: jest.fn<() => Promise<Sensor[]>>().mockResolvedValue([mockSensor, mockSensorDois]),
    findOneBy: jest.fn<(criteria: any) => Promise<Sensor | null>>().mockResolvedValue(mockSensor),
    findOne: jest.fn<(options: any) => Promise<Sensor | null>>().mockResolvedValue(null),
    create: jest.fn<(data: any) => Sensor>().mockReturnValue(mockSensor),
    save: jest.fn<(entity: any) => Promise<Sensor>>().mockResolvedValue(mockSensor),
    merge: jest.fn<(target: any, source: any) => Sensor>().mockReturnValue(sensorAttualizadoMock),
    remove: jest.fn<(entity: any) => Promise<Sensor>>().mockResolvedValue(mockSensor)
};

const mockAreaRepository = {
    findOne: jest.fn<(options: any) => Promise<any>>().mockResolvedValue({ id: "area-id-123", nome: "Área Test" })
};

jest.unstable_mockModule("../../src/database/appDataSource.js", () => ({
    appDataSource: {
        getRepository: jest.fn((entity: any) => {
            if (entity.name === "Area") {
                return mockAreaRepository;
            }
            return mockRepository;
        })
    }
}));

const { default: SensorService } = await import("../../src/services/SensorService.js");

describe("Sensor Unitario", () => {
    let service: InstanceType<typeof SensorService>;

    beforeAll(() => {
        service = new SensorService();
    });

    it("getAllSensors deve retornar todos os sensores", async () => {
        const result = await service.getAllSensors();

        expect(mockRepository.find).toHaveBeenCalled();
        expect(result).toEqual([mockSensor, mockSensorDois]);
    });

    it("getAllSensors deve retornar array vazio quando não há sensores", async () => {
        mockRepository.find.mockResolvedValueOnce([]);

        const result = await service.getAllSensors();

        expect(mockRepository.find).toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it("addSensor deve criar e retornar o novo sensor", async () => {
        mockRepository.findOne.mockResolvedValueOnce(null);

        const result = await service.addSensor({ ...mockSensor, area_id: "area-id-123" });

        expect(mockRepository.findOne).toHaveBeenCalled();
        expect(mockRepository.create).toHaveBeenCalled();
        expect(mockRepository.save).toHaveBeenCalled();
        expect(result).toEqual(mockSensor);
    });

    it("addSensor deve lançar Error quando o sensor já está cadastrado", async () => {
        mockRepository.findOne.mockResolvedValueOnce(mockSensor);

        await expect(service.addSensor({ ...mockSensor, area_id: "area-id-123" })).rejects.toThrow();
        expect(mockRepository.findOne).toHaveBeenCalled();
    });

    it("updateSensor deve atualizar e retornar o sensor modificado", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(mockSensor);
        mockRepository.save.mockResolvedValueOnce(sensorAttualizadoMock);

        const result = await service.updateSensor("sensor-id-123", sensorAttualizadoMock);

        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "sensor-id-123" });
        expect(mockRepository.create).toHaveBeenCalled();
        expect(mockRepository.merge).toHaveBeenCalled();
        expect(mockRepository.save).toHaveBeenCalled();
        expect(result).toEqual(sensorAttualizadoMock);
    });

    it("updateSensor deve lançar Error quando o sensor não existe", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(null);

        await expect(service.updateSensor("sensor-inexistente", sensorAttualizadoMock)).rejects.toThrow();
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "sensor-inexistente" });
    });

    it("deleteSensor deve remover o sensor quando o id existe", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(mockSensor);

        await service.deleteSensor("sensor-id-123");

        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "sensor-id-123" });
        expect(mockRepository.remove).toHaveBeenCalledWith(mockSensor);
    });

    it("deleteSensor deve lançar Error quando o id não existe", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(null);

        await expect(service.deleteSensor("sensor-inexistente")).rejects.toThrow();
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "sensor-inexistente" });
    });
});