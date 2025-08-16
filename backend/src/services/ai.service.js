const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Debouncing utility for real-time analysis
const debounceMap = new Map();

const debounce = (func, delay, key) => {
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key));
  }
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(async () => {
      try {
        const result = await func();
        debounceMap.delete(key);
        resolve(result);
      } catch (error) {
        debounceMap.delete(key);
        reject(error);
      }
    }, delay);
    
    debounceMap.set(key, timeoutId);
  });
};

// Retry utility with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const analyzeJournalEntry = async (content, mood, energy, activities) => {
  return retryWithBackoff(async () => {
    let prompt = `Analyze this journal entry and extract the following information with high precision and confidence scoring:

1. MOOD ANALYSIS: Identify the user's current emotional tone/mood. You MUST only return one of these predefined moods: "excellent", "good", "neutral", "bad", "terrible". Map the detected emotion to the closest predefined mood.

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
    
    IMPORTANT: For mood detection, you MUST extract structured mood data that matches the mood tracking system:
    
    MOOD MAPPING - Map detected emotions to these exact emoji values:
    - "😊" (Happy): Very happy, excited, amazing, fantastic, great day, joyful, elated
    - "😌" (Calm): Peaceful, relaxed, content, serene, at ease, tranquil
    - "😐" (Neutral): Okay, fine, normal, balanced, neither good nor bad, indifferent
    - "😢" (Sad): Sad, disappointed, down, blue, melancholy, sorrowful
    - "😤" (Angry): Angry, frustrated, mad, irritated, annoyed, upset
    - "😴" (Tired): Tired, exhausted, sleepy, fatigued, worn out, drained
    
    ENERGY LEVEL MAPPING - Extract energy level:
    - "⚡️" (High): High energy, energetic, pumped, motivated, active, vibrant
    - "✨" (Medium): Moderate energy, balanced, steady, normal energy
    - "🌙" (Low): Low energy, tired, sluggish, lethargic, drained
    
    ACTIVITIES MAPPING - Extract mentioned activities from this list:
    - "Exercise", "Work", "Social", "Family", "Hobbies", "Reading", "Movies", "Gaming", "Nature", "Shopping", "Cooking", "Music"
    
    For each extracted item, provide a confidence score from 0.0 to 1.0 indicating how certain you are about the extraction:
    - 0.9-1.0: Very confident (explicitly mentioned)
    - 0.7-0.8: Confident (clearly implied)
    - 0.5-0.6: Moderate confidence (somewhat implied)
    - 0.3-0.4: Low confidence (vague reference)
    - 0.0-0.2: Very low confidence (uncertain)
    
    Provide response in the following JSON format:
    {
      "summary": "Brief summary of the key points and emotions expressed.",
      "sentiment": "A single word describing the sentiment (e.g., 'Positive', 'Negative', 'Neutral').",
      "keywords": ["An array of 3-5 relevant keywords."],
      "suggestions": ["A list of 2-3 actionable suggestions for improvement based on the entry."],
      "insights": "Provide deeper insights, underlying patterns, or potential long-term reflections based on the content. Be empathetic and constructive.",
      "confidence": 0.85,
      "extracted": {
        "mood": {
          "value": "😊",
          "label": "Happy",
          "confidence": 0.9
        },
        "energy": {
          "value": "⚡️",
          "label": "High",
          "confidence": 0.8
        },
        "activities": [
          { "value": "Exercise", "confidence": 0.9 },
          { "value": "Work", "confidence": 0.7 }
        ],
        "todos": [
          { "title": "Call doctor", "time": "future", "dueDate": "2023-05-15", "priority": "medium", "confidence": 0.8 }
        ],
        "media": [
          { "title": "The Bear", "type": "show", "status": "planned", "confidence": 0.7 }
        ],
        "habits": [
          { "name": "Morning exercise", "status": "done", "frequency": "daily", "confidence": 0.9 }
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

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Ensure confidence scores exist and are valid
    if (!result.confidence) result.confidence = 0.5;
    if (result.extracted?.mood && typeof result.extracted.mood === 'string') {
      result.extracted.mood = { value: result.extracted.mood, label: 'Unknown', confidence: 0.5 };
    }
    if (result.extracted?.energy && typeof result.extracted.energy === 'string') {
      result.extracted.energy = { value: result.extracted.energy, label: 'Unknown', confidence: 0.5 };
    }
    
    return result;
  }).catch(error => {
    console.error('Error analyzing journal entry with Groq:', error);
    return {
      summary: 'Could not analyze entry.',
      sentiment: 'Neutral',
      keywords: [],
      suggestions: [],
      insights: 'No insights available.',
      confidence: 0.0,
      extracted: {
        mood: { value: '', label: '', confidence: 0.0 },
        energy: { value: '', label: '', confidence: 0.0 },
        activities: [],
        todos: [],
        media: [],
        habits: []
      }
    };
  });
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

// NEW: Real-time analysis with debouncing for typing analysis
const analyzeJournalContentRealtime = async (content, userId) => {
  if (!content || content.trim().length < 10) {
    return { analyzing: false, suggestions: [] };
  }

  const debounceKey = `realtime_${userId}`;
  
  return debounce(async () => {
    return retryWithBackoff(async () => {
      const prompt = `Analyze this partial journal entry for real-time feedback. Focus on:
      1. Mood detection if emotional indicators are present (MUST use emoji values: "😊", "😌", "😐", "😢", "😤", "😴")
      2. Quick suggestions for continuation if the user seems stuck
      3. Immediate actionable items if mentioned
      
      Content: "${content}"
      
      Provide a lightweight analysis in JSON format:
      {
        "mood": {
          "detected": "😊|😌|😐|😢|😤|😴",
          "confidence": 0.8,
          "suggestion": "Brief mood-related suggestion"
        },
        "quickSuggestions": ["Brief writing prompt", "Another suggestion"],
        "actionItems": ["Any immediate todos detected"],
        "analyzing": true
      }
      
      Keep responses concise for real-time use.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-8b-8192",
        temperature: 0.4,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    });
  }, 1500, debounceKey).catch(error => {
    console.error('Error in real-time analysis:', error);
    return { analyzing: false, suggestions: [], error: 'Analysis temporarily unavailable' };
  });
};

