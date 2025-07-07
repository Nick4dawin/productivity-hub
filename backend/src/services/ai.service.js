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

const getCoachSummary = async (data) => {
  try {
    const { todos, completedTasks, moodLog, habitProgress, goals } = data;

    const prompt = `You are an AI life coach. The user has shared their productivity data for the day/week. Give personalized, motivational insights and focus tips. Encourage them kindly, reflect patterns, and recommend 1 new action they can take tomorrow.
    
    Here is the user's data:
    - Todo List: ${JSON.stringify(todos)}
    - Completed Tasks: ${JSON.stringify(completedTasks)}
    - Mood Log: ${JSON.stringify(moodLog)}
    - Habit Progress: ${JSON.stringify(habitProgress)}
    - Goals: ${JSON.stringify(goals)}

    Please provide a response in a clear, encouraging, and actionable format.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting coach summary from Groq:', error);
    return 'There was an error getting your coaching summary. Please try again later.';
  }
}

const getCoachChatResponse = async (messages) => {
  try {
    const systemMessage = {
      role: "system",
      content: `You are an AI life coach named Spark. Your personality is fun, inspiring, and empathetic. You are talking to a user who is trying to be more productive. 
      - Keep your responses concise and easy to read.
      - Use markdown for formatting (bold, italics, lists) to make your messages engaging.
      - Use emojis to add personality. ✨
      - Your goal is to motivate and support the user.
      - Be personal and human-like in your responses.
      - The user's name is not available, so don't ask for it.
      - You can ask questions to understand the user better.`
    };

    const conversation = [systemMessage, ...messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
    }))];

    const completion = await groq.chat.completions.create({
      messages: conversation,
      model: "llama3-8b-8192",
      temperature: 0.8,
      max_tokens: 500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting coach chat response from Groq:', error);
    return 'There was an error getting your coaching response. Please try again later.';
  }
}

const getMilestoneSuggestions = async (goalTitle, goalDescription) => {
  try {
    const prompt = `You are a productivity coach. A user has set a goal. Your task is to break this goal down into smaller, actionable milestones.
    
    Goal Title: "${goalTitle}"
    ${goalDescription ? `Goal Description: "${goalDescription}"` : ''}

    Please provide 5-7 clear, concise, and actionable milestones that would help the user achieve this goal.
    Return the response as a JSON object with a single key "milestones" which is an array of strings.
    For example: { "milestones": ["First milestone", "Second milestone", ...] }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result.milestones || [];
  } catch (error) {
    console.error('Error getting milestone suggestions from Groq:', error);
    return [];
  }
}

module.exports = {
  analyzeJournalEntry,
  getCoachSummary,
  getCoachChatResponse,
  getMilestoneSuggestions
};
