import { Link } from "@remix-run/react";
import { Badge } from "app/ui/badge";
import { Card, CardHeader } from "app/ui/card";
import { Heading } from "app/ui/heading";
import { Skeleton } from "app/ui/skeleton";
import type { FC } from "react";

type Props = {
  traineeId: string;
  exercises: Exercise[] | undefined;
};
type Exercise = { id: string; name: string; tags: Tag[] };
type Tag = { id: string; name: string };
export const RegisteredExerciseList: FC<Props> = ({ traineeId, exercises }) => {
  return (
    <ul className="flex flex-col gap-4">
      {exercises === undefined ? (
        <RegisteredExerciseListSkeleton />
      ) : (
        exercises.map((exercise) => {
          return (
            <li key={exercise.id}>
              <Card>
                <CardHeader className="flex flex-col gap-2">
                  <Link to={`/trainees/${traineeId}/exercises/${exercise.id}`}>
                    <Heading level={2} className="underline">
                      {exercise.name}
                    </Heading>
                  </Link>
                  <ul className="inline leading-relaxed">
                    {exercise.tags.map((tag, index) => {
                      return (
                        <li className="inline mr-1" key={`${index}_${tag}`}>
                          <Link to={`/trainees/${traineeId}/tags/${tag.id}`}>
                            <Badge variant="outline">#{tag.name}</Badge>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardHeader>
              </Card>
            </li>
          );
        })
      )}
    </ul>
  );
};

const RegisteredExerciseListSkeleton: FC = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: 問題ないため
    <li key={index}>
      <Skeleton className="h-[108px]" />
    </li>
  ));
};
