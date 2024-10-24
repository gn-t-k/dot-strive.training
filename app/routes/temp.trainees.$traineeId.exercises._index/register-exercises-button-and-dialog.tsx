import { Button } from "app/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "app/ui/dialog";
import type { FC, FormHTMLAttributes } from "react";
import { ExerciseForm } from "../temp.trainees.$traineeId.exercises/exercise-form";
type Props = {
  form: FC<FormHTMLAttributes<HTMLFormElement>>;
  registeredTags: { id: string; name: string }[] | undefined;
  registeredExercises: { id: string; name: string }[] | undefined;
};
export const RegisterExercisesButtonAndDialog: FC<Props> = ({
  form: Form,
  registeredTags,
  registeredExercises,
}) => {
  if (registeredTags === undefined || registeredExercises === undefined) {
    return <TriggerButton />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <TriggerButton />
      </DialogTrigger>
      <DialogContent className="max-h-dvh overflow-auto">
        <DialogHeader>
          <DialogTitle>種目を登録する</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <ExerciseForm
          form={Form}
          registeredTags={registeredTags}
          registeredExercises={registeredExercises}
        />
      </DialogContent>
    </Dialog>
  );
};

const TriggerButton: FC = () => {
  return <Button variant="secondary">種目を登録する</Button>;
};
