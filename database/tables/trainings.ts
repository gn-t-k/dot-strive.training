import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { trainees } from "./trainees";
import { trainingSessions } from "./training-sessions";

export const trainings = sqliteTable(
  "trainings",
  {
    id: text("id").notNull(),
    date: integer("date", { mode: "timestamp" }).notNull(),
    traineeId: text("trainee_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id] }),
    fk: foreignKey({
      columns: [columns.traineeId],
      foreignColumns: [trainees.id],
    }),
    idx: index("trainings_trainee_index").on(columns.traineeId),
  }),
);

export const trainingsRelations = relations(trainings, ({ one, many }) => ({
  trainee: one(trainees, {
    fields: [trainings.traineeId],
    references: [trainees.id],
  }),
  trainingSessions: many(trainingSessions),
}));
