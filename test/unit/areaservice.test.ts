import { jest } from '@jest/globals';
import type Area from "../../src/entities/Area.js";

const areasMock: Area[] = [
    {
        id: "uuid-1",
        nome: "Área de Proteção Ambiental",
        descricao: "Floresta tropical protegida",
        bioma: "Amazônia",
        latitude: -3.119028,
        longitude: -60.021731,
        largura: 100.5,
        comprimento: 150.75,
        relevo: "Montanhoso",
        sensores: []
    } as Area
];

const novaAreaMock: Area = {
    id: "uuid-2",
    nome: "Área de Cerrado",
    descricao: "Área de conservação de cerrado",
    bioma: "Cerrado",
    latitude: -15.789456,
    longitude: -47.879123,
    largura: 200.0,
    comprimento: 250.5,
    relevo: "Plano",
    sensores: []
} as Area;

const areaAtualizadaMock: Area = {
    id: "uuid-1",
    nome: "Área de Proteção Ambiental Atualizada",
    descricao: "Floresta tropical protegida com novos sensores",
    bioma: "Amazônia",
    latitude: -3.119028,
    longitude: -60.021731,
    largura: 120.5,
    comprimento: 180.75,
    relevo: "Montanhoso",
    sensores: []
} as Area;

const mockRepository = {
    find: jest.fn<() => Promise<Area[]>>().mockResolvedValue(areasMock),
    findOne: jest.fn<(options: any) => Promise<Area | null>>().mockResolvedValue(areasMock[0]),
    findOneBy: jest.fn<(criteria: any) => Promise<Area | null>>().mockResolvedValue(areasMock[0]),
    create: jest.fn<(data: any) => Area>().mockReturnValue(novaAreaMock),
    save: jest.fn<(entity: any) => Promise<Area>>().mockResolvedValue(novaAreaMock),
    merge: jest.fn<(target: any, source: any) => Area>().mockReturnValue(areaAtualizadaMock),
    remove: jest.fn<(entity: any) => Promise<Area>>().mockResolvedValue(areasMock[0])
};

jest.unstable_mockModule("../../src/database/appDataSource.js", () => ({
    appDataSource: {
        getRepository: jest.fn(() => mockRepository)
    }
}));

const { default: AreaService } = await import("../../src/services/AreaService.js");

describe("Área Unitário", () => {
    let service: InstanceType<typeof AreaService>;

    beforeAll(() => {
        service = new AreaService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("findAll", () => {
        it("deve retornar todas as áreas com sensores relacionados", async () => {
            const result = await service.findAll();

            expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['sensores'] });
            expect(result).toEqual(areasMock);
        });

        it("deve retornar array vazio quando não há áreas cadastradas", async () => {
            mockRepository.find.mockResolvedValueOnce([]);

            const result = await service.findAll();

            expect(mockRepository.find).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe("findById", () => {
        it("deve retornar a área quando o id existe", async () => {
            mockRepository.findOne.mockResolvedValueOnce(areasMock[0]);

            const result = await service.findById("uuid-1");

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: "uuid-1" },
                relations: ['sensores']
            });
            expect(result).toEqual(areasMock[0]);
        });

        it("deve fazer trim no id antes de buscar", async () => {
            mockRepository.findOne.mockResolvedValueOnce(areasMock[0]);

            await service.findById("  uuid-1  ");

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: "uuid-1" },
                relations: ['sensores']
            });
        });

        it("deve lançar Error quando o id não existe", async () => {
            mockRepository.findOne.mockResolvedValueOnce(null);

            await expect(service.findById("uuid-inexistente")).rejects.toThrow("Área não encontrada");
            expect(mockRepository.findOne).toHaveBeenCalled();
        });
    });

    describe("create", () => {
        it("deve criar e retornar a nova área", async () => {
            mockRepository.create.mockReturnValueOnce(novaAreaMock);
            mockRepository.save.mockResolvedValueOnce(novaAreaMock);

            const result = await service.create(novaAreaMock);

            expect(mockRepository.create).toHaveBeenCalledWith(novaAreaMock);
            expect(mockRepository.save).toHaveBeenCalled();
            expect(result).toEqual(novaAreaMock);
        });

        it("deve criar uma área com todos os campos preenchidos", async () => {
            const areaCompleta: Area = {
                id: "uuid-3",
                nome: "Área de Teste",
                descricao: "Descrição de teste",
                bioma: "Caatinga",
                latitude: -5.123456,
                longitude: -38.654321,
                largura: 50.0,
                comprimento: 75.5,
                relevo: "Plano",
                sensores: []
            } as Area;

            mockRepository.create.mockReturnValueOnce(areaCompleta);
            mockRepository.save.mockResolvedValueOnce(areaCompleta);

            const result = await service.create(areaCompleta);

            expect(mockRepository.create).toHaveBeenCalledWith(areaCompleta);
            expect(result).toEqual(areaCompleta);
        });
    });

    describe("update", () => {
        it("deve atualizar e retornar a área modificada", async () => {
            mockRepository.findOneBy.mockResolvedValueOnce(areasMock[0]);
            mockRepository.merge.mockReturnValueOnce(areaAtualizadaMock);
            mockRepository.save.mockResolvedValueOnce(areaAtualizadaMock);

            const result = await service.update("uuid-1", areaAtualizadaMock);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-1" });
            expect(mockRepository.merge).toHaveBeenCalledWith(areasMock[0], areaAtualizadaMock);
            expect(mockRepository.save).toHaveBeenCalled();
            expect(result).toEqual(areaAtualizadaMock);
        });

        it("deve permitir atualização parcial dos campos", async () => {
            const areaPartialUpdate: Partial<Area> = {
                nome: "Novo Nome",
                largura: 250.0
            };

            mockRepository.findOneBy.mockResolvedValueOnce(areasMock[0]);
            mockRepository.merge.mockReturnValueOnce({ ...areasMock[0], ...areaPartialUpdate } as Area);
            mockRepository.save.mockResolvedValueOnce({ ...areasMock[0], ...areaPartialUpdate } as Area);

            const result = await service.update("uuid-1", areaPartialUpdate);

            expect(mockRepository.merge).toHaveBeenCalledWith(areasMock[0], areaPartialUpdate);
            expect(result.nome).toEqual("Novo Nome");
            expect(result.largura).toEqual(250.0);
        });

        it("deve lançar Error quando a área não existe", async () => {
            mockRepository.findOneBy.mockResolvedValueOnce(null);

            await expect(service.update("uuid-inexistente", areaAtualizadaMock)).rejects.toThrow("Área não encontrada");
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-inexistente" });
        });
    });

    describe("delete", () => {
        it("deve deletar a área quando existir", async () => {
            mockRepository.findOneBy.mockResolvedValueOnce(areasMock[0]);
            mockRepository.remove.mockResolvedValueOnce(areasMock[0]);

            await service.delete("uuid-1");

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-1" });
            expect(mockRepository.remove).toHaveBeenCalledWith(areasMock[0]);
        });

        it("deve lançar Error quando tenta deletar uma área que não existe", async () => {
            mockRepository.findOneBy.mockResolvedValueOnce(null);

            await expect(service.delete("uuid-inexistente")).rejects.toThrow("Área não encontrada");
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-inexistente" });
            expect(mockRepository.remove).not.toHaveBeenCalled();
        });
    });
});
