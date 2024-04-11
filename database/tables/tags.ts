import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { tagExerciseMappings } from "./tag-exercise-mappings";
import { trainees } from "./trainees";

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").notNull(),
    name: text("name").notNull(),
    traineeId: text("trainee_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (columns) => ({
    pk: primaryKey({ columns: [columns.id] }),
    uk: unique().on(columns.traineeId, columns.name),
    fk: foreignKey({
      columns: [columns.traineeId],
      foreignColumns: [trainees.id],
    }),
    idx: index("tags_trainee_index").on(columns.traineeId),
  }),
);

export const tagsRelations = relations(tags, ({ one, many }) => ({
  trainee: one(trainees, {
    fields: [tags.traineeId],
    references: [trainees.id],
  }),
  exercises: many(tagExerciseMappings),
}));
