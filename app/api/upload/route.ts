import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file received." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return NextResponse.json({
      success: true,
      imageData: {
        data: buffer,
        contentType: file.type
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error processing image" },
      { status: 500 }
    );
  }
}
