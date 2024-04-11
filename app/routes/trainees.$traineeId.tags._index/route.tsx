import { json } from "@remix-run/cloudflare";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { TagForm } from "app/routes/trainees.$traineeId.tags._index/tag-form";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "app/ui/alert-dialog";
import { Button } from "app/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "app/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "app/ui/dropdown-menu";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { useToast } from "app/ui/use-toast";
import { Edit, MoreHorizontal, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { FC, MouseEventHandler } from "react";
import { createAction } from "./create-action";
import { deleteAction } from "./delete-action";
import { updateAction } from "./update-action";

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

  return json({ tags: getTagsResult.data });
};

const Page: FC = () => {
  const { tags } = useLoaderData<typeof loader>();
  const [editing, setEditing] = useState<string | undefined>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) {
      return;
    }
    switch (actionData.action) {
      case "create": {
        if (actionData.success) {
          toast({ title: "部位を登録しました" });
        } else {
          toast({ title: "部位の登録に失敗しました", variant: "destructive" });
        }
        break;
      }
      case "update": {
        setEditing(undefined);
        if (actionData.success) {
          toast({ title: "部位を更新しました" });
        } else {
          toast({ title: "部位の更新に失敗しました", variant: "destructive" });
        }
        break;
      }
      case "delete": {
        if (actionData.success) {
          toast({ title: "部位を削除しました" });
        } else {
          toast({ title: "部位の削除に失敗しました", variant: "destructive" });
        }
        break;
      }
    }
  }, [actionData, toast]);

  type OnClickEdit = (id: string) => MouseEventHandler;
  const onClickEdit = useCallback<OnClickEdit>(
    (id) => (_) => {
      setEditing(id);
    },
    [],
  );

  const onClickCancel = useCallback<MouseEventHandler>((_) => {
    setEditing(undefined);
  }, []);

  return (
    <Main>
      <Section>
        <ul className="flex flex-col gap-4">
          {tags.map((tag) => {
            const isEditing = editing === tag.id;

            return (
              <li key={tag.id}>
                <Card>
                  <CardHeader className="flex w-full space-x-2">
                    <div className="grow">
                      {isEditing ? (
                        <TagForm
                          registeredTags={tags}
                          actionType="update"
                          defaultValues={{ id: tag.id, name: tag.name }}
                        />
                      ) : (
                        <Heading level={2} className="break-all">
                          {tag.name}
                        </Heading>
                      )}
                    </div>
                    <div className="flex-none">
                      {isEditing ? (
                        <Button
                          onClick={onClickCancel}
                          size="icon"
                          variant="ghost"
                        >
                          <X className="size-4" />
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <AlertDialog>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem onClick={onClickEdit(tag.id)}>
                                  <Edit className="mr-2 size-4" />
                                  編集
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <AlertDialogTrigger className="flex w-full">
                                    <Trash2 className="mr-2 size-4" />
                                    削除
                                  </AlertDialogTrigger>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>部位の削除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  部位を削除しますか？
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  キャンセル
                                </AlertDialogCancel>
                                <Form method="post">
                                  <input
                                    type="hidden"
                                    name="id"
                                    value={tag.id}
                                  />
                                  <AlertDialogAction
                                    type="submit"
                                    name="actionType"
                                    value="delete"
                                    className="w-full"
                                  >
                                    削除
                                  </AlertDialogAction>
                                </Form>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
        <Card>
          <CardHeader>
            <Heading level={2}>部位を登録する</Heading>
            <CardDescription>
              .STRIVEでは、部位に名前をつけて各種目に割り当てることが出来ます。
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

    case "update": {
      return updateAction({ formData, context, trainee });
    }

    case "delete": {
      return deleteAction({ formData, context, trainee });
    }

    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
