import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import {
  Await,
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { TagForm } from "app/features/tag/tag-form";
import { validateTrainee } from "app/features/trainee/schema";
import { getTrainingsByTagId } from "app/features/training/get-trainings-by-tag-id";
import { TrainingCard } from "app/features/training/training-card";
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
import {} from "app/ui/card";
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
import { Pencil, X } from "lucide-react";
import {
  type FC,
  type MouseEventHandler,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MonthChangeEventHandler } from "react-day-picker";
import { deleteAction } from "./delete-action";
import { SetCountChart } from "./set-count-chart";
import { TagPageLoading } from "./tag-page-loading";
import { updateAction } from "./update-action";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const loaderData = (async () => {
    const { trainee } = await traineeLoader({ context, request, params });

    const { tagId } = params;
    if (!tagId) {
      throw redirect(`/trainees/${trainee.id}/tags`);
    }

    const today = new Date();
    const dateRange = ((month: string | null) => {
      const date = month ? parseISO(month) : today;

      return { from: startOfMonth(date), to: endOfMonth(date) };
    })(new URL(request.url).searchParams.get("month"));

    const [getTagsResult, getTrainingsResult] = await Promise.all([
      getTagsByTraineeId(context)(trainee.id),
      getTrainingsByTagId(context)(tagId, dateRange),
    ]);
    if (
      !(
        getTagsResult.result === "success" &&
        getTrainingsResult.result === "success"
      )
    ) {
      throw new Response("Sorry, something went wrong", { status: 500 });
    }

    const registeredTags = getTagsResult.data;
    const tag = registeredTags.find((tag) => tag.id === tagId);
    if (!tag) {
      return { trainee, tag: null };
    }

    const trainings = getTrainingsResult.data;

    return { trainee, tag, registeredTags, trainings };
  })();

  return { loaderData };
};

const Page: FC = () => {
  const { loaderData } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<TagPageLoading />}>
      <Await resolve={loaderData}>
        {(loaderData) => <TagPage {...loaderData} />}
      </Await>
    </Suspense>
  );
};
export default Page;

type TagPageProps = Awaited<Awaited<ReturnType<typeof loader>>["loaderData"]>;
const TagPage: FC<TagPageProps> = ({
  trainee,
  tag,
  registeredTags,
  trainings,
}) => {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <Main>
      <TagInfoSection tag={tag} registeredTags={registeredTags} />
      <MonthlyTrainingsSection traineeId={trainee.id} trainings={trainings} />
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

type LoaderData = Awaited<Awaited<ReturnType<typeof loader>>["loaderData"]>;

type TagInfoSectionProps = {
  tag: NonNullable<LoaderData["tag"]>;
  registeredTags: NonNullable<LoaderData["registeredTags"]>;
};
const TagInfoSection: FC<TagInfoSectionProps> = ({ tag, registeredTags }) => {
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

  return (
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
          <Heading level={1} size="lg" className="break-all">
            #{tag.name}
          </Heading>
          <Button size="icon" variant="ghost" onClick={onClickEdit}>
            <Pencil className="size-4" />
          </Button>
        </header>
      )}
    </Section>
  );
};

type MonthlyTrainingsSectionProps = {
  traineeId: string;
  trainings: NonNullable<LoaderData["trainings"]>;
};
const MonthlyTrainingsSection: FC<MonthlyTrainingsSectionProps> = ({
  traineeId,
  trainings,
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
  const trainingsChartData = useMemo(
    () =>
      trainings.map((training) => ({
        date: new Date(training.date),
        setCount: training.sessions.flatMap((session) => session.sets).length,
      })),
    [trainings],
  );

  const hasTrainings = useCallback(
    (date: Date) =>
      trainings.some((training) => isSameDay(date, training.date)),
    [trainings.some],
  );
  const onMonthChange = useCallback<MonthChangeEventHandler>(
    (month) => {
      setSelectedDate(undefined);
      searchParams.set("month", format(month, "yyyy-MM"));
      setSearchParams(searchParams, { preventScrollReset: true });
    },
    [searchParams, setSearchParams],
  );

  return (
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
      <SetCountChart
        defaultMonth={defaultMonth}
        selectedDate={selectedDate}
        selectDate={setSelectedDate}
        trainings={trainingsChartData}
      />
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
