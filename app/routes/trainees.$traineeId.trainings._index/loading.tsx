import { Link, useNavigation } from "@remix-run/react";
import { Button } from "app/ui/button";
import { Calendar } from "app/ui/calendar";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { format } from "date-fns";
import { type FC, useMemo } from "react";
import { MainContentSkeleton } from "../trainees.$traineeId/main-content-skeleton";

type Props = {
  traineeId: string;
};
export const TrainingsPageLoading: FC<Props> = ({ traineeId }) => {
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
        <Button size="lg" asChild>
          <Link
            to={`/trainees/${traineeId}/trainings/new?date=${format(
              today,
              "yyyy-MM-dd",
            )}`}
          >
            今日のトレーニングを登録する
          </Link>
        </Button>
        <MainContentSkeleton />
      </Section>
    </Main>
  );
};
