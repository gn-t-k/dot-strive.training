import { Button } from "app/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "app/ui/dialog";
import { Pencil } from "lucide-react";
import type { FC, PropsWithChildren } from "react";
import { ExerciseForm } from "../temp.trainees.$traineeId.exercises/exercise-form";

type Props = {
  form: FC<PropsWithChildren>;
  registeredTags: Tag[] | undefined;
  registeredExercises: Exercise[] | undefined;
  exercise: (Exercise & { tags: Tag[] }) | undefined;
};
type Tag = { id: string; name: string };
type Exercise = { id: string; name: string };
export const EditExerciseButtonAndDialog: FC<Props> = ({
  form,
  registeredTags,
  registeredExercises,
  exercise,
}) => {
  if (
    registeredTags === undefined ||
    registeredExercises === undefined ||
    exercise === undefined
  ) {
    return (
      <Button size="icon" variant="ghost">
        <Pencil className="size-4" />
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-4/5 overflow-auto">
        <DialogHeader>
          <DialogTitle>種目を編集する</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <ExerciseForm
          form={form}
          registeredTags={registeredTags}
          registeredExercises={registeredExercises}
          defaultValues={{
            id: exercise.id,
            name: exercise.name,
            tags: exercise.tags.map((tag) => tag.id),
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
