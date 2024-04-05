import { Form, useRouteLoaderData } from "@remix-run/react";

import { Button } from "app/ui/button";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";

import { TraineeInfo } from "./trainee-info";

import type { FC } from "react";
import type { loader } from "../trainees.$traineeId/route";

const Page: FC = () => {
  const data = useRouteLoaderData<typeof loader>("routes/trainees.$traineeId");
  if (!data) {
    return null;
  }
  const { trainee } = data;

  return (
    <Main>
      <Section className="mt-4 items-center">
        <TraineeInfo trainee={trainee} />
        <Form method="POST" action="/auth/logout">
          <Button>logout</Button>
        </Form>
      </Section>
    </Main>
  );
};
export default Page;
