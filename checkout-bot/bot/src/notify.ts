import { config } from './config.js';

/**
 * Success notifier. Real bots ping a Discord/Telegram channel ("checkout
 * succeeded") so the operator can complete payment fast. Falls back to console.
 */
export async function notify(message: string): Promise<void> {
  const { telegramToken, telegramChatId, discordWebhook } = config.notify;

  console.log(`[notify] ${message}`);

  try {
    if (telegramToken && telegramChatId) {
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId, text: message }),
      });
    }
    if (discordWebhook) {
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
    }
  } catch (err) {
    console.warn('[notify] failed to send remote notification:', err);
  }
}
