import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { trainees as traineesSchema } from "database/tables/trainees";
import { drizzle } from "drizzle-orm/d1";
import type { FC } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const db = drizzle(context.cloudflare.env.DB);
  const trainees = await db
    .select({ id: traineesSchema.id })
    .from(traineesSchema)
    .all();

  const url = new URL(request.url);
  const { origin } = url;

  return json({ trainees, origin });
};

const Index: FC = () => {
  const { trainees, origin } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix (with Vite and Cloudflare)</h1>
      <p>trainees: {trainees.length}</p>
      <p>origin: {origin}</p>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/"
            rel="noreferrer"
          >
            Cloudflare Pages Docs - Remix guide
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
};
export default Index;
