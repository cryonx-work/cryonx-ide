import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getFileById, updateFile, deleteFile } from "@/services/FileService";

interface RequestContext {
  params: { id: string };
}

export async function GET(req: NextRequest, ctx: RequestContext) {
  await connectDB();
  const file = await getFileById(ctx.params.id);
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
  return NextResponse.json(file);
}

export async function PUT(req: NextRequest, ctx: RequestContext) {
  await connectDB();
  const body = await req.json();

  try {
    const file = await updateFile(ctx.params.id, body);
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
    return NextResponse.json(file);
  } catch (err : unknown) {
    if (err instanceof Error) {
        if (err.message === "VERSION_CONFLICT") {
            const serverFile = await getFileById(ctx.params.id);
            return NextResponse.json(
                { error: "Version conflict", serverFile },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: err.message }, { status: 400 });
    } else {
    console.error("Unknown error:", err);
     
  }

    console.error("Unknown error:", err);
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: RequestContext) {
  await connectDB();
  const file = await deleteFile(ctx.params.id);
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
