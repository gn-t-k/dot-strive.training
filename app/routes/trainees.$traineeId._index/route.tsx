import { Await, Form, useLoaderData } from "@remix-run/react";

import { Button } from "app/ui/button";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";

import { TraineeInfo } from "./trainee-info";

import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "app/ui/alert-dialog";
import { type FC, Suspense } from "react";

import { deleteTrainee } from "app/features/trainee/delete-trainee";
import { action as logoutAction } from "app/routes/auth.logout/route";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import { TraineePageLoading } from "./trainee-page-loading";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const loaderData = (async () => {
    const { trainee } = await traineeLoader({ context, request, params });

    return { trainee };
  })();

  return { loaderData };
};

const Page: FC = () => {
  const { loaderData } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<TraineePageLoading />}>
      <Await resolve={loaderData}>
        {(loaderData) => <TraineePage {...loaderData} />}
      </Await>
    </Suspense>
  );
};
export default Page;

type TraineePageProps = Awaited<
  Awaited<ReturnType<typeof loader>>["loaderData"]
>;
export const TraineePage: FC<TraineePageProps> = ({ trainee }) => {
  return (
    <Main>
      <Section className="mt-4 items-center">
        <TraineeInfo trainee={trainee} />
        <Form method="POST" action="/auth/logout" className="w-full">
          <Button className="w-full">ログアウト</Button>
        </Form>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              アカウントを削除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>アカウントの削除</AlertDialogTitle>
              <AlertDialogDescription>
                アカウントを削除すると、すべてのデータが失われます。本当に削除しますか？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <Form method="post">
                <AlertDialogAction type="submit" className="w-full">
                  削除
                </AlertDialogAction>
              </Form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>
    </Main>
  );
};

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params });

  const result = await deleteTrainee(context)({ id: trainee.id });

  if (!result.success) {
    return null;
  }

  return await logoutAction({ params, request, context });
};
