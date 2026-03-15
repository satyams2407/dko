# Digital Krishi Officer

Monorepo scaffold for the Digital Krishi Officer capstone prototype.

## Workspaces

- `app/`: Next.js 14 application for the Farmer PWA and Officer Dashboard
- `backend/`: Express API with Firebase Admin integration
- `shared/`: Shared TypeScript contracts used by both app and backend

## Planned stack

- Frontend: Next.js 14, React, Tailwind CSS, Firebase Web SDK
- Backend: Node.js, Express, Firebase Admin SDK
- Data: Firestore, Firebase Auth, Cloudinary media storage
- AI: Gemini API, Whisper-compatible STT path, Plant.id

## Initial setup

1. Copy `app/.env.local.example` to `app/.env.local`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Install dependencies from the repository root with `npm.cmd install`.
4. Run the web app with `npm.cmd run dev:app`.
5. Run the API with `npm.cmd run dev:backend`.

## Day 1 output

- Monorepo workspace structure
- Next.js app shell
- Express API shell with `/health`
- Shared contracts package
- Firebase configuration placeholders
