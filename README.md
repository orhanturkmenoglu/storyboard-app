# 📚 StoryBoard – Full‑Stack React Native App 🚀

## Demo App

### 🎯 What You'll Build
This is a true full‑stack project—not just a pretty UI.

- ✅ Works on real devices & simulators (Android / iOS)
- ✅ Zero native code, zero paid services
- ✅ Complete build in ~7 hours

---

### 🧑‍🍳 App Features Overview
- 🔐 **Auth** — signup & login with JWT, error handling for bad creds
- 🏠 **Home Feed** — newest‑first posts with infinite scrolling
- ➕ **Create Post** — title, rating, cover image & caption (all required)
- 👤 **Profile Screen** — user info + their posts
- 🗑️ **Delete Post** — confirmation alert before removal
- 🎨 **4 instant themes** — just swap one color object
- 🌐 **Web support** — run on localhost in the browser
- 🚪 **Logout**

---

### 🧠 What You’ll Learn
- ⚙️ Build a REST API with Node.js, Express & MongoDB
- 🔑 Implement stateless auth using JSON Web Tokens (JWT)
- 🔄 Add performant infinite loading with pagination cursors
- 🖼️ Handle image uploads the easy way (base64 → Cloudinary)
- 🛫 Deploy the backend for free (Render / Railway)
- 🌍 Ship a cross‑platform app with React Native + Expo Router
- 🧭 Animate navigation & shared element transitions
- 🧪 Debug on a physical phone—no Android Studio or Xcode needed

---

### 📁 .env Setup

#### ⚙️ Backend (`/backend`)
```env
PORT=3000
MONGO_URI=<YOUR_MONGO_DB_URI>
JWT_SECRET=<YOUR_VERY_HARD_TO_FIND_SECRET>

CLOUDINARY_CLOUD_NAME=<YOUR_CLOUDINARY_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_CLOUDINARY_API_SECRET>

API_URL=<YOUR_DEPLOYED_API_URL>

#### ⚙️ Run the backend
``` bash
cd backend
npm install
npm run dev

#### 📱 Run the mobile
``` bash
cd mobile
npm install
npx expo start


