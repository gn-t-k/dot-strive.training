import {
  type Input,
  array,
  date,
  merge,
  number,
  object,
  safeParse,
  string,
} from "valibot";

type DeserializeTraining = (props: Props) => Payload;
type Props = {
  trainingId: unknown;
  date: unknown;
  sessionId: unknown;
  exerciseId: unknown;
  exerciseName: unknown;
  memo: unknown;
  sessionOrder: unknown;
  setId: unknown;
  weight: unknown;
  repetition: unknown;
  rpe: unknown;
  estimatedMaximumWeight: unknown;
  setOrder: unknown;
}[];

type Payload = Input<typeof payloadSchema>;
const exerciseSchema = object({
  id: string(),
  name: string(),
});
const trainingSchema = object({
  id: string(),
  date: date(),
});
const sessionSchema = object({
  id: string(),
  memo: string(),
});
const setSchema = object({
  id: string(),
  weight: number(),
  repetition: number(),
  rpe: number(),
  estimatedMaximumWeight: number(),
});
const payloadSchema = array(
  merge([
    trainingSchema,
    object({
      sessions: array(
        merge([
          sessionSchema,
          object({
            exercise: exerciseSchema,
            sets: array(setSchema),
          }),
        ]),
      ),
    }),
  ]),
);

export const deserializeTraining: DeserializeTraining = (props) =>
  props.reduce<Payload>((accumulator, current) => {
    const [
      parseTrainingResult,
      parseSessionResult,
      parseExerciseResult,
      parseSetResult,
    ] = [
      safeParse(trainingSchema, {
        id: current.trainingId,
        date: current.date,
      }),
      safeParse(sessionSchema, {
        id: current.sessionId,
        memo: current.memo,
      }),
      safeParse(exerciseSchema, {
        id: current.exerciseId,
        name: current.exerciseName,
      }),
      safeParse(setSchema, {
        id: current.setId,
        weight: current.weight,
        repetition: current.repetition,
        rpe: current.rpe,
        estimatedMaximumWeight: current.estimatedMaximumWeight,
      }),
    ];
    if (
      !(
        parseTrainingResult.success &&
        parseSessionResult.success &&
        parseExerciseResult.success &&
        parseSetResult.success
      )
    ) {
      return accumulator;
    }
    const [currentTraining, currentSession, currentExercise, currentSet] = [
      parseTrainingResult.output,
      parseSessionResult.output,
      parseExerciseResult.output,
      parseSetResult.output,
    ];

    const trainingIndex = accumulator.findIndex(
      (training) => training.id === currentTraining.id,
    );
    if (trainingIndex === -1) {
      accumulator.push({
        ...currentTraining,
        sessions: [
          {
            ...currentSession,
            exercise: currentExercise,
            sets: [currentSet],
          },
        ],
      });
      return accumulator;
    }

    const foundTraining = accumulator[trainingIndex];
    if (!foundTraining) {
      return accumulator;
    }

    const sessionIndex = foundTraining.sessions.findIndex(
      (session) => session.id === currentSession.id,
    );
    if (sessionIndex === -1) {
      return accumulator.with(trainingIndex, {
        ...foundTraining,
        sessions: [
          ...foundTraining.sessions,
          {
            ...currentSession,
            exercise: currentExercise,
            sets: [currentSet],
          },
        ],
      });
    }

    const foundSession = foundTraining.sessions[sessionIndex];
    if (!foundSession) {
      return accumulator;
    }

    return accumulator.with(trainingIndex, {
      ...foundTraining,
      sessions: foundTraining.sessions.with(sessionIndex, {
        ...foundSession,
        sets: [...foundSession.sets, currentSet],
      }),
    });
  }, []);
