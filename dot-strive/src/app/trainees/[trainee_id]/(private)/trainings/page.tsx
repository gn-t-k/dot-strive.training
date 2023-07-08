import { redirect } from "next/navigation";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const to = `/trainees/${traineeId}/trainings/dates/${year}/${month}` as const;
  redirect(to satisfies Route<typeof to>);
};
export default Page;
