import { useNavigation } from "@remix-run/react";
import { Button } from "app/ui/button";
import { Calendar } from "app/ui/calendar";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { type FC, useMemo } from "react";
import { GenericSkeleton } from "../trainees.$traineeId/generic-content-skeleton";

export const TrainingsPageLoading: FC = () => {
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
        <Calendar defaultMonth={defaultMonth} showOutsideDays={false} />
      </Section>
      <Section>
        <Button size="lg">今日のトレーニングを登録する</Button>
        <GenericSkeleton />
      </Section>
    </Main>
  );
};
