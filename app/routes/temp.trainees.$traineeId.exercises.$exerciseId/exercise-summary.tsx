import { Link } from "@remix-run/react";
import { Badge } from "app/ui/badge";
import { Heading } from "app/ui/heading";
import { Skeleton } from "app/ui/skeleton";
import type { FC } from "react";

type Props = {
  traineeId: string;
  exercise:
    | { id: string; name: string; tags: { id: string; name: string }[] }
    | undefined;
};
export const ExerciseSummary: FC<Props> = ({ traineeId, exercise }) => {
  if (exercise === undefined) {
    return <ExerciseSummarySkeleton />;
  }

  return (
    <div className="flex flex-col gap-2">
      <Heading level={1} size="lg">
        {exercise.name}
      </Heading>
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
    </div>
  );
};

const ExerciseSummarySkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Skeleton className="h-[44px]" />
      <ul className="flex">
        {Array.from({ length: 3 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 問題ないため
          <li className="mr-1" key={index}>
            <Skeleton className="w-[80px] h-[26px] px-2.5 py-0.5 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
};
