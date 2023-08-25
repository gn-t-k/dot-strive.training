import Link from "next/link";

import { initializeTrainee } from "@/app/_actions/initialize-trainee";
import { LogoutButton } from "@/app/_components/logout-button";
import { container } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";

const Page: NextPage = async () => {
  const initializeTraineeResult = await initializeTrainee();
  if (initializeTraineeResult.isErr) {
    return <p>登録に失敗しました</p>;
  }
  const trainee = initializeTraineeResult.value;

  return (
    <main className={container()}>
      <h1>オンボーディング</h1>
      <Link href={`/trainees/${trainee.id}`}>トレーニーページへ</Link>
      <LogoutButton />
    </main>
  );
};
export default Page;
