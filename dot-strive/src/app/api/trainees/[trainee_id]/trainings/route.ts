import { NextResponse } from "next/server";

export const POST = async (req: Request): Promise<Response> => {
  return NextResponse.json({ req });
};
