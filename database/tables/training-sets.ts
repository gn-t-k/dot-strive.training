import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { trainingSessions } from "./training-sessions";

export const trainingSets = sqliteTable(
  "training_sets",
  {
    id: text("id").notNull(),
    weight: real("weight").notNull(),
    repetition: integer("repetition").notNull(),
    rpe: integer("rpe").notNull(),
    order: integer("order").notNull(),
    estimatedMaximumWeight: real("estimated_maximum_weight").notNull(),
    sessionId: text("session_id").notNull(),
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id] }),
    fk: foreignKey({
      columns: [columns.sessionId],
      foreignColumns: [trainingSessions.id],
    }),
    idx1: index("session_index").on(columns.sessionId),
    idx2: index("estimated_maximum_weight_index").on(
      columns.estimatedMaximumWeight,
    ),
  }),
);

export const trainingSetsRelations = relations(trainingSets, ({ one }) => ({
  trainingSessions: one(trainingSessions, {
    fields: [trainingSets.sessionId],
    references: [trainingSessions.id],
  }),
}));
