import request from "supertest";
import { createApp } from "../app.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";

const app = createApp();

async function signup(name, email) {
  const res = await request(app).post("/api/auth/signup").send({
    name,
    email,
    password: "password123",
  });
  return res.body; // { token, user }
}

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe("escrow transfer", () => {
  test("moves a credit from requester to provider on completion", async () => {
    const requester = await signup("Alice", "alice@example.com");
    const provider = await signup("Bob", "bob@example.com");

    const createRes = await request(app)
      .post("/api/matches")
      .set("Authorization", `Bearer ${requester.token}`)
      .send({ providerId: provider.user.id, skill: "Guitar coaching" });
    expect(createRes.status).toBe(201);
    const matchId = createRes.body._id;

    await request(app)
      .patch(`/api/matches/${matchId}/accept`)
      .set("Authorization", `Bearer ${provider.token}`)
      .expect(200);

    const completeRes = await request(app)
      .post(`/api/matches/${matchId}/complete`)
      .set("Authorization", `Bearer ${requester.token}`);
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.status).toBe("completed");

    const requesterAfter = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${requester.token}`);
    const providerAfter = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${provider.token}`);

    // Both start with 3 credits by default.
    expect(requesterAfter.body.walletBalance).toBe(2);
    expect(providerAfter.body.walletBalance).toBe(4);
  });

  test("rejects completion when requester has insufficient credits", async () => {
    const requester = await signup("Alice", "alice2@example.com");
    const provider = await signup("Bob", "bob2@example.com");

    // Drain the requester's balance with two prior matches against provider
    // by directly running the flow twice, then a third should fail on the
    // fourth credit (they start with 3).
    for (let i = 0; i < 3; i++) {
      const createRes = await request(app)
        .post("/api/matches")
        .set("Authorization", `Bearer ${requester.token}`)
        .send({ providerId: provider.user.id, skill: `Skill ${i}` });
      const matchId = createRes.body._id;
      await request(app)
        .patch(`/api/matches/${matchId}/accept`)
        .set("Authorization", `Bearer ${provider.token}`);
      await request(app)
        .post(`/api/matches/${matchId}/complete`)
        .set("Authorization", `Bearer ${requester.token}`);
    }

    const createRes = await request(app)
      .post("/api/matches")
      .set("Authorization", `Bearer ${requester.token}`)
      .send({ providerId: provider.user.id, skill: "One more" });
    const matchId = createRes.body._id;
    await request(app)
      .patch(`/api/matches/${matchId}/accept`)
      .set("Authorization", `Bearer ${provider.token}`);

    const res = await request(app)
      .post(`/api/matches/${matchId}/complete`)
      .set("Authorization", `Bearer ${requester.token}`);

    expect(res.status).toBe(402);
    expect(res.body.error).toMatch(/insufficient/i);
  });

  test("blocks a non-participant from completing the match", async () => {
    const requester = await signup("Alice", "alice3@example.com");
    const provider = await signup("Bob", "bob3@example.com");
    const outsider = await signup("Eve", "eve3@example.com");

    const createRes = await request(app)
      .post("/api/matches")
      .set("Authorization", `Bearer ${requester.token}`)
      .send({ providerId: provider.user.id, skill: "Cooking" });
    const matchId = createRes.body._id;
    await request(app)
      .patch(`/api/matches/${matchId}/accept`)
      .set("Authorization", `Bearer ${provider.token}`);

    const res = await request(app)
      .post(`/api/matches/${matchId}/complete`)
      .set("Authorization", `Bearer ${outsider.token}`);

    expect(res.status).toBe(403);
  });
});

describe("chat access control", () => {
  test("blocks a non-participant from reading match messages", async () => {
    const requester = await signup("Alice", "alice4@example.com");
    const provider = await signup("Bob", "bob4@example.com");
    const outsider = await signup("Eve", "eve4@example.com");

    const createRes = await request(app)
      .post("/api/matches")
      .set("Authorization", `Bearer ${requester.token}`)
      .send({ providerId: provider.user.id, skill: "Painting" });
    const matchId = createRes.body._id;

    const res = await request(app)
      .get(`/api/messages/${matchId}`)
      .set("Authorization", `Bearer ${outsider.token}`);

    expect(res.status).toBe(403);
  });
});
