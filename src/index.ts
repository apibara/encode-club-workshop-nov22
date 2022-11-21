import { AppDataSource } from "./data-source";
import { AppIndexer } from "./indexer";
import express, { Request, Response } from "express";
import { hexToBuffer } from "@apibara/protocol";
import { Token } from "./entities";

async function main() {
  await AppDataSource.initialize();

  const indexer = new AppIndexer(
    "encode-club-workshop",
    "goerli.starknet.stream.apibara.com"
  );

  const app = express();

  app.get("/account/:address", async (req: Request, resp: Response) => {
    const { address } = req.params;
    const owner = hexToBuffer(address, 32);
    const tokens = await AppDataSource.manager.findBy(Token, { owner });
    resp.json({
      address: address,
      tokens: tokens.map((t) => t.toJson()),
    });
  });

  app.listen(8080, () => {
    console.log("Server is running at localhost:8080");
  });

  await indexer.run();
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
