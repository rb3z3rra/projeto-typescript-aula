import "reflect-metadata";
import dotenv from "dotenv";

import { appDataSource } from "./database/appDataSource.js";
import { createApp } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 6060;

const app = createApp();

appDataSource.initialize()
  .then(() => {
    console.log("Conectou com o banco!");

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });