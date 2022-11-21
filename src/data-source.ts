import "reflect-metadata";
import { DataSource } from "typeorm";
import { State, Token, Transfer } from "./entities";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "workshop",
  password: "workshop",
  database: "workshop",
  synchronize: true,
  logging: false,
  entities: [State, Transfer, Token],
  migrations: [],
  subscribers: [],
});
