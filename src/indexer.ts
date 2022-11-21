import {
  credentials,
  NodeClient,
  proto,
  hexToBuffer,
  bufferToHex,
} from "@apibara/protocol";
import { Block } from "@apibara/starknet";

const BRIQ_DEPLOY_BLOCK = 180_000;

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
  }
}
