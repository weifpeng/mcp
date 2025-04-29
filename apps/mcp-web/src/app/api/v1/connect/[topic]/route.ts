import { redis } from "@/provider/redis";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// 24 hours in seconds
const MESSAGE_EXPIRATION_TIME = 24 * 60 * 60;

interface IMessage {
  id: string;
  clientId: string;
  data: string;
  timestamp: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topic: string }> },
) {
  try {
    const urlParam = await params;
    const { searchParams } = new URL(req.url);
    const topic = z.string().length(64).parse(urlParam.topic);
    const clientId = z.string().min(1).parse(searchParams.get("client_id"));
    const id = searchParams.get("id") || uuidv4();
    const data = await req.text();

    await redis.rpush(`${topic}`, {
      id,
      clientId,
      data,
      timestamp: Date.now(),
    });

    // Set expiration time for the topic
    await redis.expire(`${topic}`, MESSAGE_EXPIRATION_TIME);

    return NextResponse.json({ code: 0, data: id });
  } catch (e) {
    return NextResponse.json(
      { code: 1, error: "Param error" },
      { status: 400 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ topic: string }> },
) {
  try {
    const urlParam = await params;
    const { searchParams } = new URL(req.url);
    const topic = z.string().length(64).parse(urlParam.topic);
    const clientId = z.string().min(1).parse(searchParams.get("client_id"));
    const start = z.coerce.number().default(0).parse(searchParams.get("start"));

    const messages = await redis.lrange<IMessage>(`${topic}`, 0, 99);

    const filteredMessages = messages.filter(
      (msg) => msg.clientId !== clientId && msg.timestamp > start,
    );

    return NextResponse.json({
      code: 0,
      messages: filteredMessages,
    });
  } catch (e) {
    return NextResponse.json(
      { code: 1, error: "Param error" },
      { status: 400 },
    );
  }
}
