import { uploadthingRouter } from "./core";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Handle uploadthing requests
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
