import { useNavigation } from "@remix-run/react";
import { Button } from "app/ui/button";
import { Calendar } from "app/ui/calendar";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { Skeleton } from "app/ui/skeleton";

import { type FC, useMemo } from "react";
import { SetCountChart } from "../../features/training/set-count-chart";

export const TagPageLoading: FC = () => {
  const navigation = useNavigation();
  const today = new Date();
  const searchParams = new URLSearchParams(navigation.location?.search);
  const defaultMonth = useMemo<Date>(() => {
    const month = searchParams.get("month");
    return month ? new Date(month) : today;
  }, [searchParams.get, today]);

  return (
    <Main>
      <Section>
        <Skeleton className="h-[40px]" />
      </Section>
      <Section>
        <Heading level={2}>記録</Heading>
        <Calendar defaultMonth={defaultMonth} showOutsideDays={false} />
        <SetCountChart
          defaultMonth={defaultMonth}
          selectedDate={undefined}
          selectDate={() => {
            return;
          }}
          trainings={[]}
        />
      </Section>
      <Section>
        <Button variant="destructive">タグを削除する</Button>
      </Section>
    </Main>
  );
};
