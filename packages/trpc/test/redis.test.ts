import "dotenv/config";
import { test } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { Redis } from "@upstash/redis";
 

const redis = new Redis({
  url: config.redisUrl,
  token: config.redisToken,
});

test("redis", async () => {
  const topic = uuidv4();
  const id = uuidv4();
  const clientId = uuidv4();
  const data = "test";

  await redis.rpush(`${topic}`, {
    id,
    clientId,
    data,
    timestamp: Date.now(),
  });

  await redis.rpush(`${topic}`, {
    id,
    clientId,
    data:uuidv4(),
    timestamp: Date.now(),
  });


  const messages = await redis.lrange(`${topic}`, 0, -1);

  console.log(messages[0]);
});

