import { Loading } from "@/app/_components/loading";

import type { FC } from "react";

const PageLoading: FC = () => {
  return <Loading description="種目データを取得しています" />;
};
export default PageLoading;
