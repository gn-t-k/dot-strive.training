import { useNavigation } from "@remix-run/react";
import type { FC } from "react";
import { TrainingsPageLoading } from "../trainees.$traineeId.trainings._index/loading";
import { MainContentSkeleton } from "./main-content-skeleton";

type Props = {
  traineeId: string;
};
export const TraineeRouteLoading: FC<Props> = ({ traineeId }) => {
  const { location } = useNavigation();
  if (!location) {
    return null;
  }
  const { pathname } = location;

  // TODO: ページごとにローディングコンポーネントを追加する

  if (pathname.match(/^\/trainees\/.+\/trainings$/)) {
    return <TrainingsPageLoading traineeId={traineeId} />;
  }

  return <MainContentSkeleton />;
};
