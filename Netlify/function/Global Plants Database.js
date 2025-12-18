export default async (req) => {
  const { plant, month, region, climate } = await req.json();

  const prompt = `You are a horticulture expert specializing in home gardening.

You will be given:
1. Structured plant data from a verified database
2. User-selected growing conditions

Your task is to ENHANCE the given plant data.
Do NOT invent new plants.
Do NOT change factual attributes.
Do NOT suggest plants outside the provided list.

Context:
User Location: ${region}
User Month: ${month}
User Climate Preference: ${climate || 'Moderate'}

Plant Data:
Name: ${plant.name}
Sunlight: ${plant.sunlight || plant['Sunlight Needs'] || 'Not specified'}
Soil: ${plant.soil || plant['Soil Requirements'] || 'Not specified'}
Growing Months: ${plant.months || plant['Growing Months'] || 'Not specified'}
Bloom Time: ${plant.bloom_time || plant['Bloom and Harvest Time'] || 'Not specified'}
Care Notes: ${plant.care || plant['Care Instructions'] || 'Not specified'}

Instructions:
1. Explain WHY this plant is suitable or not suitable for the given month and region
2. Assign a suitability score (High / Medium / Low)
3. Provide ONE expert planting tip
4. Provide ONE common mistake to avoid
5. Suggest ideal pot size (if applicable for home gardening)

Return ONLY valid JSON in the following schema:
{
  "suitability": "High | Medium | Low",
  "reason": "string (2-3 sentences explaining suitability)",
  "expert_tip": "string (actionable single tip)",
  "common_mistake": "string (one mistake to avoid)",
  "recommended_pot_size": "string (e.g., '8-10 inches')"
}`;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.perplex_API}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const enrichedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        plant_name: plant.name,
        month: month,
        region: region,
        enrichment: enrichedData
      })
    };
  } catch (error) {
    console.error('AI Enrichment Error:', error);
    
    // Return fallback response without AI enrichment
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        plant_name: plant.name,
        fallback: {
          suitability: "Medium",
          reason: "Unable to fetch AI enrichment. Please try again.",
          expert_tip: "Ensure proper soil drainage and sunlight.",
          common_mistake: "Overwatering without checking soil moisture.",
          recommended_pot_size: "8-10 inches"
        }
      })
    };
  }

  return new Response(await response.text(), {
    headers: { "Content-Type": "application/json" }
  });
};
