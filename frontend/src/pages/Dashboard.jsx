import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [feed, setFeed] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api.get("/users/me").then((r) => setMe(r.data));
    api.get("/users/discover").then((r) => setFeed(r.data));
    api.get("/matches").then((r) => setMatches(r.data));
  }, []);

  async function requestSwap(providerId, skill) {
    await api.post("/matches", { providerId, skill });
    await refreshMatches();
  }

  async function refreshMatches() {
    const { data } = await api.get("/matches");
    setMatches(data);
  }

  async function acceptMatch(id) {
    await api.patch(`/matches/${id}/accept`);
    await refreshMatches();
  }

  async function completeMatch(id) {
    await api.post(`/matches/${id}/complete`);
    await refreshMatches();
    const { data } = await api.get("/users/me");
    setMe(data);
  }

  async function submitReview(id, rating) {
    await api.post(`/matches/${id}/review`, { rating });
    await refreshMatches();
  }

  if (!me) return <p className="p-8">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl">Hi, {me.name}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm bg-clay text-paper px-3 py-1 rounded-full">
            {me.walletBalance} credits
          </span>
          <Link className="text-sm underline" to="/profile">Edit profile</Link>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="font-display text-xl mb-3">People who teach what you want</h2>
        {feed.length === 0 && <p className="text-sm text-ink/60">No matches yet — add skills you want on your profile.</p>}
        <ul className="space-y-3">
          {feed.map((u) => (
            <li key={u.id} className="border border-ink/10 rounded p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-ink/60">Offers: {u.skillsOffered.join(", ") || "—"}</p>
              </div>
              <button
                className="text-sm border border-ink rounded px-3 py-1"
                onClick={() => requestSwap(u.id, u.skillsOffered[0] || "skill")}
              >
                Request swap
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Your matches</h2>
        <ul className="space-y-3">
          {matches.map((m) => {
            const isProvider = m.provider?._id === me.id;
            const isRequester = m.requester?._id === me.id;
            return (
              <li key={m._id} className="border border-ink/10 rounded p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{m.skill}</p>
                    <p className="text-sm text-ink/60">
                      Status: {m.status} · with {isProvider ? m.requester?.name : m.provider?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link className="text-sm underline" to={`/chat/${m._id}`}>Chat</Link>
                    {m.status === "pending" && isProvider && (
                      <button className="text-sm border border-ink rounded px-3 py-1" onClick={() => acceptMatch(m._id)}>
                        Accept
                      </button>
                    )}
                    {m.status === "accepted" && (isRequester || isProvider) && (
                      <button className="text-sm border border-ink rounded px-3 py-1" onClick={() => completeMatch(m._id)}>
                        Mark complete
                      </button>
                    )}
                    {m.status === "completed" && isRequester && !m.review?.rating && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} className="text-sm" onClick={() => submitReview(m._id, n)}>
                            ★
                          </button>
                        ))}
                      </div>
                    )}
                    {m.review?.rating && (
                      <span className="text-sm text-ink/60">Rated {m.review.rating}★</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
