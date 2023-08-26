import { Loading } from "@/app/_components/loading";

import type { FC } from "react";

const PageLoading: FC = () => {
  return <Loading description={"認証情報を確認しています"} />;
};
export default PageLoading;
