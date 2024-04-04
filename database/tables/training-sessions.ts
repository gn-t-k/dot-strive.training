import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { exercises } from "./exercises";
import { trainingSets } from "./training-sets";
import { trainings } from "./trainings";

export const trainingSessions = sqliteTable(
  "training_sessions",
  {
    id: text("id").notNull(),
    memo: text("memo").notNull(),
    order: integer("order").notNull(),
    trainingId: text("training_id").notNull(),
    exerciseId: text("exercise_id").notNull(),
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id] }),
    fk1: foreignKey({
      columns: [columns.trainingId],
      foreignColumns: [trainings.id],
    }),
    fk2: foreignKey({
      columns: [columns.exerciseId],
      foreignColumns: [exercises.id],
    }),
    idx1: index("training_index").on(columns.trainingId),
    idx2: index("exercise_index").on(columns.exerciseId),
  }),
);

export const trainingSessionsRelations = relations(
  trainingSessions,
  ({ one, many }) => ({
    training: one(trainings, {
      fields: [trainingSessions.trainingId],
      references: [trainings.id],
    }),
    trainingSets: many(trainingSets),
  }),
);
