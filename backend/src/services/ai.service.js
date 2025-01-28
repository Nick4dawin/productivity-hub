const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeJournalEntry = async (entry, mood, energy, activities) => {
  try {
    const prompt = `
    As an empathetic AI counselor, analyze this journal entry and provide insights:
    
    Journal Entry: "${entry}"
    Current Mood: ${mood}
    Energy Level: ${energy}
    Activities: ${activities.join(', ')}

    Please provide a response in the following JSON format:
    {
      "summary": "Brief summary of the key points and emotions expressed",
      "insights": "Psychological insights and patterns noticed",
      "suggestions": ["List of 2-3 actionable suggestions for improvement"],
      "activities": ["List of 2-3 recommended activities based on the entry"],
      "affirmations": ["List of 2-3 personalized affirmations"],
      "motivation": "A motivational message based on the entry",
      "consolation": "An empathetic message addressing any negative emotions (if present)"
    }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing journal entry:', error);
    throw new Error('Failed to analyze journal entry');
  }
};

module.exports = {
  analyzeJournalEntry
};
