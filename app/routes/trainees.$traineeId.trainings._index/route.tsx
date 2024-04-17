import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { getTrainingsByTraineeId } from "app/features/training/get-trainings-by-trainee-id";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import { Button } from "app/ui/button";
import { Card, CardContent, CardHeader } from "app/ui/card";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import {
  endOfDay,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";

import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Calendar } from "app/ui/calendar";
import { type FC, useCallback, useMemo, useState } from "react";
import type { MonthChangeEventHandler } from "react-day-picker";

import { headers as mergeHeaders } from "app/utils/merge-headers.server";
import { TrainingSessionList } from "./trainingt-session-list";

export const headers = mergeHeaders;

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { time, getServerTimingHeader } = context.serverTiming;

  const { trainee } = await time("traineeLoader", async () => {
    return await traineeLoader({ context, request, params }).then((response) =>
      response.json(),
    );
  });
  const today = new Date();
  const dateRange = ((month: string | null) => {
    const date = month ? parseISO(month) : today;

    return { from: startOfMonth(date), to: endOfMonth(date) };
  })(new URL(request.url).searchParams.get("month"));

  const getTrainingsResult = await time("getTrainingsByTraineeId", async () => {
    return await getTrainingsByTraineeId(context)(trainee.id, dateRange);
  });
  if (getTrainingsResult.result === "failure") {
    throw new Response("Internal Server Error", { status: 500 });
  }
  const trainings = getTrainingsResult.data;

  return json(
    { trainee, trainings },
    {
      headers: getServerTimingHeader(),
    },
  );
};

const Page: FC = () => {
  const { trainee, trainings } = useLoaderData<typeof loader>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date();

  const defaultMonth = useMemo<Date>(() => {
    const month = searchParams.get("month");
    return month ? new Date(month) : today;
  }, [searchParams.get, today]);
  const filteredTrainings = useMemo(() => {
    if (!selectedDate) {
      return trainings;
    }
    const from = startOfDay(selectedDate);
    const to = endOfDay(selectedDate);
    return trainings.filter((training) => {
      const date = parseISO(training.date);
      return from <= date && date <= to;
    });
  }, [selectedDate, trainings]);

  const hasTrainings = useCallback<(date: Date) => boolean>(
    (date) => trainings.some((training) => isSameDay(date, training.date)),
    [trainings],
  );
  const onMonthChange = useCallback<MonthChangeEventHandler>(
    (month) => {
      setSelectedDate(undefined);
      searchParams.set("month", format(month, "yyyy-MM"));
      setSearchParams(searchParams, { preventScrollReset: true });
    },
    [searchParams, setSearchParams],
  );

  return (
    <Main>
      <Section>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          defaultMonth={defaultMonth}
          onMonthChange={onMonthChange}
          modifiers={{ hasTrainings }}
          modifiersClassNames={{
            hasTrainings:
              "after:absolute after:top-6 after:h-2 after:w-2 after:rounded-full after:bg-primary after:aria-selected:bg-primary-foreground",
          }}
          showOutsideDays={false}
        />
      </Section>
      <Section>
        {selectedDate ? (
          <Button size="lg" asChild>
            <Link
              to={`/trainees/${trainee.id}/trainings/new?date=${format(
                selectedDate,
                "yyyy-MM-dd",
              )}`}
            >
              {isSameDay(today, selectedDate)
                ? "今日"
                : format(selectedDate, "yyyy年MM月dd日")}
              のトレーニングを登録する
            </Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link
              to={`/trainees/${trainee.id}/trainings/new?date=${format(
                today,
                "yyyy-MM-dd",
              )}`}
            >
              今日のトレーニングを登録する
            </Link>
          </Button>
        )}
        {filteredTrainings.length > 0 && (
          <ol className="flex flex-col gap-8">
            {filteredTrainings.map((training) => {
              const dateString = format(
                parseISO(training.date),
                "yyyy年MM月dd日",
              );
              return (
                <li key={training.id}>
                  <Link to={`/trainees/${trainee.id}/trainings/${training.id}`}>
                    <Card>
                      <CardHeader>
                        <Heading level={2}>{dateString}</Heading>
                      </CardHeader>
                      <CardContent>
                        <TrainingSessionList sessions={training.sessions} />
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </Section>
    </Main>
  );
};
export default Page;
