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
import { Trash } from "lucide-react";
import type { FC, PropsWithChildren } from "react";

type Props = {
  exercise: { id: string; name: string } | undefined;
  form: FC<PropsWithChildren>;
};
export const DeleteExerciseButtonAndDialog: FC<Props> = ({
  exercise,
  form: Form,
}) => {
  if (exercise === undefined) {
    return (
      <Button size="icon" variant="destructive">
        <Trash className="size-4" />
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Trash className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>種目の削除</AlertDialogTitle>
          <AlertDialogDescription>
            {exercise.name}を削除しますか？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <Form>
            <input type="hidden" name="id" value={exercise.id} />
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
  );
};
