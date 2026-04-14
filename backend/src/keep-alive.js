import cron from 'node-cron';

export function startKeepAlive() {
  const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL;
  if (!KEEP_ALIVE_URL) return;

  cron.schedule('*/14 * * * *', async () => {
    try {
      const res = await fetch(KEEP_ALIVE_URL);
      console.log(`[keep-alive] Pinged at ${new Date().toISOString()} — ${res.status}`);
    } catch (err) {
      console.error(`[keep-alive] Failed:`, err.message);
    }
  });

  console.log('[keep-alive] Scheduled every 14 min, 24/7');
}
