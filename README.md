# Echo Meet

![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)
![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?logo=vite)
![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

[👉 Try the Live App](https://echo-meet-eight.vercel.app)

Echo Meet is a modern, browser-based video conferencing application designed for simplicity and speed. Whether you're hosting a quick team call or joining a friend via a meeting link, Echo Meet provides a seamless experience with minimal setup.

## 🚀 Features

* 🔒 Google Sign-In via Supabase Auth  
* 🎥 Real-time video & audio streaming (PeerJS + WebRTC)  
* 🧑‍🤝‍🧑 Join by meeting code or link  
* 🗣 Mute/unmute and toggle video  
* 💬 Host name highlighted in the grid  
* 📱 Fully responsive UI  

## 🧠 How It Works

- Users sign in with Google via Supabase Auth  
- Each meeting is assigned a short unique code (UUID)  
- Participants are tracked in a `room_participants` table  
- PeerJS handles real-time video/audio streaming via WebRTC  
- When users join a room, peer connections are auto-established  
- The UI updates in real time using Supabase’s realtime listeners  

## 🛠 Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=flat&logo=webrtc&logoColor=white)
![PeerJS](https://img.shields.io/badge/PeerJS-4B0082?style=flat&logo=peerjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## 🧪 Local Development

```bash
npm install
npm run dev
```

> You'll need a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧑‍💻 Folder Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Homepage, Dashboard, MeetingRoom
├── supabaseClient.ts # Supabase client setup
```

## 🌐 Deployment

This app is deployed using **Vercel**:

* Add your Supabase environment variables in the Vercel dashboard  
* Ensure fallback routing is handled with `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## 📸 Screenshots

> Add screenshots of Homepage, Dashboard, and Meeting Room here

## 📄 License

MIT License — free for personal and commercial use.

## ✨ Contributions

Feel free to fork and contribute! Pull requests are welcome.  
This project will continue to evolve with more features over time.

## 👨‍💻 Built by

**Divit**, SDSU '28 — with React, Vite, and coffee ☕
