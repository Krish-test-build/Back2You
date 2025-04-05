import { NextResponse } from 'next/server';
import Image from '@/lib/models/image.model';
import { connectToDB } from '@/lib/mongoose';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const newImage = await Image.create({
      name: file.name,
      image: {
        data: buffer,
        contentType: file.type
      }
    });

    return NextResponse.json({ 
      success: true, 
      imageId: newImage._id 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: "Error uploading image" }, { status: 500 });
  }
}
