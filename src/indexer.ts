import { credentials, NodeClient, proto } from "@apibara/protocol";

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

  async handleData(data: proto.StreamMessagesResponse__Output) {
    console.log(data);
  }
}
