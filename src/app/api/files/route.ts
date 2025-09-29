import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { createFile, listFiles } from "@/services/FileService";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  try {
    const file = await createFile(body);
    return NextResponse.json(file, { status: 201 });
  } catch (err : unknown) {
    if (err instanceof Error){
        return NextResponse.json({ error: err.message }, { status: 400 });
    }else{
        return NextResponse.json({ error: "Unknown error"}, { status: 400 });
    }
   
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const files = await listFiles(projectId || undefined);
  return NextResponse.json(files);
}
