export interface ScheduledMessage {
  cronPattern: string;
  message: string;
  channelNames?: string[];
}

export interface MessageHandler {
  getMessage(): string;
  getCronPattern(): string;
  getTargetChannels(): string[] | undefined;
}
