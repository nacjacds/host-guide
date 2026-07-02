const YCLOUD_API_BASE = "https://api.ycloud.com/v2";

export async function sendWhatsAppMessage(to: string, text: string) {
  const response = await fetch(`${YCLOUD_API_BASE}/whatsapp/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.YCLOUD_API_KEY!,
    },
    body: JSON.stringify({
      from: process.env.YCLOUD_WHATSAPP_NUMBER,
      to,
      type: "text",
      text: { body: text },
    }),
  });

  if (!response.ok) {
    throw new Error(`YCloud API error: ${response.status}`);
  }

  return response.json();
}

export interface YCloudInboundWebhook {
  type: string;
  whatsappInboundMessage?: {
    from: string;
    text?: { body: string };
  };
}
