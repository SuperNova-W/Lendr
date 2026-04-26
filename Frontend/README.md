# Lend

Hyperlocal neighborhood tool-lending app built with React Native, Expo Router, and a FastAPI backend.

## Getting Started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Configure environment:

   ```sh
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_API_BASE_URL` to the API base URL. For Google OAuth, use a
   Web client ID for `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, an iOS client ID for
   `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, and an Android client ID for
   `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`. A Web client ID cannot be used for
   native custom-scheme redirects.

3. Start Expo:

   ```sh
   npm run start
   ```

## Demo Priorities

- Home feed pulls `GET /items/nearby?lat=&lng=&radius=`.
- Add item posts multipart data to `POST /items`.
- Borrow requests use `POST /requests` and `PATCH /requests/:id`.

Remote push notifications require a development build for Android on modern Expo SDKs.
