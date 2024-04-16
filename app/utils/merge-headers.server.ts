import type { HeadersFunction } from "@remix-run/cloudflare";

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return setDefaultHeaders(new Headers(), {
    loaderHeaders,
    parentHeaders,
  });
};
export function setDefaultHeaders(
  headers: Headers,
  args: {
    loaderHeaders: Headers;
    parentHeaders: Headers;
  },
) {
  const loaderServerTimingHeader = args.loaderHeaders.get("Server-Timing");
  if (loaderServerTimingHeader) {
    headers.set("Server-Timing", loaderServerTimingHeader);
  }
  const parentServerTimingHeader = args.parentHeaders.get("Server-Timing");
  if (parentServerTimingHeader) {
    headers.append("Server-Timing", parentServerTimingHeader);
  }
  return headers;
}
