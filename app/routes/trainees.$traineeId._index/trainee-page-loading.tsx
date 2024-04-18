import { Button } from "app/ui/button";
import { Skeleton } from "app/ui/skeleton";
import type { FC } from "react";

export const TraineePageLoading: FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 mt-4 px-4">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-[100px] h-8" />
        <Skeleton className="w-[200px] h-4" />
      </div>
      <Button className="w-full">ログアウト</Button>
      <Button variant="destructive" className="w-full">
        アカウントを削除
      </Button>
    </div>
  );
};
