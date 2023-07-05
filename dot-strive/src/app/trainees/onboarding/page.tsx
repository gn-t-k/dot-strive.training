import Link from "next/link";

import { LogoutButton } from "@/app/_components/logout-button";
import { container } from "styled-system/patterns";

import { registerInitialData } from "./_repositories/register-initial-data";
import { getTraineeBySession } from "../[trainee_id]/(private)/_repositories/get-trainee-by-session";

import type { NextPage } from "@/app/_types/page";

const Page: NextPage = async () => {
  const registerResult = await registerInitialData();
  if (registerResult.isErr()) {
    return <p>登録に失敗しました</p>;
  }

  const getTraineeResult = await getTraineeBySession();
  if (getTraineeResult.isErr()) {
    return <p>トレーニー情報の取得に失敗しました</p>;
  }
  const trainee = getTraineeResult.value;

  return (
    <main className={container()}>
      <h1>オンボーディング</h1>
      <Link href={`/trainees/${trainee.id}`}>トレーニーページへ</Link>
      <LogoutButton />
    </main>
  );
};
export default Page;
