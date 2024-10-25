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
import type { FC, FormHTMLAttributes } from "react";

type Props = {
  form: FC<FormHTMLAttributes<HTMLFormElement>>;
};
export const DeleteAccountButtonAndDialog: FC<Props> = ({ form: Form }) => {
  return (
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
          <Form>
            <AlertDialogAction type="submit" className="w-full">
              削除
            </AlertDialogAction>
          </Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
