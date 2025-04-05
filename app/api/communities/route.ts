import { NextResponse } from "next/server";
import { createCommunityFromForm } from "@/lib/actions/community.actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const community = await createCommunityFromForm(body);
    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
