import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", bio: "", skillsOffered: "", skillsWanted: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/users/me").then((r) => {
      const u = r.data;
      setForm({
        name: u.name,
        bio: u.bio || "",
        skillsOffered: u.skillsOffered.join(", "),
        skillsWanted: u.skillsWanted.join(", "),
      });
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await api.patch("/users/me", {
      name: form.name,
      bio: form.bio,
      skillsOffered: form.skillsOffered.split(",").map((s) => s.trim()).filter(Boolean),
      skillsWanted: form.skillsWanted.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => navigate("/dashboard"), 600);
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <h1 className="font-display text-3xl mb-6">Edit profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Name"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <textarea className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Short bio"
          value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Skills you offer (comma separated)"
          value={form.skillsOffered} onChange={(e) => setForm({ ...form, skillsOffered: e.target.value })} />
        <input className="w-full border border-ink/20 rounded px-3 py-2" placeholder="Skills you want (comma separated)"
          value={form.skillsWanted} onChange={(e) => setForm({ ...form, skillsWanted: e.target.value })} />
        <button className="w-full bg-ink text-paper rounded py-2" type="submit">
          {saved ? "Saved ✓" : "Save"}
        </button>
      </form>
      <p className="mt-4 text-sm"><Link className="underline" to="/dashboard">Back to dashboard</Link></p>
    </div>
  );
}
