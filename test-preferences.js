// Quick test script for user preferences
// Run this in your browser console or as a Node script

async function testPreferences() {
  const baseUrl = 'http://localhost:3001'; // Adjust to your backend URL
  
  try {
    // Get current preferences
    const prefsResponse = await fetch(`${baseUrl}/api/journal/preferences`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });
    
    if (prefsResponse.ok) {
      const prefs = await prefsResponse.json();
      console.log('Current Preferences:', prefs);
    }
    
    // Update preferences
    const updateResponse = await fetch(`${baseUrl}/api/journal/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confidenceThreshold: 0.8,
        suggestionTypes: ['mood', 'reflection'],
        promptStyle: 'analytical'
      })
    });
    
    if (updateResponse.ok) {
      const updated = await updateResponse.json();
      console.log('Updated Preferences:', updated);
    }
    
  } catch (error) {
    console.error('Error testing preferences:', error);
  }
}

// Run the test
testPreferences();