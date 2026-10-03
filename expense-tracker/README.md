<div align="center">
  <img src="./assets/images/icon.png" alt="Expense Tracker Logo" width="120" />
  <h1>🚀 Expense Tracker Mobile App</h1>
  <p><strong>A modern, sleek, and secure expense tracker built with React Native (Expo).</strong></p>
  <p>
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://clerk.dev/"><img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" /></a>
  </p>
</div>

<hr />

## ✨ Features

- 🎨 **Modern & Beautiful UI/UX**: Hand-crafted layouts with subtle shadows, Apple-like smooth typography, pie charts, and intuitive rounded cards.
- 🔒 **Secure Authentication**: Integration with **Clerk** handles signup, login, and robust session management safely.
- ☁️ **Cloud Database Integration**: Connected to **Supabase** with Row Level Security (RLS) guaranteeing user isolation and private data access via custom JWT injection logic.
- 📊 **Expense Summaries**: Beautiful dashboard featuring a dynamic, interactive pie chart generated using `react-native-chart-kit`.
- 📝 **Easy Entry & Import**: Create expenses manually with crisp UI inputs, or prepare to bulk import your history via Excel/CSV.
- 📱 **Google Play Store Ready**: Formatted with standard packages (`com.epenesetarcker.app`), strict adaptive icons, custom splash screens, and configured EAS build profiles.
- 🌐 **Web Ready**: Can be run perfectly as a Single Page Application (SPA) on the web.

---

## 🛠️ Tech Stack

- **Frontend:** React Native, Expo Router, React Native Chart Kit
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Clerk
- **Icons & Styling:** Ionicons, Expo Vector Icons, Custom Theme System

---

## 🚀 Setup & Development

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Environment Variables
Create a `.env` in the root folder with the following:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
```

### 3. Start the Project
```bash
npx expo start
```
- Press `a` to run on Android emulator.
- Press `i` to run on iOS simulator.
- Press `w` to run on the Web.

---

## 📦 Google Play Store Build (EAS)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```
2. **Login to Expo**
   ```bash
   eas login
   ```
3. **Build Android App Bundle (AAB)**
   ```bash
   eas build -p android --profile production
   ```
4. **Submit to Play Store**
   Download the generated `.aab` file and upload it directly to the Google Play Console, along with your created `PrivacyPolicy.md` (which you can host via GitHub pages or an arbitrary privacy policy hosting site).

---

## 🛡️ Security Overview

The app is secured via a strict **Supabase + Clerk JWT handoff**:
1. Clerk handles the identity and JWT token creation on login.
2. We query Supabase via a `createClerkSupabaseClient` factory that intercepts requests and passes the custom Clerk JWT in the headers.
3. Supabase RLS enforces `auth.uid() = user_id`, keeping each user isolated from the rest.

---

## 📄 Privacy Policy
A generated standard Privacy Policy is located in `PrivacyPolicy.md`. You will need to provide a public URL to this text in your Play Store console before publishing.

---
<div align="center">
  Made with ❤️ for better personal finance.
</div>
