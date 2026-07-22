# SkillSwap

A zero-money skill-barter platform. Trade time and knowledge instead of cash:
teach guitar, get taught to cook. Users spend and earn "credits" instead of
currency.

Built on a standard MERN stack + Socket.io — no backend-as-a-service vendor
lock-in (MongoDB's Stitch/App Services platform, an earlier design candidate,
reached end-of-life on Sept 30, 2025).

## Architecture

```
frontend (React + Vite + Tailwind)
   |  REST (axios, JWT bearer)         |  WebSocket (socket.io)
   v                                    v
backend (Express)  ---------------------------> MongoDB Atlas
   - /api/auth      signup / login
   - /api/users     profile, discovery feed
   - /api/matches   request / accept / complete (escrow) / review
   - /api/messages  chat history
   - sockets/chat   join_match, send_message (JWT-authed socket)
```

### Data model
- **User** — profile, skillsOffered, skillsWanted, walletBalance, rating
- **Match** — a swap between requester and provider; status: pending →
  accepted → completed; holds the review after completion
- **Message** — chat log scoped to a matchId

### The escrow step
`POST /api/matches/:id/complete` runs inside a MongoDB transaction
(`session.withTransaction`) so the credit debit/credit and the status change
either all succeed or all roll back — no risk of a user losing credits
without the swap completing. This replaces what the original design wanted a
serverless BaaS function to do; here it's plain, auditable application code.

### Access control
Chat history and socket rooms check that the requesting user is either the
`requester` or `provider` on that match before returning data or letting them
join — the same rule a BaaS "Data Access Rule" would enforce, written as a
normal middleware/handler check instead.

## Running locally

**Backend**
```
cd backend
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev
```

**Tests**
```
cd backend
npm install
npm test
```
Uses `mongodb-memory-server` (a real, in-process MongoDB replica set) so the
escrow transaction runs for real, not mocked. First run downloads a mongod
binary, so it needs internet access once.

**Frontend**
```
cd frontend
cp .env.example .env
npm install
npm run dev
```

MongoDB Atlas free tier works and supports transactions out of the box
(it's a replica set by default).

**Seed demo data** (optional, good for a live demo/interview walkthrough)
```
cd backend
npm run seed
```
Creates 3 demo users, one completed swap with a review, and one pending
swap. Login with any of the printed emails / password `demo1234`.

## Deploying
1. **Database**: create a free MongoDB Atlas (M0) cluster, get the connection string.
2. **Backend → Render**: push to GitHub, create a Web Service from the repo,
   set root directory to `backend`. `render.yaml` at the repo root has the
   config pre-filled — Render will pick it up automatically. Set `MONGO_URI`,
   `JWT_SECRET`, and `CLIENT_URL` (your Vercel URL) as environment variables.
3. **Frontend → Vercel**: import the repo, set root directory to `frontend`.
   `vercel.json` handles the SPA rewrite. Set `VITE_API_URL` and
   `VITE_SOCKET_URL` to your Render backend URL.
4. Update the backend's `CLIENT_URL` env var to the live Vercel URL once you
   have it, so CORS allows the deployed frontend.

## Roadmap / not yet built
- Password reset flow
- Pagination on the discovery feed
- Notification when a swap request comes in

## Why this stack
Every piece here (Express, MongoDB transactions, JWT auth, Socket.io, React)
is something you can point to directly in an interview and explain how it
works — deliberately avoided a managed backend platform that abstracts that
away, since that's the opposite of what a portfolio project should show.
