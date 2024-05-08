import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import {
  Await,
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { ExerciseForm } from "app/features/exercise/exercise-form";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { validateTrainee } from "app/features/trainee/schema";
import { getTrainingsByExerciseId } from "app/features/training/get-trainings-by-exercise-id";
import { TrainingSessionList } from "app/features/training/training-session-list";
import { VolumeAndIntensityChart } from "app/routes/trainees.$traineeId.exercises.$exerciseId/volume-and-intensity-chart";
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
import { Calendar } from "app/ui/calendar";
import { Card, CardContent, CardHeader } from "app/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "app/ui/dialog";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { useToast } from "app/ui/use-toast";
import {
  endOfDay,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { ArrowRightCircle, Pencil } from "lucide-react";
import {
  type FC,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MonthChangeEventHandler } from "react-day-picker";
import { ExercisesPageLoading } from "../trainees.$traineeId.exercises._index/exercises-page-loading";
import { deleteAction } from "./delete-action";
import { updateAction } from "./update-action";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params });

  const { exerciseId } = params;
  if (!exerciseId) {
    throw redirect(`/trainees/${trainee.id}/exercises`);
  }

  const today = new Date();
  const dateRange = ((month: string | null) => {
    const date = month ? parseISO(month) : today;

    return { from: startOfMonth(date), to: endOfMonth(date) };
  })(new URL(request.url).searchParams.get("month"));

  const [getTagsResult, getExercisesResult, getTrainingsResult] =
    await Promise.all([
      getTagsByTraineeId(context)(trainee.id),
      getExercisesWithTagsByTraineeId(context)(trainee.id),
      getTrainingsByExerciseId(context)(exerciseId, dateRange),
    ]);
  if (
    !(
      getTagsResult.result === "success" &&
      getExercisesResult.result === "success" &&
      getTrainingsResult.result === "success"
    )
  ) {
    throw new Response("Internal Server Error", { status: 500 });
  }
  const [registeredTags, registeredExercises, trainings] = [
    getTagsResult.data,
    getExercisesResult.data,
    getTrainingsResult.data,
  ];

  const exercise = registeredExercises.find(
    (exercise) => exercise.id === exerciseId,
  );
  if (!exercise) {
    return { trainee, exercise: null };
  }

  return {
    trainee,
    trainings,
    exercise,
    registeredTags,
    registeredExercises,
  };
};

const Page: FC = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { exercise, trainee } = loaderData;
  useEffect(() => {
    if (!actionData) {
      return;
    }

    switch (actionData.action) {
      case "update": {
        if (actionData.success) {
          toast({ title: "種目を更新しました" });
        } else {
          toast({ title: "種目の更新に失敗しました", variant: "destructive" });
        }
        break;
      }
      case "delete": {
        if (actionData.success) {
          toast({ title: "種目を削除しました" });
          navigate(`/trainees/${trainee.id}/exercises`);
        } else {
          toast({ title: "種目の削除に失敗しました", variant: "destructive" });
        }
        break;
      }
    }
  }, [actionData, trainee.id, navigate, toast]);

  if (!exercise) {
    // 削除のactionをした直後はexerciseがnullになり、useEffectでリダイレクトされる
    return null;
  }

  const { registeredExercises, registeredTags, trainings } = loaderData;

  return (
    <Suspense fallback={<ExercisesPageLoading />}>
      <Await resolve={{ trainings, registeredExercises, registeredTags }}>
        {({ trainings, registeredExercises, registeredTags }) => (
          <ExercisePage
            traineeId={trainee.id}
            trainings={trainings}
            exercise={exercise}
            registeredExercises={registeredExercises}
            registeredTags={registeredTags}
          />
        )}
      </Await>
    </Suspense>
  );
};
export default Page;

