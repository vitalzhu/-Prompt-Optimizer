export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SILICONFLOW_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  const { messages } = req.body;

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3", // Using DeepSeek V3 via SiliconFlow
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`SiliconFlow API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('API Request Failed:', error);
    return res.status(500).json({ error: 'Failed to generate prompt', details: error.message });
  }
}