# PERN Stack WhatsApp Clone 💬

A real-time chat application with private messaging, user presence (online/offline), and chat history.

## 🚀 Features
- **Real-time Messaging:** Powered by Socket.io.
- **User Presence:** See who is online with green indicators.
- **Persistent Chat:** History saved in PostgreSQL.
- **Responsive UI:** Works on Desktop and Mobile.

## 🛠️ Tech Stack
- **Frontend:** React.js, Axios, Context API
- **Backend:** Node.js, Express, Socket.io
- **Database:** PostgreSQL

## ⚙️ Setup Instructions
1. **Clone the repo:** `git clone <your-url>`
2. **Install Backend deps:** `cd server && npm install`
3. **Install Frontend deps:** `cd client && npm install`
4. **Env Setup:** Create a `.env` in the server folder with `DATABASE_URL`.
5. **Run App:** `npm start` (Frontend) and `node index.js` (Backend).