import { jest } from '@jest/globals';
import type Pesquisador from "../../src/entities/Pesquisador.js";
import { AppError } from "../../src/errors/AppError.js";

jest.unstable_mockModule("bcryptjs", () => ({
    default: {
        hash: jest.fn<(password: string, rounds: number) => Promise<string>>().mockResolvedValue("hashed_password_123")
    }
}));

const pesquisadoresMock: Pesquisador[] = [
    {
        id: "uuid-1",
        nome: "Rodrigo",
        senha: "hash123",
        especialidade: "Backend",
        email: "rodrigo@email.com",
        titulacao: "Mestre",
        matricula: "2024001",
        linhaPesquisa: "APIs REST",
        dataNascimento: new Date("1990-01-01")
    } as Pesquisador
];

const novoPesquisadorMock: Pesquisador = {
    id: "uuid-2",
    nome: "João",
    senha: "hash456",
    especialidade: "Frontend",
    email: "joao@email.com",
    titulacao: "Doutor",
    matricula: "2024002",
    linhaPesquisa: "React",
    dataNascimento: new Date("1995-05-15")
} as Pesquisador;

const pesquisadorAtualizadoMock: Pesquisador = {
    id: "uuid-1",
    nome: "Rodrigo Silva",
    senha: "hash123",
    especialidade: "FullStack",
    email: "rodrigo@email.com",
    titulacao: "Especialista",
    matricula: "2024001",
    linhaPesquisa: "Microserviços",
    dataNascimento: new Date("1990-01-01")
} as Pesquisador;

const mockRepository = {
    find: jest.fn<() => Promise<Pesquisador[]>>().mockResolvedValue(pesquisadoresMock),
    findOneBy: jest.fn<(criteria: any) => Promise<Pesquisador | null>>().mockResolvedValue(pesquisadoresMock[0]),
    create: jest.fn<(data: any) => Pesquisador>().mockReturnValue(novoPesquisadorMock),
    save: jest.fn<(entity: any) => Promise<Pesquisador>>().mockResolvedValue(novoPesquisadorMock),
    merge: jest.fn<(target: any, source: any) => Pesquisador>().mockReturnValue(pesquisadorAtualizadoMock),
    remove: jest.fn<(entity: any) => Promise<Pesquisador>>().mockResolvedValue(pesquisadoresMock[0])
};

jest.unstable_mockModule("../../src/database/appDataSource.js", () => ({
    appDataSource: {
        getRepository: jest.fn(() => mockRepository)
    }
}));

const { default: PesquisadorService } = await import("../../src/services/PesquisadorService.js");

describe("Pesquisador Unitario", () => {
    let service: InstanceType<typeof PesquisadorService>;

    beforeAll(() => {
        service = new PesquisadorService();
    });

    it("findAll retornar todos os pesquisadores", async () => {
        const result = await service.findAll();

        expect(mockRepository.find).toHaveBeenCalled();
        expect(result).toEqual(pesquisadoresMock);
    });

    it("findAll deve retornar array vazio quando não há pesquisadores", async () => {
        mockRepository.find.mockResolvedValueOnce([]);

        const result = await service.findAll();

        expect(mockRepository.find).toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it("findById deve retornar o pesquisador quando o id existe", async () => {
        const result = await service.findById("uuid-1");

        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-1" });
        expect(result).toEqual(pesquisadoresMock[0]);
    });

    it("findById deve lançar AppError 404 quando o id não existe", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(null);

        await expect(service.findById("uuid-inexistente")).rejects.toThrow(AppError);
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-inexistente" });
    });

    it("create deve criar e retornar o novo pesquisador", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

        const result = await service.create(novoPesquisadorMock);

        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: novoPesquisadorMock.email });
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ matricula: novoPesquisadorMock.matricula });
        expect(mockRepository.create).toHaveBeenCalled();
        expect(mockRepository.save).toHaveBeenCalled();
        expect(result).toEqual(novoPesquisadorMock);
    });

    it("create deve lançar AppError 400 quando o e-mail já está cadastrado", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(pesquisadoresMock[0]);

        await expect(service.create(novoPesquisadorMock)).rejects.toThrow(AppError);
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: novoPesquisadorMock.email });
    });

    it("create deve lançar AppError 400 quando a matrícula já está cadastrada", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(null).mockResolvedValueOnce(pesquisadoresMock[0]);

        await expect(service.create(novoPesquisadorMock)).rejects.toThrow(AppError);
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: novoPesquisadorMock.email });
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ matricula: novoPesquisadorMock.matricula });
    });

    it("create deve aplicar hash na senha antes de salvar", async () => {
        const { default: bcrypt } = await import("bcryptjs");
        mockRepository.findOneBy.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

        await service.create(novoPesquisadorMock);

        expect(bcrypt.hash).toHaveBeenCalledWith(novoPesquisadorMock.senha, 10);
        expect(mockRepository.save).toHaveBeenCalled();
    });

    it("update deve atualizar e retornar o pesquisador modificado", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(pesquisadoresMock[0]);
        mockRepository.save.mockResolvedValueOnce(pesquisadorAtualizadoMock);

        const result = await service.update("uuid-1", pesquisadorAtualizadoMock);

        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-1" });
        expect(mockRepository.create).toHaveBeenCalled();
        expect(mockRepository.merge).toHaveBeenCalled();
        expect(mockRepository.save).toHaveBeenCalled();
        expect(result).toEqual(pesquisadorAtualizadoMock);
    });

    it("update deve lançar AppError 404 quando o pesquisador não existe", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(null);

        await expect(service.update("uuid-inexistente", pesquisadorAtualizadoMock)).rejects.toThrow(AppError);
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-inexistente" });
    });

    it("delete deve remover o pesquisador quando o id existe", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(pesquisadoresMock[0]);

        await service.delete("uuid-1");

        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-1" });
        expect(mockRepository.remove).toHaveBeenCalledWith(pesquisadoresMock[0]);
    });

    it("delete deve lançar AppError 404 quando o id não existe", async () => {
        mockRepository.findOneBy.mockResolvedValueOnce(null);

        await expect(service.delete("uuid-inexistente")).rejects.toThrow(AppError);
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: "uuid-inexistente" });
    });
});
