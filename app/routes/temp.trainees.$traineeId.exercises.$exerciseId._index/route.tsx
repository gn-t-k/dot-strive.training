import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "app/features/auth/get-authenticator.server";
import { getTrainings } from "app/features/training/get-trainings";
import { TrainingCard } from "app/features/training/training-card";
import { useInViewport } from "app/ui/use-in-viewport";
import { addDays, format } from "date-fns";
import { type FC, useEffect, useRef, useState } from "react";

const LIMIT = 10;

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const user = await getAuthenticator(context, request).isAuthenticated(
    request,
  );
  if (!user) {
    return redirect("/login");
  }

  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const exerciseId = params["exerciseId"]!;
  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const traineeId = params["traineeId"]!;

  const { searchParams } = new URL(request.url);
  const cursorParam = searchParams.get("cursor");

  const defaultCursor = addDays(new Date(), 1);

  const getTrainingsResult = await getTrainings(context)({
    exerciseId,
    cursor: cursorParam !== null ? new Date(cursorParam) : defaultCursor,
    size: LIMIT,
  });
  if (getTrainingsResult.result === "failure") {
    throw new Error("Internal Server Error");
  }
  const edges = getTrainingsResult.data;
  const cursor =
    edges.length === 0
      ? null
      : format(
          edges.reduce((oldest, training) =>
            training.date < oldest.date ? training : oldest,
          ).date,
          "yyyy-MM-dd",
        );
  const hasMore = edges.length === LIMIT;

  return {
    traineeId,
    edges,
    cursor,
    hasMore,
  };
};

const Page: FC = () => {
  const { traineeId, ...initial } = useLoaderData<typeof loader>();

  const [trainings, setTrainings] = useState(initial.edges);
  const [cursor, setCursor] = useState<string | null>(initial.cursor);
  const [hasMore, setHasMore] = useState(initial.edges.length === LIMIT);
  const anchorRef = useRef<HTMLDivElement>(null);

  const fetcher = useFetcher<typeof loader>();

  useInViewport(anchorRef, (entry) => {
    if (
      entry.isIntersecting &&
      hasMore &&
      fetcher.state === "idle" &&
      cursor !== null
    ) {
      fetcher.submit({ cursor });
    }
  });

  useEffect(() => {
    if (fetcher.data === undefined) {
      return;
    }
    const { edges: edge, cursor, hasMore } = fetcher.data;

    setTrainings((prev) => [...prev, ...edge]);
    setCursor(cursor);
    setHasMore(hasMore);
  }, [fetcher.data]);

  return (
    trainings.length > 0 && (
      <div>
        <ol className="flex flex-col gap-8">
          {trainings.map((training) => (
            <li key={training.id}>
              <TrainingCard training={training} traineeId={traineeId} />
            </li>
          ))}
        </ol>
        <div ref={anchorRef} />
      </div>
    )
  );
};
export default Page;
