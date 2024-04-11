ALTER TABLE `muscle_exercise_mappings` RENAME TO `old_muscle_exercise_mappings`;--> statement-breakpoint
ALTER TABLE `muscles` RENAME TO `old_muscles`;--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`trainee_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trainee_id`) REFERENCES `trainees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `tags` SELECT * FROM `old_muscles`;--> statement-breakpoint
CREATE TABLE `tag_exercise_mappings` (
	`tag_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	PRIMARY KEY(`exercise_id`, `tag_id`),
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `tag_exercise_mappings`
	(`tag_id`, `exercise_id`)
SELECT
	`muscle_id`, `exercise_id`
FROM `old_muscle_exercise_mappings`;
--> statement-breakpoint
DROP TABLE `old_muscle_exercise_mappings`;--> statement-breakpoint
DROP TABLE `old_muscles`;--> statement-breakpoint
DROP INDEX IF EXISTS `muscles_trainee_index`;--> statement-breakpoint
DROP INDEX IF EXISTS `muscles_trainee_id_name_unique`;--> statement-breakpoint
CREATE INDEX `tags_trainee_index` ON `tags` (`trainee_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_trainee_id_name_unique` ON `tags` (`trainee_id`,`name`);--> statement-breakpoint
