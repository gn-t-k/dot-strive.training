import { Heading } from "app/ui/heading";
import type { FC } from "react";

type Props = {
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
export const TrainingSessionList: FC<Props> = ({ sessions }) => {
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
