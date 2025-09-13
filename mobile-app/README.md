# Productivity Hub Mobile

A React Native mobile application for the Productivity Hub platform, providing comprehensive productivity tracking including habits, mood, journal, todos, goals, routines, media, and finance management.

## Features

- 📱 **Cross-platform**: iOS and Android support
- 🔐 **Authentication**: JWT and Google OAuth integration
- 📊 **Dashboard**: Analytics and insights
- 🎯 **Habit Tracking**: Daily habit completion with streaks
- 😊 **Mood Tracking**: Emotional state logging with activities
- 📝 **Journal**: AI-powered analysis and insights
- ✅ **Todo Management**: Task organization with priorities
- 🎯 **Goals**: SMART goals with milestone tracking
- 🔄 **Routines**: Morning, evening, and custom routines
- 🎬 **Media Tracking**: Books, movies, TV shows, games
- 💰 **Finance**: Expense tracking, budgets, subscriptions
- 🤖 **AI Coach**: Personalized productivity coaching
- 🔄 **Offline Support**: Works without internet connection
- 🔔 **Push Notifications**: Habit reminders and goal alerts

## Tech Stack

- **Framework**: React Native 0.73+
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Context + React Query
- **UI Components**: React Native Elements + Custom
- **Storage**: AsyncStorage + Keychain
- **HTTP Client**: Axios
- **Charts**: Victory Native
- **Testing**: Jest + React Native Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install iOS dependencies (iOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

### Running the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

### Development

#### Start Metro bundler
```bash
npm start
```

#### Run tests
```bash
npm test
```

#### Lint code
```bash
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, etc.)
│   ├── forms/          # Form components
│   ├── lists/          # List components
│   └── charts/         # Chart components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── navigation/         # Navigation configuration
├── screens/            # Screen components
├── services/           # API and external services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## API Integration

The mobile app connects to the existing Productivity Hub backend API. All endpoints remain unchanged, ensuring seamless data synchronization between web and mobile platforms.

### Base URL
- Development: `http://localhost:5001/api`
- Production: Configure in environment variables

## Offline Support

The app includes comprehensive offline capabilities:
- Local data caching with AsyncStorage
- Sync queue for offline operations
- Automatic sync when connectivity returns
- Conflict resolution for concurrent edits

## Security

- JWT tokens stored securely in device keychain
- Request/response interceptors for authentication
- Automatic token refresh handling
- Secure API communication with HTTPS

## Testing

The project includes comprehensive testing:
- Unit tests for services and utilities
- Component tests with React Native Testing Library
- Integration tests for critical user flows
- Mocked dependencies for reliable testing

## Building for Production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

This project is private and proprietary.