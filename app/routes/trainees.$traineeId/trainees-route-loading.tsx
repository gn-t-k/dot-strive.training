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

  if (pathname.match(traineePagePathRegex)) {
    return <TraineePageLoading />;
  }
  if (pathname.match(tagsPagePathRegex)) {
    return <TagsPageLoading />;
  }
  if (pathname.match(tagPagePathRegex)) {
    return <TagPageLoading />;
  }
  if (pathname.match(exercisesPagePathRegex)) {
    return <ExercisesPageLoading />;
  }
  if (pathname.match(exercisePagePathRegex)) {
    return <ExercisePageLoading />;
  }
  if (pathname.match(trainingsPagePathRegex)) {
    return <TrainingsPageLoading />;
  }

  return <GenericSkeleton />;
};

const traineePagePathRegex = /^\/trainees\/[^\/]+\/?$/;
const tagsPagePathRegex = /^\/trainees\/[^\/]+\/tags\/?$/;
const tagPagePathRegex = /^\/trainees\/[^\/]+\/tags\/[^\/]+\/?$/;
const exercisesPagePathRegex = /^\/trainees\/[^\/]+\/exercises\/?$/;
const exercisePagePathRegex = /^\/trainees\/[^\/]+\/exercises\/[^\/]+\/?$/;
const trainingsPagePathRegex = /^\/trainees\/[^\/]+\/trainings\/?$/;
