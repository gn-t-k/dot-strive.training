"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { css } from "styled-system/css";

import { EmojiIcon } from "./emoji-icon";

import type { FC } from "react";

type Props = {
  traineeId: string;
};
export const HeaderNavigation: FC<Props> = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(
    typeof window !== "undefined" ? window.scrollY : 0
  );

  useEffect(() => {
    const handleScroll: EventListener = (_event) => {
      if (typeof window === "undefined") return;

      const currentScrollPos = window.scrollY;
      setIsVisible(prevScrollPos > currentScrollPos);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos]);

  return (
    <header
      className={css({
        h: 12,
        bg: "white",
        position: "sticky",
        transition: "top 0.3s",
        top: isVisible ? 0 : -12,
        borderBottom: "1px solid",
        zIndex: 9999, // TODO: tokenとかで管理したい
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      })}
    >
      <Link href={`/trainees/${props.traineeId}/trainings`}>.STRIVE</Link>
      <Link href={`/trainees/${props.traineeId}`}>
        <EmojiIcon emoji="👤" label="マイページ" size="medium" />
      </Link>
    </header>
  );
};
