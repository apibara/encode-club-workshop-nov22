import { AppDataSource } from "./data-source";

async function main() {
  await AppDataSource.initialize();
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
