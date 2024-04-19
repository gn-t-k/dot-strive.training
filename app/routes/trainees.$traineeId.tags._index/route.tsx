import { json } from "@remix-run/cloudflare";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { TagForm } from "app/features/tag/tag-form";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import {} from "app/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader } from "app/ui/card";
import {} from "app/ui/dropdown-menu";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { useToast } from "app/ui/use-toast";
import {} from "lucide-react";
import { useEffect } from "react";
import type { FC } from "react";
import { createAction } from "./create-action";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(
    (response) => response.json(),
  );
  const getTagsResult = await getTagsByTraineeId(context)(trainee.id);
  if (getTagsResult.result === "failure") {
    throw new Response("Internal Server Error", { status: 500 });
  }

  return json({ trainee, tags: getTagsResult.data });
};

const Page: FC = () => {
  const { trainee, tags } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) {
      return;
    }
    switch (actionData.action) {
      case "create": {
        if (actionData.success) {
          toast({ title: "タグを登録しました" });
        } else {
          toast({ title: "タグの登録に失敗しました", variant: "destructive" });
        }
        break;
      }
    }
  }, [actionData, toast]);

  return (
    <Main>
      <Section>
        <ul className="flex flex-col gap-4">
          {tags.map((tag) => {
            return (
              <li key={tag.id}>
                <Link to={`/trainees/${trainee.id}/tags/${tag.id}`}>
                  <Card>
                    <CardHeader className="flex w-full space-x-2">
                      <Heading level={2} className="break-all">
                        #{tag.name}
                      </Heading>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
        <Card>
          <CardHeader>
            <Heading level={2}>タグを登録する</Heading>
            <CardDescription>
              .STRIVEでは、種目を名前とタグ付けで管理できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagForm
              key={Math.random().toString()}
              registeredTags={tags}
              actionType="create"
            />
          </CardContent>
        </Card>
      </Section>
    </Main>
  );
};
export default Page;

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const [{ trainee }, formData] = await Promise.all([
    traineeLoader({ context, request, params }).then((response) =>
      response.json(),
    ),
    request.formData(),
  ]);

  switch (formData.get("actionType")) {
    case "create": {
      return createAction({ formData, context, trainee });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
