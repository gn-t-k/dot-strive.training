import type { NextRequest, NextResponse } from "next/server";

// https://nextjs.org/docs/app/api-reference/file-conventions/route
export type RouteHandler<Body = unknown> = (
  request: NextRequest,
  context?: Context
) => NextResponse<Body | Error> | Promise<NextResponse<Body | Error>>;
type Context = { params: { [key: string]: string } };
type Error = { error: string };
