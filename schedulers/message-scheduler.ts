import cron from 'node-cron';
import type { App } from '@slack/bolt';
import { DailyUpdateHandler } from './messages/daily-update';
import { MinuteReminderHandler } from './messages/minute-reminder';
import type { MessageHandler } from './messages/types';

export const initializeScheduler = async (app: App) => {
  // Define message handlers
  const messageHandlers: MessageHandler[] = [
    new DailyUpdateHandler(),
    new MinuteReminderHandler(),
  ];

  try {
    // Get list of all channels the bot has access to
    const result = await app.client.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
    });

    const channels = result.channels || [];
    const accessibleChannels = channels.filter((channel) => channel.is_member);
    const channelMap = new Map(
      channels.map((channel) => [channel.name, channel])
    );

    // Set up each message handler
    messageHandlers.forEach((handler) => {
      cron.schedule(handler.getCronPattern(), async () => {
        try {
          const targetChannelNames = handler.getTargetChannels();
          const targetChannels = targetChannelNames
            ? targetChannelNames
                .map((name) => channelMap.get(name))
                .filter(Boolean)
            : accessibleChannels;

          const message = handler.getMessage();

          for (const channel of targetChannels) {
            if (!channel?.id) continue;

            try {
              await app.client.chat.postMessage({
                channel: channel.id,
                text: message,
              });
              app.logger.info(`Scheduled message sent to #${channel.name}`);
            } catch (error) {
              app.logger.error(
                `Failed to send message to #${channel.name}:`,
                error
              );
            }
          }
        } catch (error) {
          app.logger.error('Error sending scheduled messages:', error);
        }
      });

      // Log setup information
      const targetDesc = handler.getTargetChannels()
        ? `specific channels: ${handler.getTargetChannels()?.join(', ')}`
        : `all accessible channels: ${accessibleChannels
            .map((c) => c.name)
            .join(', ')}`;

      app.logger.info(
        `Scheduled message set up for pattern: ${handler.getCronPattern()}`
      );
      app.logger.info(`Will send to ${targetDesc}`);
    });
  } catch (error) {
    app.logger.error('Error initializing scheduler:', error);
  }
};
