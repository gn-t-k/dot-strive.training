import { relations } from "drizzle-orm";
import {
  foreignKey,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { exercises } from "./exercises";
import { tags } from "./tags";

export const tagExerciseMappings = sqliteTable(
  "tag_exercise_mappings",
  {
    tagId: text("tag_id").notNull(),
    exerciseId: text("exercise_id").notNull(),
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.tagId, columns.exerciseId] }),
    fkTag: foreignKey({
      columns: [columns.tagId],
      foreignColumns: [tags.id],
    }),
    fkExercise: foreignKey({
      columns: [columns.exerciseId],
      foreignColumns: [exercises.id],
    }),
  }),
);

export const tagExerciseMappingsRelations = relations(
  tagExerciseMappings,
  ({ one }) => ({
    tag: one(tags, {
      fields: [tagExerciseMappings.tagId],
      references: [tags.id],
    }),
    exercise: one(exercises, {
      fields: [tagExerciseMappings.exerciseId],
      references: [exercises.id],
    }),
  }),
);
