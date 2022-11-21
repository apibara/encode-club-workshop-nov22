import {
  credentials,
  NodeClient,
  proto,
  hexToBuffer,
  bufferToHex,
} from "@apibara/protocol";
import { Block, Transaction, TransactionReceipt } from "@apibara/starknet";
import BN from "bn.js";
import { getSelectorFromName } from "starknet/dist/utils/hash";

const BRIQ_DEPLOY_BLOCK = 180_000;
const BRIQ_ADDRESS = hexToBuffer(
  "0x0266b1276d23ffb53d99da3f01be7e29fa024dd33cd7f7b1eb7a46c67891c9d0",
  32
);
const TRANSFER_KEY = hexToBuffer(getSelectorFromName("Transfer"), 32);

export class AppIndexer {
  private readonly client: NodeClient;
  private readonly indexerId: string;

  constructor(indexerId: string, url: string) {
    this.indexerId = indexerId;
    this.client = new NodeClient(url, credentials.createSsl());
  }

  async run() {
    const messages = this.client.streamMessages({
      startingSequence: BRIQ_DEPLOY_BLOCK,
    });

    messages.on("data", this.handleData.bind(this));

    // keep running until the stream finishes
    return new Promise((resolve, reject) => {
      messages.on("end", resolve);
      messages.on("error", reject);
    });
  }

  async handleData(message: proto.StreamMessagesResponse__Output) {
    if (message.data) {
      if (!message.data.data.value) {
        throw new Error("received invalid data");
      }
      const block = Block.decode(message.data.data.value);
      await this.handleBlock(block);
    } else if (message.invalidate) {
      console.log(message.invalidate);
    }
  }

  async handleBlock(block: Block) {
    console.log("Block");
    console.log(`    hash: ${bufferToHex(new Buffer(block.blockHash.hash))}`);
    console.log(`  number: ${block.blockNumber}`);
    console.log(`    time: ${block.timestamp.toISOString()}`);

    console.log("  transfers");
    for (let receipt of block.transactionReceipts) {
      const tx = block.transactions[receipt.transactionIndex];
      await this.handleTransaction(tx, receipt);
    }
  }

  async handleTransaction(tx: Transaction, receipt: TransactionReceipt) {
    for (let event of receipt.events) {
      if (!BRIQ_ADDRESS.equals(event.fromAddress)) {
        continue;
      }
      if (!TRANSFER_KEY.equals(event.keys[0])) {
        continue;
      }

      const senderAddress = Buffer.from(event.data[0]);
      const recipientAddress = Buffer.from(event.data[1]);
      const tokenId = uint256FromBytes(
        Buffer.from(event.data[2]),
        Buffer.from(event.data[3])
      );

      console.log(
        `    ${bufferToHex(senderAddress)} -> ${bufferToHex(recipientAddress)}`
      );
      console.log(`      ${tokenId.toString()}`);
    }
  }
}

function uint256FromBytes(low: Buffer, high: Buffer): BN {
  const lowB = new BN(low);
  const highB = new BN(high);
  return highB.shln(128).add(lowB);
}
