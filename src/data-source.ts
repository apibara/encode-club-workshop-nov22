import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "workshop",
  password: "workshop",
  database: "workshop",
  synchronize: true,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});
