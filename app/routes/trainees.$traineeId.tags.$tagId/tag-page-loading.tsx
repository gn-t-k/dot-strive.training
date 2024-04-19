import { Button } from "app/ui/button";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { Skeleton } from "app/ui/skeleton";

import type { FC } from "react";

export const TagPageLoading: FC = () => {
  return (
    <Main>
      <Section>
        <Skeleton className="h-[40px]" />
      </Section>
      <Section>
        <Button variant="destructive">タグを削除する</Button>
      </Section>
    </Main>
  );
};