type ExercisePageProps = {
  traineeId: string;
  exercise: Exercise;
  trainings: Training[];
  registeredExercises: Exercise[];
  registeredTags: Tag[];
};
type Training = {
  id: string;
  date: Date;
  sessions: {
    id: string;
    memo: string;
    exercise: {
      id: string;
      name: string;
    };
    sets: {
      id: string;
      weight: number;
      repetition: number;
      rpe: number;
      estimatedMaximumWeight: number;
    }[];
  }[];
};
type Exercise = {
  id: string;
  name: string;
  tags: Tag[];
};
type Tag = {
  id: string;
  name: string;
};
const ExercisePage: FC<ExercisePageProps> = ({
  traineeId,
  trainings,
  exercise,
  registeredTags,
  registeredExercises,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const today = new Date();

  const defaultMonth = useMemo<Date>(() => {
    const month = searchParams.get("month");
    return month ? new Date(month) : today;
  }, [searchParams.get, today]);
  const filteredTrainings = useMemo(() => {
    if (!selectedDate) {
      return trainings;
    }
    const from = startOfDay(selectedDate);
    const to = endOfDay(selectedDate);
    return trainings.filter((training) => {
      const date = new Date(training.date);
      return from <= date && date <= to;
    });
  }, [selectedDate, trainings]);
  const trainingsChartData = useMemo(() => {
    return trainings
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((training) => ({
        date: new Date(training.date),
        sets: training.sessions.flatMap((session) => session.sets),
      }));
  }, [trainings]);

  const onMonthChange = useCallback<MonthChangeEventHandler>(
    (month) => {
      setSelectedDate(undefined);
      searchParams.set("month", format(month, "yyyy-MM"));
      setSearchParams(searchParams, { preventScrollReset: true });
    },
    [searchParams, setSearchParams],
  );
  const hasTrainings = useCallback(
    (date: Date) =>
      trainings.some((training) => isSameDay(date, training.date)),
    [trainings.some],
  );

  return (
    <Main>
      <Section>
        <Dialog>
          <header className="flex items-center justify-between">
            <Heading level={1} size="lg">
              {exercise.name}
            </Heading>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <Pencil className="size-4" />
              </Button>
            </DialogTrigger>
          </header>
          <DialogContent className="h-4/5 overflow-auto">
            <DialogHeader>
              <DialogTitle>種目を編集する</DialogTitle>
              <DialogClose />
            </DialogHeader>
            <ExerciseForm
              registeredTags={registeredTags}
              registeredExercises={registeredExercises}
              defaultValues={{
                id: exercise.id,
                name: exercise.name,
                tags: exercise.tags.map((tag) => tag.id),
              }}
              actionType="update"
            />
          </DialogContent>
        </Dialog>
      </Section>
      <Section>
        <Heading level={2}>記録</Heading>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          defaultMonth={defaultMonth}
          onMonthChange={onMonthChange}
          modifiers={{ events: hasTrainings }}
          showOutsideDays={false}
        />
        <VolumeAndIntensityChart
          defaultMonth={defaultMonth}
          selectedDate={selectedDate}
          selectDate={setSelectedDate}
          trainings={trainingsChartData}
        />
        {filteredTrainings.length > 0 && (
          <ol className="flex flex-col gap-8">
            {filteredTrainings.map((training) => {
              const dateString = format(training.date, "yyyy年MM月dd日");
              return (
                <li key={training.id}>
                  <Card>
                    <CardHeader className="flex justify-between items-center">
                      <Heading level={3}>{dateString}</Heading>
                      <Link
                        to={`/trainees/${traineeId}/trainings/${training.id}`}
                      >
                        <ArrowRightCircle className="size-4" />
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <TrainingSessionList
                        traineeId={traineeId}
                        sessions={training.sessions}
                      />
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        )}
      </Section>
      <Section>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">種目を削除する</Button>
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
              <Form method="post">
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
      </Section>
    </Main>
  );
};

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const [{ trainee }, formData] = await Promise.all([
    traineeLoader({ context, request, params }),
    request.formData(),
  ]);

  const validatedTrainee = validateTrainee(trainee);
  if (!validatedTrainee) {
    throw new Response("Bad Request", { status: 400 });
  }

  switch (formData.get("actionType")) {
    case "update": {
      return updateAction({ formData, context, trainee: validatedTrainee });
    }
    case "delete": {
      return deleteAction({ formData, context, trainee: validatedTrainee });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
