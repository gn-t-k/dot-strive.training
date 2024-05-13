CREATE TABLE `new_training_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`weight` real NOT NULL,
	`repetition` integer NOT NULL,
	`rpe` real NOT NULL,
	`order` integer NOT NULL,
	`estimated_maximum_weight` real NOT NULL,
	`session_id` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `training_sessions`(`id`) ON UPDATE no action ON DELETE no action
);

INSERT INTO `new_training_sets`
SELECT `id`, `weight`, `repetition`, `rpe`, `order`, `estimated_maximum_weight`, `session_id`
FROM `training_sets`;

DROP TABLE `training_sets`;

ALTER TABLE `new_training_sets` RENAME TO `training_sets`;

CREATE INDEX `session_index` ON `training_sets` (`session_id`);
CREATE INDEX `estimated_maximum_weight_index` ON `training_sets` (`estimated_maximum_weight`);
