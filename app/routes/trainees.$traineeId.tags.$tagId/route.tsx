import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { TagForm } from "app/features/tag/tag-form";
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
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { useToast } from "app/ui/use-toast";
import { Pencil, X } from "lucide-react";
import {
  type FC,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
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

  const { tagId } = params;
  if (!tagId) {
    return redirect(`/trainees/${trainee.id}/tags`);
  }

  const getTagsResult = await getTagsByTraineeId(context)(trainee.id);
  if (getTagsResult.result !== "success") {
    throw new Response("Sorry, something went wrong", { status: 500 });
  }
  const registeredTags = getTagsResult.data;
  const tag = registeredTags.find((tag) => tag.id === tagId);
  if (!tag) {
    return json({ trainee, tag: null });
  }

  return json({ trainee, tag, registeredTags });
};

const Page: FC = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const onClickEdit = useCallback<MouseEventHandler<HTMLButtonElement>>((_) => {
    setIsEditing(true);
  }, []);
  const onClickCancel = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (_) => {
      setIsEditing(false);
    },
    [],
  );

  const { trainee, tag } = loaderData;

  useEffect(() => {
    if (!actionData) {
      return;
    }

    switch (actionData.action) {
      case "update": {
        if (actionData.success) {
          toast({ title: "タグを更新しました" });
        } else {
          toast({ title: "タグの更新に失敗しました", variant: "destructive" });
        }
        break;
      }
      case "delete": {
        if (actionData.success) {
          toast({ title: "タグを削除しました" });
          navigate(`/trainees/${trainee.id}/tags`);
        } else {
          toast({ title: "タグの削除に失敗しました", variant: "destructive" });
        }
        break;
      }
    }
  }, [actionData, trainee.id, navigate, toast]);

  if (!tag) {
    // 削除のactionをした直後はtagがnullになり、useEffectでリダイレクトされる
    return null;
  }
  const { registeredTags } = loaderData;

  return (
    <Main>
      <Section>
        {isEditing ? (
          <header className="flex gap-1">
            <TagForm
              registeredTags={registeredTags}
              actionType="update"
              defaultValues={{ id: tag.id, name: tag.name }}
            />
            <Button size="icon" variant="ghost" onClick={onClickCancel}>
              <X className="size=4" />
            </Button>
          </header>
        ) : (
          <header className="flex items-center justify-between">
            <Heading level={1} className="break-all">
              #{tag.name}
            </Heading>
            <Button size="icon" variant="ghost" onClick={onClickEdit}>
              <Pencil className="size=4" />
            </Button>
          </header>
        )}
      </Section>
      <Section>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">タグを削除する</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>タグの削除</AlertDialogTitle>
              <AlertDialogDescription>
                #{tag.name} を削除しますか？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <Form method="post">
                <input type="hidden" name="id" value={tag.id} />
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
      </Section>
    </Main>
  );
};
export default Page;

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const [{ trainee }, formData] = await Promise.all([
    traineeLoader({ context, request, params }).then((response) =>
      response.json(),
    ),
    request.formData(),
  ]);

  switch (formData.get("actionType")) {
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
