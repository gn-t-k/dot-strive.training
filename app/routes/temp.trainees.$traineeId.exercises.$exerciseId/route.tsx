import { redirect } from "@remix-run/cloudflare";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  Await,
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { getAuthenticator } from "app/features/auth/get-authenticator.server";
import { findEstimatedMaximumWeightById } from "app/features/exercise/find-estimated-maximum-weight-by-id";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { getTrainings } from "app/features/training/get-trainings";
import { TrainingCard } from "app/features/training/training-card";
import {} from "app/ui/alert-dialog";
import { Button } from "app/ui/button";
import {} from "app/ui/dialog";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "app/ui/tabs";
import { useToast } from "app/ui/use-toast";
import { determineDateFormat } from "app/utils/determin-date-format";
import { isValidNumberString } from "app/utils/is-valid-number-string";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type FC, Suspense, useCallback, useEffect, useMemo } from "react";
import { deleteAction } from "./delete-action";
import { DeleteExerciseButtonAndDialog } from "./delete-exercise-button-and-dialog";
import { EditExerciseButtonAndDialog } from "./edit-exercise-button-and-dialog";
import { ExerciseSummary } from "./exercise-summary";
import { MaxTrainingLink } from "./max-training-link";
import { MaximumWeightChart } from "./maximum-weight-chart";
import { SearchTrainingsForm } from "./search-trainings-form";
import { updateAction } from "./update-action";
import { VolumeChart } from "./volume-chart";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const user = getAuthenticator(context, request).isAuthenticated(request);
  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const traineeId = params["traineeId"]!;
  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const exerciseId = params["exerciseId"]!;

  const weightParam = new URL(request.url).searchParams.get("weight");
  const dateParam = new URL(request.url).searchParams.get("date");

  const defaultDate = format(new Date(), "yyyy-MM");
  const dateFormat = determineDateFormat(dateParam ?? defaultDate);
  const date =
    dateParam !== null && dateFormat !== "invalid" ? dateParam : defaultDate;
  const dateRange = { from: startOfMonth(date), to: endOfMonth(date) };

  const weight =
    weightParam !== null && isValidNumberString(weightParam)
      ? Number(weightParam)
      : undefined;

  const getTrainingsProps =
    weight !== undefined ? { exerciseId, weight } : { exerciseId, dateRange };

  const data = Promise.all([
    getTagsByTraineeId(context)(traineeId),
    getExercisesWithTagsByTraineeId(context)(traineeId),
    getTrainings(context)(getTrainingsProps),
    findEstimatedMaximumWeightById(context)(exerciseId),
  ]);

  return {
    user,
    date,
    traineeId,
    exerciseId,
    data,
  };
};

const Controller: FC = () => {
  const { user, date, traineeId, exerciseId, data } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const Loading = (
    <ExercisePage
      traineeId={traineeId}
      exerciseId={exerciseId}
      date={date}
      trainings={undefined}
      exercise={undefined}
      registeredTags={undefined}
      registeredExercises={undefined}
      maxTraining={undefined}
    />
  );

  switch (navigation.state) {
    case "loading":
      return Loading;
    case "submitting":
      return Loading;
    case "idle":
      return (
        <Suspense fallback={Loading}>
          <Await resolve={user}>
            {(user) => {
              if (!user) {
                navigate("/login");
                return Loading;
              }

              if (traineeId !== user.id) {
                throw new Response("Not Found", { status: 404 });
              }

              return (
                <Await resolve={data}>
                  {([
                    getTagsResult,
                    getExercisesResult,
                    getTrainingsResult,
                    findMaxTrainingResult,
                  ]) => {
                    if (
                      getTagsResult.result !== "success" ||
                      getExercisesResult.result !== "success" ||
                      getTrainingsResult.result !== "success" ||
                      findMaxTrainingResult.result === "failure"
                    ) {
                      throw new Response("Internal Server Error", {
                        status: 500,
                      });
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

                    return (
                      <ExercisePage
                        traineeId={traineeId}
                        exerciseId={exerciseId}
                        date={date}
                        trainings={trainings}
                        exercise={exercise}
                        registeredTags={registeredTags}
                        registeredExercises={registeredExercises}
                        maxTraining={maxTraining}
                      />
                    );
                  }}
                </Await>
              );
            }}
          </Await>
        </Suspense>
      );
  }
};
export default Controller;

type Training = {
  id: string;
  date: Date;
  sessions: Session[];
};
type Session = {
  id: string;
  memo: string;
  exercise: Exercise;
  sets: Set[];
};
type Set = {
  id: string;
  weight: number;
  repetition: number;
  rpe: number;
  estimatedMaximumWeight: number;
};
type Exercise = {
  id: string;
  name: string;
};
type Tag = {
  id: string;
  name: string;
};

type ExercisePageProps = {
  traineeId: string;
  exerciseId: string;
  date: string;
  trainings: Training[] | undefined;
  exercise: (Exercise & { tags: Tag[] }) | undefined;
  registeredTags: Tag[] | undefined;
  registeredExercises: Exercise[] | undefined;
  maxTraining:
    | {
        estimatedMaximumWeight: number;
        weight: number;
        reps: number;
        training: {
          id: string;
          date: Date;
        };
      }
    | null
    | undefined;
};
const ExercisePage: FC<ExercisePageProps> = ({
  traineeId,
  exerciseId,
  date,
  trainings,
  exercise,
  registeredTags,
  registeredExercises,
  maxTraining,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const setDate = useCallback<(value: string | undefined) => void>(
    (value) => {
      submit(
        {
          date: value === undefined ? format(date, "yyyy-MM") : value,
        },
        {
          method: "GET",
          preventScrollReset: true,
        },
      );
    },
    [date, submit],
  );

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
          navigate(`/trainees/${traineeId}/exercises`);
        } else {
          toast({ title: "種目の削除に失敗しました", variant: "destructive" });
        }
        break;
      }
    }
  }, [actionData, traineeId, navigate, toast]);

  return (
    <Main>
      <Section>
        <header className="flex justify-between">
          <ExerciseSummary traineeId={traineeId} exercise={exercise} />
          <EditExerciseButtonAndDialog
            form={({ children, ...props }) => (
              <Form {...props} method="PUT">
                {children}
              </Form>
            )}
            registeredTags={registeredTags}
            registeredExercises={registeredExercises}
            exercise={exercise}
          />
        </header>
        {maxTraining !== null && (
          <MaxTrainingLink
            traineeId={traineeId}
            maxTraining={
              maxTraining
                ? {
                    id: maxTraining.training.id,
                    estimatedMaximumWeight: maxTraining.estimatedMaximumWeight,
                    date: maxTraining.training.date,
                  }
                : undefined
            }
          />
        )}
      </Section>

      <Section>
        <Heading level={2}>トレーニング記録</Heading>
        <Tabs defaultValue="date">
          <TabsList className="w-full">
            <TabsTrigger value="date" className="w-full">
              日付
            </TabsTrigger>
            <TabsTrigger value="weight" className="w-full">
              重量
            </TabsTrigger>
            <TabsTrigger value="reps" className="w-full">
              回数
            </TabsTrigger>
          </TabsList>
          <TabsContent value="date">
            <MonthlyTrainingsSection
              traineeId={traineeId}
              trainings={trainings}
              date={date}
              setDate={setDate}
            />
          </TabsContent>
          <TabsContent value="weight">
            <MaximumRepetitionSection
              traineeId={traineeId}
              exerciseId={exerciseId}
              trainings={trainings}
            />
          </TabsContent>
          <TabsContent value="reps">test</TabsContent>
        </Tabs>
      </Section>
      <Section>
        <DeleteExerciseButtonAndDialog
          exercise={exercise}
          form={({ children, ...props }) => (
            <Form {...props} method="DELETE">
              {children}
            </Form>
          )}
        />
      </Section>
    </Main>
  );
};

