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
import { findEstimatedMaximumWeightById } from "app/features/exercise/find-estimated-maximum-weight-by-id";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { validateTrainee } from "app/features/trainee/schema";
import { getTrainingsByExerciseId } from "app/features/training/get-trainings-by-exercise-id";
import { TrainingCard } from "app/features/training/training-card";
import { VolumeChart } from "app/routes/trainees.$traineeId.exercises.$exerciseId/volume-chart";
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
import { Badge } from "app/ui/badge";
import { Button } from "app/ui/button";
import {} from "app/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "app/ui/dialog";
import { Heading } from "app/ui/heading";
import { Input } from "app/ui/input";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "app/ui/tabs";
import { useToast } from "app/ui/use-toast";
import {
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import {
  type FC,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { deleteAction } from "./delete-action";
import { ExercisePageLoading } from "./exercise-page-loading";
import { MaximumWeightChart } from "./maximum-weight-chart";
import { updateAction } from "./update-action";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const loaderData = (async () => {
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

    const [
      getTagsResult,
      getExercisesResult,
      getTrainingsResult,
      findMaxTrainingResult,
    ] = await Promise.all([
      getTagsByTraineeId(context)(trainee.id),
      getExercisesWithTagsByTraineeId(context)(trainee.id),
      getTrainingsByExerciseId(context)(exerciseId, dateRange),
      findEstimatedMaximumWeightById(context)(exerciseId),
    ]);
    if (
      !(
        getTagsResult.result === "success" &&
        getExercisesResult.result === "success" &&
        getTrainingsResult.result === "success" &&
        findMaxTrainingResult.result !== "failure"
      )
    ) {
      throw new Response("Internal Server Error", { status: 500 });
    }
    const [registeredTags, registeredExercises, trainings] = [
      getTagsResult.data,
      getExercisesResult.data,
      getTrainingsResult.data,
    ];
    const maxTraining =
      findMaxTrainingResult.result === "found"
        ? findMaxTrainingResult.data
        : null;

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
      maxTraining,
    };
  })();

  return { loaderData };
};

const Page: FC = () => {
  const { loaderData } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<ExercisePageLoading />}>
      <Await resolve={loaderData}>
        {(loaderData) => <ExercisePage {...loaderData} />}
      </Await>
    </Suspense>
  );
};
export default Page;

type ExercisePageProps = Awaited<
  Awaited<ReturnType<typeof loader>>["loaderData"]
>;
const ExercisePage: FC<ExercisePageProps> = ({
  trainee,
  trainings,
  exercise,
  registeredTags,
  registeredExercises,
  maxTraining,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const actionData = useActionData<typeof action>();

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

  return (
    <Main>
      <Section>
        <Dialog>
          <header className="flex justify-between">
            <div className="flex flex-col gap-2">
              <Heading level={1} size="lg">
                {exercise.name}
              </Heading>
              <ul className="inline leading-relaxed">
                {exercise.tags.map((tag, index) => {
                  return (
                    <li className="inline mr-1" key={`${index}_${tag}`}>
                      <Link to={`/trainees/${trainee.id}/tags/${tag.id}`}>
                        <Badge variant="outline">#{tag.name}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
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
      {maxTraining && (
        <Section>
          <Heading level={2}>記録</Heading>
          <div className="flex items-center gap-2">
            <span className="w-2/4">推定1RM: </span>
            <span className="w-1/4">
              {maxTraining.estimatedMaximumWeight}kg
            </span>
            <span className="w-1/4">
              <Link
                to={`/trainees/${trainee.id}/trainings/${maxTraining.training.id}`}
                className="underline text-sm text-muted-foreground"
              >
                {format(maxTraining.training.date, "yyyy/MM/dd")}
              </Link>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2/4 flex items-center gap-2">
              <Input className="w-1/3" />
              <span className="w-2/3">回の最大重量:</span>
            </span>
            <span className="w-1/4"> -kg</span>
            <span className="w-1/4">
              <p className="underline text-sm text-muted-foreground">-</p>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2/4 flex items-center gap-2">
              <Input className="w-1/3" />
              <span className="w-2/3">kgの最大回数:</span>
            </span>
            <span className="w-1/4"> -回</span>
            <span className="w-1/4">
              <p className="underline text-sm text-muted-foreground">-</p>
            </span>
          </div>
        </Section>
      )}
      <MonthlyTrainingsSection traineeId={trainee.id} trainings={trainings} />
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

type MonthlyTrainingsSectionProps = {
  traineeId: string;
  trainings: NonNullable<
    Awaited<Awaited<ReturnType<typeof loader>>["loaderData"]>["trainings"]
  >;
};
const MonthlyTrainingsSection: FC<MonthlyTrainingsSectionProps> = ({
  traineeId,
  trainings,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const defaultMonth = useMemo<Date>(() => {
    const month = searchParams.get("month");
    const today = new Date();

    return month ? new Date(month) : today;
  }, [searchParams.get]);
  const prevMonth = useMemo<Date>(() => {
    return subMonths(defaultMonth, 1);
  }, [defaultMonth]);
  const nextMonth = useMemo<Date>(() => {
    return addMonths(defaultMonth, 1);
  }, [defaultMonth]);

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
    return trainings.map((training) => ({
      date: new Date(training.date),
      sets: training.sessions.flatMap((session) => session.sets),
    }));
  }, [trainings]);

  const setMonthPrev = useCallback(() => {
    setSelectedDate(undefined);
    searchParams.set("month", format(prevMonth, "yyyy-MM"));
    setSearchParams(searchParams, { preventScrollReset: true });
  }, [searchParams, setSearchParams, prevMonth]);
  const setMonthNext = useCallback(() => {
    setSelectedDate(undefined);
    searchParams.set("month", format(nextMonth, "yyyy-MM"));
    setSearchParams(searchParams, { preventScrollReset: true });
  }, [searchParams, setSearchParams, nextMonth]);

  return (
    <Section>
      <header className="flex items-center justify-between">
        <Heading level={2}>{format(defaultMonth, "M")}月のトレーニング</Heading>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={setMonthPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={setMonthNext}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>
      <Tabs defaultValue="volume">
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="volume">
            ボリューム
          </TabsTrigger>
          <TabsTrigger className="w-full" value="maximum-weight">
            最大重量
          </TabsTrigger>
        </TabsList>
        <TabsContent value="volume">
          <VolumeChart
            defaultMonth={defaultMonth}
            selectedDate={selectedDate}
            selectDate={setSelectedDate}
            trainings={trainingsChartData}
          />
        </TabsContent>
        <TabsContent value="maximum-weight">
          <MaximumWeightChart
            defaultMonth={defaultMonth}
            selectedDate={selectedDate}
            selectDate={setSelectedDate}
            trainings={trainingsChartData}
          />
        </TabsContent>
      </Tabs>
      {filteredTrainings.length > 0 && (
        <ol className="flex flex-col gap-8">
          {filteredTrainings.map((training) => (
            <li key={training.id}>
              <TrainingCard traineeId={traineeId} training={training} />
            </li>
          ))}
        </ol>
      )}
    </Section>
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
