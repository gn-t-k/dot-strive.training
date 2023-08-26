import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getTraineeOrRedirect } from "@/app/_actions/get-trainee-or-redirect";
import { GlobalNavigation } from "@/app/_components/global-navigation";
import { container } from "styled-system/patterns";

import type { Layout } from "@/app/_types/layout";
import type { Route } from "next";
import type { FC } from "react";

const PrivateLayout: Layout = ({ children, params }) => {
  const traineeId = params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  return (
    <>
      <main className={container({ minH: "100dvh" })}>{children}</main>
      <GlobalNavigation />
      <Suspense>
        <CheckSession traineeId={traineeId} />
      </Suspense>
    </>
  );
};
export default PrivateLayout;

type Props = {
  traineeId: string;
};
const CheckSession: FC<Props> = async (props) => {
  const trainee = await getTraineeOrRedirect();
  if (trainee.id !== props.traineeId) {
    const to = `/trainees/${trainee.id}` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return null;
};
