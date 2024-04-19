import { Skeleton } from "app/ui/skeleton";

import type { FC } from "react";

export const TagsPageLoading: FC = () => {
  return (
    <ul className="flex flex-col gap-4 px-4">
      {Array.from({ length: 5 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 問題ないため
        <li key={index}>
          <Skeleton className="h-[80px]" />
        </li>
      ))}
    </ul>
  );
};
