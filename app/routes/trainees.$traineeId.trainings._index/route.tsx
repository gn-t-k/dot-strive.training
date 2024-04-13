import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getTrainingsByTraineeId } from "app/features/training/get-trainings-by-trainee-id";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import {} from "app/ui/alert-dialog";
import { Button } from "app/ui/button";
import { Card, CardContent, CardHeader } from "app/ui/card";
import {} from "app/ui/dropdown-menu";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { format, parseISO } from "date-fns";
import {} from "lucide-react";

import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { FC } from "react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(
    (response) => response.json(),
  );

  const getTrainingsResult = await getTrainingsByTraineeId(context)(trainee.id);
  if (getTrainingsResult.result === "failure") {
    throw new Response("Internal Server Error", { status: 500 });
  }
  const trainings = getTrainingsResult.data;

  return json({ trainee, trainings });
};

const Page: FC = () => {
  const { trainee, trainings } = useLoaderData<typeof loader>();

  return (
    <Main>
      <Section>
        <Button size="lg" asChild>
          <a href={`/trainees/${trainee.id}/trainings/new`}>
            トレーニングを登録する
          </a>
        </Button>
        <ol className="flex flex-col gap-8">
          {trainings.map((training) => {
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
      </Section>
    </Main>
  );
};
export default Page;

type TrainingSessionListProps = {
  sessions: {
    id: string;
    exercise: {
      name: string;
    };
    sets: {
      id: string;
      weight: number;
      repetition: number;
      rpe: number;
    }[];
    memo: string;
  }[];
};
const TrainingSessionList: FC<TrainingSessionListProps> = ({ sessions }) => {
  return (
    <ol className="flex flex-col gap-6">
      {sessions.map((session) => {
        return (
          <li key={session.id} className="flex flex-col gap-4">
            <Heading level={3} size="sm">
              {session.exercise.name}
            </Heading>
            <ol className="flex flex-col gap-2 px-4">
              {session.sets.map((set, setIndex) => {
                return (
                  <li key={set.id} className="grid grid-cols-7 items-center">
                    <div className="col-span-1">{setIndex + 1}</div>
                    <div className="col-span-2 flex items-end gap-1">
                      <span>{set.weight}</span>
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                    <div className="col-span-2 flex items-end gap-1">
                      <span>{set.repetition}</span>
                      <span className="text-sm text-muted-foreground">回</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-end gap-1">
                        <span className="text-sm text-muted-foreground">
                          RPE
                        </span>
                        <span>{set.rpe === 0 ? "-" : `${set.rpe}`}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            {session.memo && (
              <div className="rounded bg-muted p-4">
                <p className="text-muted-foreground">{session.memo}</p>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
};
