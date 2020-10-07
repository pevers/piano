import { Key } from "./Piano";

export class KeyBuffer {
  private size: number;
  private buffer: { key: Key; played: number }[];

  constructor(size: number) {
    this.size = size;
    this.buffer = [];
  }
}
