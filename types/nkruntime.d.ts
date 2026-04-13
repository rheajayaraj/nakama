declare namespace nkruntime {
  interface Context {}
  interface Logger {
    info(message: string): void;
  }
  interface Nakama {
    binaryToString(data: ArrayBuffer): string;
    stringToBinary(data: string): ArrayBuffer;
  }
  interface MatchDispatcher {
    broadcastMessage(opCode: number, data: ArrayBuffer): void;
  }
  interface Presence {
    userId: string;
  }
  interface MatchMessage {
    data: ArrayBuffer;
    sender: Presence;
  }
  interface Initializer {
    registerMatch(name: string, match: any): void;
  }
}
