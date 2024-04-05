import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import type { FC } from "react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(
    (response) => response.json(),
  );

  return json({ trainee });
};

const Page: FC = () => {
  const { trainee } = useLoaderData<typeof loader>();

  return <p>trainee: {trainee.name}</p>;
};
export default Page;
