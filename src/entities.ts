import { bufferToHex } from "@apibara/protocol";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class State {
  @PrimaryColumn()
  indexerId: string;

  @Column()
  sequence: number;
}

@Entity()
export class Token {
  @PrimaryColumn({ type: "bytea" })
  id: Buffer;

  @Column({ type: "bytea" })
  owner: Buffer;

  toJson() {
    return {
      id: bufferToHex(this.id),
      owner: bufferToHex(this.owner),
    };
  }
}

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "bytea" })
  sender: Buffer;

  @Column({ type: "bytea" })
  recipient: Buffer;

  @Column({ type: "bytea" })
  tokenId: Buffer;

  toJson() {
    return {
      sender: bufferToHex(this.sender),
      recipient: bufferToHex(this.recipient),
      tokenId: bufferToHex(this.tokenId),
    };
  }
}
