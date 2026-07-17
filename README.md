# CoupleConnect Game Hub

Real-time, 2-player web game platform for long-distance couples. No login —
just create a room, share the 6-character code, and play.

## Stack
- **Frontend:** React (Vite) + Tailwind CSS + Framer Motion + Zustand + Socket.io-client
- **Backend:** Node.js + Express + Socket.io, in-memory room state, Dockerized

## Running locally

### Backend
```bash
cd backend
npm install
npm run dev      # nodemon, http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Set `VITE_SOCKET_URL` in a `frontend/.env` file if your backend isn't on
`http://localhost:4000`.

## Docker (backend)
```bash
cd backend
docker build -t coupleconnect-backend .
docker run -p 4000:4000 --env-file .env coupleconnect-backend
```

## Games included
- **Snakes & Ladders** — 100-tile board; every 6 cumulative steps triggers a Truth or Dare card.
- **Monopoly (LDR Edition)** — custom 40-tile board; Chance/Community Chest tiles replaced with Truth or Dare.
- **Ludo** — 2-player simplified 4-token version; rolling a 6 triggers Truth or Dare.
- **Chess** — full piece movement rules (pawn/knight/bishop/rook/queen/king); capturing a piece triggers Truth or Dare. Note: check/checkmate detection is simplified — a king capture ends the game.

## Assets
Drop dice-roll / piece-move / card-draw MP3s into `frontend/src/assets/sounds/`
and any board/background art into `frontend/src/assets/images/` — both folders
are wired up and ready, just currently empty placeholders (binary audio/image
files aren't something this scaffold can generate).
