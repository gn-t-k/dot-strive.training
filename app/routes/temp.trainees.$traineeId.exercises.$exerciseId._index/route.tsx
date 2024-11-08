import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "app/features/auth/get-authenticator.server";
import { getTrainings } from "app/features/training/get-trainings";
import { TrainingCard } from "app/features/training/training-card";
import { useInViewport } from "app/ui/use-in-viewport";
import { isValidNumberString } from "app/utils/is-valid-number-string";
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
  const dateParam = searchParams.get("date");
  const weightParam = searchParams.get("weight");
  const repetitionParam = searchParams.get("repetition");

  const pagination =
    dateParam !== null
      ? { date: dateParam }
      : {
          cursor:
            cursorParam !== null
              ? new Date(cursorParam)
              : addDays(new Date(), 1),
          size: LIMIT,
        };

  const getTrainingsResult = await getTrainings(context)({
    exerciseId,
    ...pagination,
    weight:
      weightParam !== null && isValidNumberString(weightParam)
        ? Number(weightParam)
        : undefined,
    repetition:
      repetitionParam !== null && isValidNumberString(repetitionParam)
        ? Number(repetitionParam)
        : undefined,
  });
  if (getTrainingsResult.result === "failure") {
    throw new Error("Internal Server Error");
  }
  const edges = getTrainingsResult.data;
  const cursor =
    edges.length > 0
      ? format(
          edges.reduce((oldest, training) =>
            training.date < oldest.date ? training : oldest,
          ).date,
          "yyyy-MM-dd",
        )
      : null;

  return {
    traineeId,
    edges,
    cursor,
  };
};

const Page: FC = () => {
  const { traineeId, ...initial } = useLoaderData<typeof loader>();

  const [trainings, setTrainings] = useState(initial.edges);
  const [cursor, setCursor] = useState<string | null>(initial.cursor);
  const anchorRef = useRef<HTMLDivElement>(null);

  const fetcher = useFetcher<typeof loader>();

  useInViewport(anchorRef, (entry) => {
    if (entry.isIntersecting && fetcher.state === "idle" && cursor !== null) {
      fetcher.submit({ cursor });
    }
  });

  useEffect(() => {
    if (fetcher.data === undefined) {
      return;
    }
    const { edges: edge, cursor } = fetcher.data;

    setTrainings((prev) => [...prev, ...edge]);
    setCursor(cursor);
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
