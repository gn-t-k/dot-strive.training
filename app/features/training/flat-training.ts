import { createId } from "@paralleldrive/cuid2";
import { getEstimatedMaximumWeight } from "./get-estimated-maximum-weight";
import type { Training } from "./schema";

type FlatTraining = (training: Training) => Payload;
type Payload = {
  sessions: Session[];
  sets: Set[];
};
type Session = {
  id: string;
  memo: string;
  order: number;
  trainingId: string;
  exerciseId: string;
};
type Set = {
  id: string;
  weight: number;
  repetition: number;
  rpe: number;
  order: number;
  estimatedMaximumWeight: number;
  sessionId: string;
};
export const flatTraining: FlatTraining = (training) => {
  return training.sessions.reduce<Payload>(
    (accumulator, session, index) => {
      const sessionData = {
        id: createId(),
        memo: session.memo,
        order: index,
        trainingId: training.id,
        exerciseId: session.exercise.id,
      };
      const setData = session.sets.map((set, index) => ({
        id: createId(),
        weight: set.weight,
        repetition: set.reps,
        rpe: set.rpe,
        order: index,
        estimatedMaximumWeight: getEstimatedMaximumWeight({
          weight: set.weight,
          repetition: set.reps,
        }),
        sessionId: sessionData.id,
      }));

      accumulator.sessions.push(sessionData);

      return {
        sessions: accumulator.sessions,
        sets: [...accumulator.sets, ...setData],
      };
    },
    { sessions: [], sets: [] },
  );
};
