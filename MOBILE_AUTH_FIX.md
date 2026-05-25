# Mobile Auth API Fix - Complete Setup Guide

## ✅ Issues Fixed

### 1. **Network Error - AxiosError: Network Error**
   - **Root Cause:** Mobile app was configured to use `localhost:3000`, which doesn't resolve on physical devices/emulators
   - **Solution:** Updated to use actual machine IP address `172.24.111.143:3000`

### 2. **Registration API Failed**
   - **Root Cause:** Could not reach backend due to incorrect URL
   - **Solution:** Proper IP configuration + enhanced error handling

### 3. **Login API Failed**
   - **Root Cause:** Same network connectivity issue
   - **Solution:** Fixed via IP configuration

---

## 🔧 Changes Made

### 1. Mobile Environment Configuration
**File:** `mobile/.env`
```
# ✅ BEFORE
EXPO_PUBLIC_API_URL=http://localhost:3000

# ✅ AFTER
EXPO_PUBLIC_API_URL=http://172.24.111.143:3000
```

### 2. Enhanced API Client
**File:** `mobile/src/services/api/apiClient.ts`
- ✅ Added detailed console logging for debugging
- ✅ Set 15-second timeout for requests
- ✅ Added request/response interceptors with logging
- ✅ Better error reporting with response details
- ✅ Logs show request URL, response status, and error details

### 3. Enhanced Auth API
**File:** `mobile/src/services/api/authApi.ts`
- ✅ Added try-catch blocks for each API method
- ✅ Enhanced error messages from server responses
- ✅ Validation error extraction from response details
- ✅ Detailed logging for debugging

### 4. Backend Server
**File:** `backend/server.js` (Already Configured ✅)
- ✅ CORS enabled for all origins
- ✅ Proper headers configuration
- ✅ Preflight request handling
- ✅ Running on port 3000

---

## 🚀 How to Test

### Step 1: Stop and Restart Expo App
```bash
# Kill the current Expo process
Ctrl+C

# Restart Expo from the mobile directory
cd mobile
npm start

# Then select 'e' for Expo Go or 'a' for Android/iOS emulator
```

### Step 2: Verify Connection
- Open Expo app on device/emulator
- You should see logs: `✅ API Base URL: http://172.24.111.143:3000`
- Try clicking on the Login tab (don't submit yet)

### Step 3: Monitor Console Logs
Watch the terminal for logs like:
```
📡 Using configured API URL: http://172.24.111.143:3000
✅ API Base URL: http://172.24.111.143:3000
🔵 API Request: POST /api/auth/login
📤 Request Data: {...}
🟢 API Response: 200 /api/auth/login
```

### Step 4: Test Login
**Use test credentials:**
```
Email: student@gauhati.ac.in
Password: test123
```

**Expected:** Should see in console:
```
🔵 Attempting login with email: student@gauhati.ac.in
🟢 API Response: 200 /api/auth/login
✅ Login successful
```

### Step 5: Test Registration
**Use new email:**
```
Full Name: Test User
Email: testuser@example.com
Phone: 9876543210
Password: Password123
```

**Expected:** Should see registration success alert

---

## 🔍 Debugging Network Issues

### If Still Getting Network Error

#### Check 1: Is Backend Running?
```bash
# Verify backend is running on port 3000
netstat -ano | findstr :3000
```
Should show something like: `TCP    0.0.0.0:3000 ... LISTENING`

#### Check 2: Verify IP Address
```bash
# Get current machine IP
ipconfig | findstr "IPv4"
```
Should show your current network IP (like 172.24.111.143)

#### Check 3: Check Firewall
- Windows Firewall should allow port 3000
- Or disable it temporarily for testing

#### Check 4: Network Connectivity
- Mobile device should be on same network as development machine
- WiFi network preferred (USB tethering also works)

#### Check 5: Clear Cache
```bash
# In Expo app settings, clear cache and restart
# Or in terminal:
npm start -- --clear
```

---

## 📡 How Network Resolution Works

### iOS Simulator
- Automatically resolves to `localhost`
- Can also use machine's actual IP

### Android Emulator
- `localhost` = emulator's loopback interface (wrong)
- `10.0.2.2` = host machine (special alias)
- Machine IP (172.24.111.143) = works best

### Physical Device
- **Must** use machine's actual IP address
- Requires same WiFi network

---

## ✅ Configuration for Different Scenarios

### Scenario 1: Expo Go on Physical Device (Most Common)
```
EXPO_PUBLIC_API_URL=http://172.24.111.143:3000
```
✅ This is what's configured

### Scenario 2: iOS Simulator
```
EXPO_PUBLIC_API_URL=http://localhost:3000
# OR
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
```

### Scenario 3: Android Emulator
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
# OR use actual IP if on same network
EXPO_PUBLIC_API_URL=http://172.24.111.143:3000
```

### Scenario 4: Web Browser
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 🛠️ Additional Improvements Made

### 1. Better Error Handling
- Server errors are properly extracted and displayed
- Validation errors show specific field issues
- Network errors are clearly logged

### 2. Enhanced Logging
Console logs include:
- 🔵 (blue dot) = API request
- 🟢 (green dot) = successful response
- 🔴 (red dot) = error response
- 📡 = configuration info
- 📤 = request data
- 📥 = response data

### 3. Timeout Configuration
- 15-second timeout for API requests
- Prevents hanging on unresponsive server

---

## 📝 Testing Checklist

- [ ] Backend running on port 3000
- [ ] `mobile/.env` updated to your machine IP
- [ ] Expo app restarted/cleared cache
- [ ] Can see API URL in logs
- [ ] Login attempt shows network logs
- [ ] Registration attempt works
- [ ] Error messages are clear and helpful

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Network Error on login | Check machine IP in `.env`, restart Expo |
| 401 Unauthorized | Wrong credentials, check username/password |
| 400 Bad Request | Missing fields, check form validation |
| 500 Server Error | Backend issue, check backend logs |
| Timeout | Backend down or network unreachable |
| Can't find host | IP address incorrect, update `.env` |

---

## 🔐 Backend Credentials for Testing

```
Admin User:
  Email: admin@smartcanteen.com
  Password: admin123

Vendor User:
  Email: canteen@gauhati.ac.in
  Password: vendor123

Regular Student User:
  Email: student@gauhati.ac.in
  Password: test123
```

---

## ✨ Next Steps

1. Restart Expo app with updated environment
2. Test login and registration
3. Monitor console logs for successful API calls
4. Check if token is stored (should auto-navigate to home on success)
5. All network errors should now be resolved!

