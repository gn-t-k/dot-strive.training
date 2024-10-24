import { Button } from "app/ui/button";
import { Checkbox } from "app/ui/checkbox";
import { Input } from "app/ui/input";
import { Label } from "app/ui/label";
import { Skeleton } from "app/ui/skeleton";
import type { FC } from "react";

export const ExerciseFormSkeleton: FC = () => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="space-y-2">
        <Label>名前</Label>
        <Input />
      </div>
      <fieldset className="space-y-2">
        <Label asChild>
          <legend>タグ</legend>
        </Label>
        <div className="flex items-center space-x-1">
          <Checkbox type="button" />
          <Skeleton className="h-[16px] w-[200px]" />
        </div>
      </fieldset>
      <Button>登録</Button>
    </div>
  );
};
