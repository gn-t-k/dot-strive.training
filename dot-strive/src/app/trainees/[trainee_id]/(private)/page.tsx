import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Trainee } from "@/app/trainees/[trainee_id]/(private)/_components/trainee";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { Loading } from "@/features/navigation/components/loading";
import { container, stack } from "styled-system/patterns";

import type { NextPage } from "@/app/_utils/types";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  return (
    <main className={container()}>
      <div className={stack({ direction: "column" })}>
        <h1>トレーニーページ</h1>
        <Suspense
          fallback={
            <Loading description={"トレーニーデータを取得しています"} />
          }
        >
          <Trainee />
        </Suspense>
        <Link href={`/trainees/${traineeId}/muscles`}>部位</Link>
        <Link href={`/trainees/${traineeId}/exercises`}>種目</Link>
        <LogoutButton />
      </div>
    </main>
  );
};
export default Page;
