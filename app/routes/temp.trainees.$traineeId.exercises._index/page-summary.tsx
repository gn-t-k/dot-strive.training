import { Heading } from "app/ui/heading";
import type { FC } from "react";

export const PageSummary: FC = () => {
  return (
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
  );
};
