# Android App Startup Guide

## Current Status
- ✅ Metro bundler running on port 8081
- ✅ Backend configured for port 5000 (10.0.2.2:5000 for Android emulator)
- 🔄 Android app launching...

## Expected Startup Flow

1. **App Launch** - ProductivityHub splash screen
2. **Authentication Screen** - Login/Register interface
3. **Backend Connection** - Should connect to your local backend on port 5000

## If You See Issues

### Network Connection Issues
If the app can't connect to the backend:
```bash
# Check if backend is accessible from emulator
adb shell
curl http://10.0.2.2:5000/api/health
```

### Metro Bundler Issues
If you see bundling errors:
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

### Android Build Issues
If the app fails to install:
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## Testing the Connection

Once the app loads:
1. Try to register a new account
2. Check if the login screen appears
3. Verify network requests in Metro logs

## Development Features Available

- **Hot Reload** - Changes will update automatically
- **Debug Menu** - Shake device or Ctrl+M to open
- **Network Inspector** - Available in debug menu
- **Element Inspector** - Available in debug menu

## Backend API Endpoints

The app will connect to these endpoints on your backend:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/habits` - Fetch habits
- `GET /api/todos` - Fetch todos
- And more...

## Next Steps

1. **Test Authentication** - Try registering/logging in
2. **Explore Features** - Navigate through the app
3. **Check Logs** - Monitor Metro console for any errors
4. **Test Offline Mode** - Disconnect network to test offline features

## Troubleshooting Commands

```bash
# Restart Metro with cache reset
npx react-native start --reset-cache

# Reinstall app
npx react-native run-android

# Check Android logs
npx react-native log-android

# Check connected devices
adb devices
```

The app should be fully functional with all the features we've implemented:
- Authentication (login/register)
- Habit tracking
- Todo management  
- Journal entries
- Mood tracking
- Goals and routines
- Finance tracking
- Media tracking
- AI coach
- Offline support
- Performance optimizations