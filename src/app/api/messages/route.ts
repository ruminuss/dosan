import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { filterContent } from "@/lib/privacy-filter";
import { createHash } from "crypto";
import {
  RATE_LIMIT_SECONDS,
  MAX_NICKNAME_LENGTH,
  MAX_MESSAGE_LENGTH,
  MIN_MESSAGE_LENGTH,
  MESSAGES_PER_PAGE,
} from "@/lib/constants";

function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = MESSAGES_PER_PAGE;

  let query = supabase
    .from("messages")
    .select("id, nickname, nationality, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }

  return NextResponse.json({
    messages: data,
    nextCursor: data.length === limit ? data[data.length - 1].created_at : null,
  });
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const ip = getClientIP(req);
  const ipHash = hashIP(ip);

  let body: { nickname?: string; nationality?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { nickname, nationality = "KR", message } = body;

  if (!nickname || !message) {
    return NextResponse.json({ error: "Nickname and message are required" }, { status: 400 });
  }
  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return NextResponse.json({ error: `Nickname must be ${MAX_NICKNAME_LENGTH} chars or less` }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message must be ${MAX_MESSAGE_LENGTH} chars or less` }, { status: 400 });
  }
  if (message.trim().length < MIN_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message must be at least ${MIN_MESSAGE_LENGTH} chars` }, { status: 400 });
  }

  const nicknameFilter = filterContent(nickname);
  if (nicknameFilter.blocked) {
    const errorKey = nicknameFilter.reason === "name" ? "errorName"
      : nicknameFilter.reason === "location" ? "errorLocation" : "errorContact";
    return NextResponse.json({ error: errorKey }, { status: 400 });
  }

  const messageFilter = filterContent(message);
  if (messageFilter.blocked) {
    const errorKey = messageFilter.reason === "name" ? "errorName"
      : messageFilter.reason === "location" ? "errorLocation" : "errorContact";
    return NextResponse.json({ error: errorKey }, { status: 400 });
  }

  const { data: lastMessage } = await supabase
    .from("messages")
    .select("created_at")
    .eq("ip_hash", ipHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (lastMessage) {
    const elapsed = (Date.now() - new Date(lastMessage.created_at).getTime()) / 1000;
    if (elapsed < RATE_LIMIT_SECONDS) {
      return NextResponse.json({ error: "errorRateLimit" }, { status: 429 });
    }
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      nickname: nickname.trim(),
      nationality,
      message: message.trim(),
      ip_hash: ipHash,
    })
    .select("id, nickname, nationality, message, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }

  return NextResponse.json({ message: data }, { status: 201 });
}
