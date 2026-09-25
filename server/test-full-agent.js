import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { runAgent } from './agent/agent.js';

dotenv.config();

async function testFullAgent() {
  const mongoUri = process.env.MONGODB_URI ? `${process.env.MONGODB_URI}/quickshow` : "mongodb://127.0.0.1:27017/quickshow";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB for agent test");

  console.log("\nTesting: 'What comedy movies are playing today?'");
  const res1 = await runAgent("What comedy movies are playing today?");
  console.log("\nAgent Message:", res1.message);
  console.log("Returned Shows count:", res1.shows.length);
  if (res1.shows.length > 0) {
    console.log("First Show:", res1.shows[0]);
  }

  process.exit(0);
}

testFullAgent().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
