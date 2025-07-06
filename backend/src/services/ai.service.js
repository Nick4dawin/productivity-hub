const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analyzeJournalEntry = async (content, mood, energy, activities) => {
  try {
    let prompt = `As an empathetic AI counselor, analyze this journal entry and provide insights.
    Journal Entry: "${content}"`;

    if (mood) prompt += `\nCurrent Mood: ${mood}`;
    if (energy) prompt += `\nEnergy Level: ${energy}`;
    if (activities && activities.length > 0) prompt += `\nActivities: ${activities.join(', ')}`;
    
    prompt += `
    Please provide a response in the following JSON format:
    {
      "summary": "Brief summary of the key points and emotions expressed.",
      "sentiment": "A single word describing the sentiment (e.g., 'Positive', 'Negative', 'Neutral').",
      "keywords": ["An array of 3-5 relevant keywords."],
      "suggestions": ["A list of 2-3 actionable suggestions for improvement based on the entry."],
      "insights": "Provide deeper insights, underlying patterns, or potential long-term reflections based on the content. Be empathetic and constructive."
    }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing journal entry with Groq:', error);
    return {
      summary: 'Could not analyze entry.',
      sentiment: 'Neutral',
      keywords: [],
      suggestions: [],
      insights: 'No insights available.'
    };
  }
};

module.exports = {
  analyzeJournalEntry
};
