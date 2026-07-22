import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

let replSet;

export async function setupTestDB() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
}

export async function teardownTestDB() {
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
