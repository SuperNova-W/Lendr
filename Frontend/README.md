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

   Set `EXPO_PUBLIC_API_BASE_URL` to the Cloud Run API base URL.

3. Start Expo:

   ```sh
   npm run start
   ```

## Demo Priorities

- Home feed pulls `GET /items/nearby?lat=&lng=&radius=`.
- Add item posts multipart data to `POST /items`.
- Borrow requests use `POST /requests` and `PATCH /requests/:id`.

Remote push notifications require a development build for Android on modern Expo SDKs.
