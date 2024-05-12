import { Button } from "app/ui/button";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { Skeleton } from "app/ui/skeleton";

import type { FC } from "react";

export const ExercisesPageLoading: FC = () => {
  return (
    <Main>
      <header>
        <Heading level={1} size="lg">
          種目
        </Heading>
        <p className="text-muted-foreground">
          .STRIVEでは、トレーニングの種目を自由に登録・編集できます。
        </p>
        <p className="text-muted-foreground">
          種目の記録を追跡したり、量・強度・頻度を管理することができます。
        </p>
      </header>
      <Section>
        <Button variant="secondary">種目を登録する</Button>
      </Section>
      <Section>
        <Heading level={2}>登録されている種目</Heading>
        <ul className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 問題ないため
            <li key={index}>
              <Skeleton className="h-[108px]" />
            </li>
          ))}
        </ul>
      </Section>
    </Main>
  );
};
