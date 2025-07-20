const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analyzeJournalEntry = async (content, mood, energy, activities) => {
  try {
    let prompt = `Analyze this journal entry and extract the following information with high precision:

1. MOOD ANALYSIS: Identify the user's current emotional tone/mood (e.g., happy, anxious, tired, motivated, etc.). Be precise in determining the primary emotion.

2. TODO EXTRACTION: Extract any tasks the user mentions:
   - Past tasks: Things they've already done (use past tense verbs as indicators)
   - Future tasks: Things they plan to do (use future tense or intent words as indicators)
   - For each task, include:
     - Title (clear action item)
     - Time frame (past/future)
     - Due date (if mentioned, even if approximate like "next week" or "this weekend")

3. MEDIA EXTRACTION: Identify any media content mentioned:
   - Title of shows, movies, games, books, podcasts, music, etc.
   - Type of media (game, show, movie, book, etc.)
   - Status (watched, planning to watch, currently playing, etc.)

4. HABIT TRACKING: Identify any habits or routines:
   - Name of the habit
   - Status (completed/done or missed/skipped)
   - Frequency if mentioned (daily, weekly, etc.)

Journal Entry: "${content}"`;

    if (mood) prompt += `\nCurrent Mood: ${mood}`;
    if (energy) prompt += `\nEnergy Level: ${energy}`;
    if (activities && activities.length > 0) prompt += `\nActivities: ${activities.join(', ')}`;
    
    prompt += `
    Be extremely precise in your extraction. Only extract items that are explicitly mentioned, don't infer too much.
    If the user says "I feel tired", that's a mood, not a habit called "sleeping".
    
    Provide response in the following JSON format:
    {
      "summary": "Brief summary of the key points and emotions expressed.",
      "sentiment": "A single word describing the sentiment (e.g., 'Positive', 'Negative', 'Neutral').",
      "keywords": ["An array of 3-5 relevant keywords."],
      "suggestions": ["A list of 2-3 actionable suggestions for improvement based on the entry."],
      "insights": "Provide deeper insights, underlying patterns, or potential long-term reflections based on the content. Be empathetic and constructive.",
      "extracted": {
        "mood": "anxious", 
        "todos": [
          { "title": "Call doctor", "time": "future", "dueDate": "2023-05-15", "priority": "medium" }
        ],
        "media": [
          { "title": "The Bear", "type": "show", "status": "planned" }
        ],
        "habits": [
          { "name": "Morning exercise", "status": "done", "frequency": "daily" }
        ]
      }
    }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.3, // Lower temperature for more focused extraction
      max_tokens: 1000,
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
      insights: 'No insights available.',
      extracted: {
        mood: '',
        todos: [],
        media: [],
        habits: []
      }
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

const generateJournalPrompt = async (contextData) => {
  try {
    const { todos, moods, habits, media, userId } = contextData;
    
    let prompt = `Create a thoughtful, personalized journal prompt for the user based on their data.
    
    Your goal is to help the user reflect on their activities, moods, and goals in a meaningful way.
    Consider what would be most helpful for them to explore today based on this context.`;
    
    prompt += `\n\nUser Data:`;
    
    if (moods && moods.length > 0) {
      const latestMood = moods[0];
      prompt += `\n- Recent Mood: "${latestMood.mood}" (${new Date(latestMood.date).toLocaleDateString()})`;
      
      // If multiple moods exist, look for patterns
      if (moods.length > 1) {
        prompt += `\n- Mood Pattern: [${moods.map(m => m.mood).join(', ')}]`;
      }
    }
    
    if (todos && todos.length > 0) {
      const upcomingTodos = todos.slice(0, 3);
      prompt += `\n- Upcoming Tasks:`;
      upcomingTodos.forEach(todo => {
        prompt += `\n  * "${todo.title}"${todo.dueDate ? ` (due: ${todo.dueDate})` : ''}${todo.priority ? ` [${todo.priority} priority]` : ''}`;
      });
    }
    
    if (media && media.length > 0) {
      const recentMedia = media.slice(0, 2);
      prompt += `\n- Recent Media:`;
      recentMedia.forEach(m => {
        prompt += `\n  * ${m.title} (${m.type}, ${m.status})`;
      });
    }
    
    if (habits && habits.length > 0) {
      const habitData = habits.slice(0, 3);
      prompt += `\n- Active Habits:`;
      habitData.forEach(h => {
        prompt += `\n  * ${h.name} (streak: ${h.streak} days)`;
      });
    }
    
    prompt += `\n\nCreate ONE personalized journal prompt that:
    1. Relates to their current mood or activities
    2. Encourages self-reflection or growth
    3. Is specific enough to inspire writing but open-ended enough for exploration
    4. Is phrased as a thoughtful question

    Return ONLY the journal prompt question, without any preamble or explanation.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 250,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating journal prompt:', error);
    return 'What\'s on your mind today?';
  }
};

module.exports = {
  analyzeJournalEntry,
  getCoachSummary,
  getCoachChatResponse,
  getMilestoneSuggestions,
  generateJournalPrompt
};
