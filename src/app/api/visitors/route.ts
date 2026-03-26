import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createHash } from "crypto";

function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function GET() {
  const supabase = createServerClient();

  const [totalResult, todayResult, messageCountResult] = await Promise.all([
    supabase.from("visitors").select("*", { count: "exact", head: true }),
    supabase
      .from("visitors")
      .select("*", { count: "exact", head: true })
      .eq("visited_at", new Date().toISOString().split("T")[0]),
    supabase.from("messages").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    visitors: {
      total: totalResult.count ?? 0,
      today: todayResult.count ?? 0,
    },
    messageCount: messageCountResult.count ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const ip = getClientIP(req);
  const ipHash = hashIP(ip);

  await supabase.from("visitors").upsert(
    { ip_hash: ipHash, visited_at: new Date().toISOString().split("T")[0] },
    { onConflict: "ip_hash,visited_at", ignoreDuplicates: true }
  );

  return NextResponse.json({ ok: true });
}
