import { MessageHandler } from './types';

export class DailyUpdateHandler implements MessageHandler {
  getMessage(): string {
    const today = new Date();
    return `Good morning! Today is ${today.toLocaleDateString(
      'ko-KR'
    )}. Have a great day! 🌞`;
  }

  getCronPattern(): string {
    return '0 10 * * 1-5'; // Every weekday at 9 AM
  }

  getTargetChannels(): string[] {
    return ['slack-전체']; // Specific channels for daily updates
  }
}
