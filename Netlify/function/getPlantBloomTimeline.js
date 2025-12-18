export default async (req) => {
  if (req.method !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { plant } = JSON.parse(req.body);

  const prompt = `
You are a horticulture expert.

Provide bloom timeline data for the plant "${plant}".

Return ONLY valid JSON in this exact format:
{
  "daysToGermination": number,
  "daysToMaturity": number,
  "bloomDuration": number,
  "care": [string, string, string]
}

Rules:
- Use realistic averages for Indian home gardening
- No extra text
- No markdown
`;

  try {
    const response = await fetch(
      'https://api.perplexity.ai/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.perplex_API}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 300
        })
      }
    );

    const data = await response.json();
    const raw = data.choices[0].message.content;

    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);

    return {
      statusCode: 200,
      body: JSON.stringify(json),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI bloom timeline failed' })
    };
  }
};