// NEW: Enhanced contextual suggestion generation based on user patterns
const generateContextualSuggestions = async (userContext) => {
  return retryWithBackoff(async () => {
    const { 
      recentMoods = [], 
      upcomingTodos = [], 
      recentMedia = [], 
      habitProgress = [], 
      journalHistory = [],
      userPreferences = {}
    } = userContext;

    let prompt = `Generate 3-5 contextual journal prompts based on the user's current state and patterns.
    
    User Context:`;

    // Recent mood patterns
    if (recentMoods.length > 0) {
      const moodPattern = recentMoods.slice(0, 5).map(m => m.mood || m.value).join(' → ');
      prompt += `\n- Recent Mood Pattern: ${moodPattern}`;
      
      const currentMood = recentMoods[0];
      if (currentMood) {
        prompt += `\n- Current Mood: ${currentMood.mood || currentMood.value} (confidence: ${currentMood.confidence || 'unknown'})`;
      }
    }

    // Upcoming tasks and deadlines
    if (upcomingTodos.length > 0) {
      prompt += `\n- Upcoming Tasks:`;
      upcomingTodos.slice(0, 3).forEach(todo => {
        const dueInfo = todo.dueDate ? ` (due: ${new Date(todo.dueDate).toLocaleDateString()})` : '';
        const priority = todo.priority ? ` [${todo.priority}]` : '';
        prompt += `\n  * ${todo.title}${dueInfo}${priority}`;
      });
    }

    // Recent media consumption
    if (recentMedia.length > 0) {
      prompt += `\n- Recent Media:`;
      recentMedia.slice(0, 2).forEach(media => {
        prompt += `\n  * ${media.title} (${media.type}, ${media.status})`;
      });
    }

    // Habit tracking progress
    if (habitProgress.length > 0) {
      prompt += `\n- Habit Progress:`;
      habitProgress.slice(0, 3).forEach(habit => {
        const streak = habit.streak ? ` (${habit.streak} day streak)` : '';
        prompt += `\n  * ${habit.name}: ${habit.status}${streak}`;
      });
    }

    // Journal writing patterns
    if (journalHistory.length > 0) {
      const recentTopics = journalHistory.slice(0, 3).map(entry => 
        entry.keywords ? entry.keywords.slice(0, 2).join(', ') : 'general'
      ).join('; ');
      prompt += `\n- Recent Journal Topics: ${recentTopics}`;
    }

    // User preferences
    if (userPreferences.suggestionTypes) {
      prompt += `\n- Preferred Suggestion Types: ${userPreferences.suggestionTypes.join(', ')}`;
    }

    prompt += `\n\nGenerate contextual suggestions that:
    1. Address current mood or emotional state
    2. Connect to upcoming tasks or goals
    3. Build on recent media or experiences
    4. Support habit formation or reflection
    5. Encourage growth based on patterns

    Return JSON format:
    {
      "suggestions": [
        {
          "prompt": "Thoughtful question or writing prompt",
          "type": "mood|todo|media|habit|reflection",
          "relevance": 0.9,
          "reasoning": "Why this suggestion fits the user's context"
        }
      ],
      "fallbackPrompts": ["Generic prompt 1", "Generic prompt 2"]
    }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.6,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Ensure fallback prompts exist
    if (!result.fallbackPrompts || result.fallbackPrompts.length === 0) {
      result.fallbackPrompts = [
        "What's one thing you're grateful for today?",
        "How are you feeling right now, and what might be influencing that?",
        "What's something you learned recently that surprised you?"
      ];
    }

    return result;
  }).catch(error => {
    console.error('Error generating contextual suggestions:', error);
    return {
      suggestions: [],
      fallbackPrompts: [
        "What's on your mind today?",
        "How are you feeling right now?",
        "What's one thing you want to remember about today?",
        "What are you looking forward to?",
        "What challenged you today, and how did you handle it?"
      ],
      error: 'Contextual suggestions temporarily unavailable'
    };
  });
};

// NEW: Extract data with enhanced confidence scoring and context awareness
const extractDataWithConfidence = async (content, context = {}) => {
  console.log('🤖 extractDataWithConfidence called with:', { 
    contentLength: content?.length, 
    context: Object.keys(context) 
  });
  
  return retryWithBackoff(async () => {
    const { previousMoods = [], recentTodos = [], userPreferences = {} } = context;
    
    let prompt = `Analyze this journal entry with enhanced context awareness and confidence scoring.

    Journal Entry: "${content}"`;

    // Add context for better extraction
    if (previousMoods.length > 0) {
      const recentMoodPattern = previousMoods.slice(0, 3).map(m => m.mood || m.value).join(', ');
      prompt += `\n\nRecent Mood Context: ${recentMoodPattern}`;
    }

    if (recentTodos.length > 0) {
      const activeTodos = recentTodos.slice(0, 3).map(t => t.title).join(', ');
      prompt += `\nActive Todos Context: ${activeTodos}`;
    }

    if (userPreferences.confidenceThreshold) {
      prompt += `\nUser Confidence Threshold: ${userPreferences.confidenceThreshold}`;
    }

    prompt += `\n\nExtract information with detailed confidence scoring:

    CRITICAL: For mood detection, you MUST extract structured mood data that matches the mood tracking system:
    
    MOOD MAPPING - Map detected emotions to these exact emoji values:
    - "😊" (Happy): Very happy, excited, amazing, fantastic, great day, joyful, elated
    - "😌" (Calm): Peaceful, relaxed, content, serene, at ease, tranquil
    - "😐" (Neutral): Okay, fine, normal, balanced, neither good nor bad, indifferent
    - "😢" (Sad): Sad, disappointed, down, blue, melancholy, sorrowful
    - "😤" (Angry): Angry, frustrated, mad, irritated, annoyed, upset
    - "😴" (Tired): Tired, exhausted, sleepy, fatigued, worn out, drained
    
    ENERGY LEVEL MAPPING - Extract energy level:
    - "⚡️" (High): High energy, energetic, pumped, motivated, active, vibrant
    - "✨" (Medium): Moderate energy, balanced, steady, normal energy
    - "🌙" (Low): Low energy, tired, sluggish, lethargic, drained
    
    ACTIVITIES MAPPING - Extract mentioned activities from this list:
    - "Exercise", "Work", "Social", "Family", "Hobbies", "Reading", "Movies", "Gaming", "Nature", "Shopping", "Cooking", "Music"

    For each extraction, provide confidence based on:
    - Explicit mention: 0.9-1.0
    - Clear implication: 0.7-0.8  
    - Contextual inference: 0.5-0.6
    - Weak indication: 0.3-0.4
    - Uncertain/guessed: 0.0-0.2

    Consider context from user's patterns when determining confidence.

    Return JSON format:
    {
      "summary": "Brief summary",
      "sentiment": "Positive|Negative|Neutral",
      "keywords": ["keyword1", "keyword2"],
      "suggestions": ["suggestion1", "suggestion2"],
      "insights": "Deeper insights",
      "confidence": 0.85,
      "extracted": {
        "mood": {
          "value": "😊",
          "label": "Happy",
          "confidence": 0.9,
          "reasoning": "Why this confidence level"
        },
        "energy": {
          "value": "⚡️",
          "label": "High",
          "confidence": 0.8,
          "reasoning": "Why this confidence level"
        },
        "activities": [
          { "value": "Exercise", "confidence": 0.9, "reasoning": "Why this confidence level" }
        ],
        "todos": [
          {
            "title": "Task title",
            "time": "future|past",
            "dueDate": "2024-01-15",
            "priority": "high|medium|low",
            "confidence": 0.8,
            "reasoning": "Extraction reasoning"
          }
        ],
        "media": [
          {
            "title": "Media title",
            "type": "book|movie|show|game|podcast",
            "status": "completed|planned|current",
            "confidence": 0.7,
            "reasoning": "Extraction reasoning"
          }
        ],
        "habits": [
          {
            "name": "Habit name",
            "status": "done|missed",
            "frequency": "daily|weekly",
            "confidence": 0.9,
            "reasoning": "Extraction reasoning"
          }
        ]
      }
    }`;

    console.log('🤖 Sending prompt to Groq API...');
    console.log('📝 Prompt preview:', prompt.substring(0, 200) + '...');

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 1200,
      response_format: { type: "json_object" }
    });

    console.log('✅ Groq API response received');
    console.log('📄 Raw response:', completion.choices[0].message.content);

    const result = JSON.parse(completion.choices[0].message.content);
    
    console.log('🔍 Parsed result:', result);
    console.log('📊 Extracted field present:', !!result.extracted);
    
    if (result.extracted) {
      console.log('📋 Extracted data structure:', {
        hasMood: !!result.extracted.mood,
        todosCount: result.extracted.todos?.length || 0,
        mediaCount: result.extracted.media?.length || 0,
        habitsCount: result.extracted.habits?.length || 0
      });
    }
    
    // Validate and normalize confidence scores
    const normalizeConfidence = (item) => {
      if (typeof item.confidence !== 'number' || item.confidence < 0 || item.confidence > 1) {
        item.confidence = 0.5;
      }
      return item;
    };

    if (result.extracted) {
      if (result.extracted.mood) {
        result.extracted.mood = normalizeConfidence(result.extracted.mood);
      }
      if (result.extracted.todos) {
        result.extracted.todos = result.extracted.todos.map(normalizeConfidence);
      }
      if (result.extracted.media) {
        result.extracted.media = result.extracted.media.map(normalizeConfidence);
      }
      if (result.extracted.habits) {
        result.extracted.habits = result.extracted.habits.map(normalizeConfidence);
      }
    }

    console.log('✨ Final result with normalized confidence:', result);
    return result;
  }).catch(error => {
    console.error('💥 Error in enhanced data extraction:', error);
    return {
      summary: 'Could not analyze entry.',
      sentiment: 'Neutral',
      keywords: [],
      suggestions: [],
      insights: 'Analysis temporarily unavailable.',
      confidence: 0.0,
      extracted: {
        mood: { value: '', confidence: 0.0, reasoning: 'Analysis failed' },
        todos: [],
        media: [],
        habits: []
      },
      error: 'Extraction service temporarily unavailable'
    };
  });
};

module.exports = {
  analyzeJournalEntry,
  getCoachSummary,
  getCoachChatResponse,
  getMilestoneSuggestions,
  generateJournalPrompt,
  // New enhanced methods
  analyzeJournalContentRealtime,
  generateContextualSuggestions,
  extractDataWithConfidence
};
