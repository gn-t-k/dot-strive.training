import { redirect } from "next/navigation";

import { getTraineeOrRedirect } from "./_actions/get-trainee-or-redirect";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async () => {
  const trainee = await getTraineeOrRedirect();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const to =
    `/trainees/${trainee.id}/trainings/dates/${year}/${month}` as const;
  redirect(to satisfies Route<typeof to>);
};
export default Page;
