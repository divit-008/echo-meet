# Echo Meet

[👉 Try the Live App](https://echo-meet-eight.vercel.app)

Echo Meet is a modern, browser-based video conferencing application designed for simplicity and speed. Whether you're hosting a quick team call or joining a friend via a meeting link, Echo Meet provides a seamless experience with minimal setup.

**Version:** 1.0.0

**Echo Meet** is a lightweight, real-time video meeting app built with React, Vite, Supabase, and WebRTC. It supports Google authentication, room creation via code or link, and a clean, responsive UI.
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

* **Frontend:** React + Vite + TypeScript
* **Auth & DB:** Supabase (PostgreSQL)
* **P2P Streaming:** WebRTC via PeerJS
* **Styling:** Tailwind CSS

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

Feel free to fork and contribute! Pull requests are welcome. More features will continue to be added.

## 👨‍💻 Built by

**Divit**, SDSU '28 — with React, Vite, and coffee ☕
