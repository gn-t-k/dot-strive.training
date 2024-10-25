import { Link } from "@remix-run/react";
import { Skeleton } from "app/ui/skeleton";
import { format } from "date-fns";
import type { FC } from "react";

type Props = {
  traineeId: string;
  maxTraining:
    | {
        id: string;
        estimatedMaximumWeight: number;
        date: Date;
      }
    | undefined;
};
export const MaxTrainingLink: FC<Props> = ({ traineeId, maxTraining }) => {
  if (maxTraining === undefined) {
    return <MaxTrainingLinkSkeleton />;
  }

  return (
    <span>
      推定1RM: {maxTraining.estimatedMaximumWeight}kg （
      {
        <Link
          className="text-muted-foreground underline"
          to={`/trainees/${traineeId}/trainings/${maxTraining.id}`}
        >
          {format(maxTraining.date, "yyyy年MM月dd日")}
        </Link>
      }
      ）
    </span>
  );
};

const MaxTrainingLinkSkeleton: FC = () => {
  return <Skeleton className="w-[100px] h-[24px] rounded-full" />;
};
