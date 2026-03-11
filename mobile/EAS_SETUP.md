# Expo EAS Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- Expo CLI installed globally: `npm install -g expo-cli`
- EAS CLI installed globally: `npm install -g eas-cli`
- Expo account (create at https://expo.dev)

## Setup Steps

### 1. Login to Expo
```bash
eas login
```

### 2. Configure App
Update the following in your eas.json:
- Replace `your-apple-id@email.com` with your actual Apple ID
- Replace `YOUR_APP_STORE_CONNECT_APP_ID` with your App Store Connect App ID
- Replace `YOUR_APPLE_TEAM_ID` with your Apple Team ID

### 3. Environment Variables
Create environment-specific .env files:
- `.env.development` - Development environment
- `.env.preview` - Staging environment  
- `.env.production` - Production environment

### 4. Build Commands

**Development Build:**
```bash
npm run eas:build:dev
```

**Preview Build (Staging):**
```bash
npm run eas:build:preview
```

**Production Build:**
```bash
npm run eas:build:prod
```

### 5. Submit to Stores

**Submit to Google Play:**
```bash
npm run eas:submit:android
```

**Submit to App Store:**
```bash
npm run eas:submit:ios
```

### 6. Update Commands

**Update production channel:**
```bash
npm run eas:update
```

**Update development channel:**
```bash
npm run eas:update:dev
```

**Update preview channel:**
```bash
npm run eas:update:preview
```

## Configuration Files

### eas.json
Contains build profiles for different environments:
- `development`: For internal testing with development client
- `preview`: For staging/testing builds
- `production`: For production releases

### Environment Variables
Environment variables are configured in the eas.json build profiles and can be accessed in your app using:
```javascript
const apiUrl = process.env.API_BASE_URL;
```

## Troubleshooting

1. **Build fails**: Check that all dependencies are installed correctly
2. **Certificate issues**: Ensure proper iOS/Android certificates are set up
3. **Environment variables**: Verify they are correctly set in eas.json

## Useful Links
- [EAS Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Build](https://expo.dev/build)
- [Expo Submit](https://expo.dev/submit)
