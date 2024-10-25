import { Button } from "app/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "app/ui/dialog";
import type { FC, PropsWithChildren } from "react";
import { ExerciseForm } from "../temp.trainees.$traineeId.exercises/exercise-form";
type Props = {
  form: FC<PropsWithChildren>;
  registeredTags: { id: string; name: string }[] | undefined;
  registeredExercises: { id: string; name: string }[] | undefined;
};
export const RegisterExercisesButtonAndDialog: FC<Props> = ({
  form,
  registeredTags,
  registeredExercises,
}) => {
  if (registeredTags === undefined || registeredExercises === undefined) {
    return <Button variant="secondary">種目を登録する</Button>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">種目を登録する</Button>
      </DialogTrigger>
      <DialogContent className="max-h-dvh overflow-auto">
        <DialogHeader>
          <DialogTitle>種目を登録する</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <ExerciseForm
          form={form}
          registeredTags={registeredTags}
          registeredExercises={registeredExercises}
        />
      </DialogContent>
    </Dialog>
  );
};
