"use client";

import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";

import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { TrainingDeletionAndConfirm } from "./training-deletion-and-confirm";
import { TrainingDetail } from "./training-detail";

import type { Training } from "../_schemas/training";
import type { FC, PropsWithChildren } from "react";

type Props = {
  traineeId: string;
  trainings: Training[];
};
export const TrainingPopover: FC<PropsWithChildren<Props>> = (props) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{props.children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content>
          <div
            className={css({
              w: "360px",
              maxH: "400px",
              overflow: "auto",
              bg: "white",
              border: "1px solid black",
            })}
          >
            <ul>
              {props.trainings.map((training) => {
                return (
                  <li
                    className={stack({ direction: "column" })}
                    key={training.id}
                  >
                    <TrainingDetail
                      training={training}
                      traineeId={props.traineeId}
                    />
                    <Link
                      href={`/trainees/${props.traineeId}/trainings/${training.id}/edit`}
                    >
                      トレーニングを編集する
                    </Link>
                    <TrainingDeletionAndConfirm
                      traineeId={props.traineeId}
                      training={training}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