type MaximumRepetitionSectionProps = {
  traineeId: string;
  exerciseId: string;
  trainings: Training[] | undefined;
};
const MaximumRepetitionSection: FC<MaximumRepetitionSectionProps> = ({
  traineeId,
  exerciseId,
  trainings,
}) => {
  return (
    <Section>
      <Heading level={3} size="sm">
        重量でトレーニングを検索
      </Heading>
      <SearchTrainingsForm
        exerciseId={exerciseId}
        form={({ children }) => <Form method="GET">{children}</Form>}
      />
      {trainings !== undefined && (
        <ol className="flex flex-col gap-8">
          {trainings.map((training) => (
            <li key={training.id}>
              <TrainingCard
                traineeId={traineeId}
                training={{
                  ...training,
                  date: new Date(training.date),
                }}
              />
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
};

type MonthlyTrainingsSectionProps = {
  traineeId: string;
  trainings: Training[] | undefined;
  date: string;
  setDate: (date: string | undefined) => void;
};
const MonthlyTrainingsSection: FC<MonthlyTrainingsSectionProps> = ({
  traineeId,
  trainings,
  date,
  setDate,
}) => {
  const trainingsChartData = useMemo(() => {
    if (trainings === undefined) {
      return [];
    }

    return trainings.map((training) => ({
      date: new Date(training.date),
      sets: training.sessions.flatMap((session) => session.sets),
    }));
  }, [trainings]);

  const setMonthPrev = useCallback(() => {
    setDate(format(subMonths(date, 1), "yyyy-MM"));
  }, [date, setDate]);
  const setMonthNext = useCallback(() => {
    setDate(format(addMonths(date, 1), "yyyy-MM"));
  }, [date, setDate]);

  return (
    <Section>
      <header className="flex items-center justify-between">
        <Heading level={3} size="sm">
          {format(date, "yyyy年M月")}のトレーニング
        </Heading>
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
            date={date}
            selectDate={setDate}
            trainings={trainingsChartData}
          />
        </TabsContent>
        <TabsContent value="maximum-weight">
          <MaximumWeightChart
            date={date}
            selectDate={setDate}
            trainings={trainingsChartData}
          />
        </TabsContent>
      </Tabs>
      {trainings && trainings.length > 0 && (
        <ol className="flex flex-col gap-8">
          {trainings.map((training) => (
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
  const [user, formData] = await Promise.all([
    getAuthenticator(context, request).isAuthenticated(request),
    request.formData(),
  ]);

  if (!user) {
    throw redirect("/login");
  }

  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const traineeIdParam = params["traineeId"]!;

  switch (request.method) {
    case "PUT": {
      if (traineeIdParam !== user.id) {
        throw new Response("Bad Request", { status: 400 });
      }

      return updateAction({ formData, context, traineeId: traineeIdParam });
    }
    case "DELETE": {
      return deleteAction({ formData, context, traineeId: traineeIdParam });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
