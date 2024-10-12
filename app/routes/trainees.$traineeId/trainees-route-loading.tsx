import { useNavigation } from "@remix-run/react";
import type { FC } from "react";
import { TraineePageLoading } from "../trainees.$traineeId._index/trainee-page-loading";
import { ExercisePageLoading } from "../trainees.$traineeId.exercises.$exerciseId/exercise-page-loading";
import { ExercisesPageLoading } from "../trainees.$traineeId.exercises._index/exercises-page-loading";
import { TagPageLoading } from "../trainees.$traineeId.tags.$tagId/tag-page-loading";
import { TagsPageLoading } from "../trainees.$traineeId.tags._index/tags-page-loading";
import { TrainingsPageLoading } from "../trainees.$traineeId.trainings._index/trainings-page-loading";
import { GenericSkeleton } from "./generic-content-skeleton";

export const TraineesRouteLoading: FC = () => {
  const { location } = useNavigation();
  if (!location) {
    return null;
  }
  const { pathname } = location;

  // TODO: ページごとにローディングコンポーネントを追加する

  if (pathname.match(traineesPagePathnameRegex)) {
    return <TraineePageLoading />;
  }
  if (pathname.match(tagsPagePathnameRegex)) {
    return <TagsPageLoading />;
  }
  if (pathname.match(tagPagePathnameRegex)) {
    return <TagPageLoading />;
  }
  if (pathname.match(exercisesPagePathnameRegex)) {
    return <ExercisesPageLoading />;
  }
  if (pathname.match(exercisePagePathnameRegex)) {
    return <ExercisePageLoading />;
  }
  if (pathname.match(trainingsPagePathnameRegex)) {
    return <TrainingsPageLoading />;
  }

  return <GenericSkeleton />;
};

const traineesPagePathnameRegex = /^\/trainees\/[^\/]+\/?$/;
const tagsPagePathnameRegex = /^\/trainees\/[^\/]+\/tags\/?$/;
const tagPagePathnameRegex = /^\/trainees\/[^\/]+\/tags\/[^\/]+\/?$/;
const exercisesPagePathnameRegex = /^\/trainees\/[^\/]+\/exercises\/?$/;
const exercisePagePathnameRegex = /^\/trainees\/[^\/]+\/exercises\/[^\/]+\/?$/;
const trainingsPagePathnameRegex = /^\/trainees\/[^\/]+\/trainings\/?$/;
