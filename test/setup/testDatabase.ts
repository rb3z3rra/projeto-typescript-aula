import { appDataSource } from "../../src/database/appDataSource.js";
import Pesquisador from "../../src/entities/Pesquisador.js";

export async function initTestDatabase() {
  if (!appDataSource.isInitialized) {
    await appDataSource.initialize();
  }
}

export async function clearDatabase() {
  if (!appDataSource.isInitialized) return;

  await appDataSource
    .createQueryBuilder()
    .delete()
    .from(Pesquisador)
    .execute();
}

export async function closeTestDatabase() {
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
  }
}