import { Annotation } from "app/ui/annotation";
import { Avatar, AvatarFallback, AvatarImage } from "app/ui/avatar";
import { Heading } from "app/ui/heading";
import { Skeleton } from "app/ui/skeleton";
import type { FC } from "react";

type Props = {
  trainee:
    | {
        id: string;
        name: string;
        image: string;
      }
    | undefined;
};
export const TraineeInfo: FC<Props> = ({ trainee }) => {
  if (!trainee) {
    return <TraineeInfoSkeleton />;
  }

  const { id, name, image } = trainee;

  return (
    <div className="inline-flex w-full flex-col items-center justify-start gap-2 px-4">
      <Avatar>
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{name}</AvatarFallback>
      </Avatar>
      <Heading level={1}>{name}</Heading>
      <Annotation>id: {id}</Annotation>
    </div>
  );
};

const TraineeInfoSkeleton: FC = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <Skeleton className="w-[100px] h-8" />
      <Skeleton className="w-[200px] h-4" />
    </div>
  );
};
