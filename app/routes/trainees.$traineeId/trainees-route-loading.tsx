import { useNavigation } from "@remix-run/react";
import type { FC } from "react";
import { TraineePageLoading } from "../trainees.$traineeId._index/trainee-page-loading";
import { ExercisesPageLoading } from "../trainees.$traineeId.exercises._index/exercises-page-loading";
import { TrainingsPageLoading } from "../trainees.$traineeId.trainings._index/trainings-page-loading";
import { GenericSkeleton } from "./generic-content-skeleton";

export const TraineesRouteLoading: FC = () => {
  const { location } = useNavigation();
  if (!location) {
    return null;
  }
  const { pathname } = location;

  // TODO: ページごとにローディングコンポーネントを追加する

  if (/^\/trainees\/[^\/]+\/?$/.test(pathname)) {
    return <TraineePageLoading />;
  }
  if (pathname.match(/^\/trainees\/[^\/]+\/exercises\/?$/)) {
    return <ExercisesPageLoading />;
  }
  if (pathname.match(/^\/trainees\/[^\/]+\/trainings\/?$/)) {
    return <TrainingsPageLoading />;
  }

  return <GenericSkeleton />;
};
