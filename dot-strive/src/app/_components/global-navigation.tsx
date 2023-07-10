"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { css } from "styled-system/css";

import { EmojiIcon } from "./emoji-icon";

import type { FC } from "react";

export const GlobalNavigation: FC = () => {
  const params = useParams();
  const traineeId = params.trainee_id;

  return (
    <nav
      className={css({
        position: "sticky",
        bottom: 0,
        borderTop: "1px solid",
        h: 12,
        bg: "white",
      })}
    >
      <ul
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          h: "full",
        })}
      >
        <li
          className={css({
            w: "full",
            display: "flex",
            justifyContent: "center",
          })}
        >
          <Link href={`/trainees/${traineeId}/trainings`}>
            <EmojiIcon emoji="📈" label="トレーニングの記録" size="medium" />
          </Link>
        </li>
        <li
          className={css({
            w: "full",
            display: "flex",
            justifyContent: "center",
          })}
        >
          <Link href={`/trainees/${traineeId}/exercises`}>
            <EmojiIcon emoji="🏋" label="種目" size="medium" />
          </Link>
        </li>
        <li
          className={css({
            w: "full",
            display: "flex",
            justifyContent: "center",
          })}
        >
          <Link href={`/trainees/${traineeId}/muscles`}>
            <EmojiIcon emoji="💪" label="部位" size="medium" />
          </Link>
        </li>
        <li
          className={css({
            w: "full",
            display: "flex",
            justifyContent: "center",
          })}
        >
          <Link href={`/trainees/${traineeId}`}>
            <EmojiIcon emoji="👤" label="マイページ" size="medium" />
          </Link>
        </li>
      </ul>
    </nav>
  );
};
