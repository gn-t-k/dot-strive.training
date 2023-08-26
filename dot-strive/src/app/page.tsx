import { redirect } from "next/navigation";

import { getTraineeOrRedirect } from "./_actions/get-trainee-or-redirect";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async () => {
  const trainee = await getTraineeOrRedirect();

  const to = `/trainees/${trainee.id}/trainings` as const;
  redirect(to satisfies Route<typeof to>);
};
export default Page;
