import { AppDataSource } from "./data-source";
import { AppIndexer } from "./indexer";

async function main() {
  await AppDataSource.initialize();

  const indexer = new AppIndexer(
    "encode-club-workshop",
    "goerli.starknet.stream.apibara.com"
  );

  await indexer.run();
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
