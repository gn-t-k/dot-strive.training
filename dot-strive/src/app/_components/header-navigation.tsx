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
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);

  useEffect(() => {
    const handleScroll: EventListener = (_event) => {
      const currentScrollPos = window.scrollY;
      setIsVisible(
        currentScrollPos === 0 ? true : prevScrollPos > currentScrollPos
      );
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
        position: "fixed",
        w: "full",
        top: isVisible ? 0 : -12,
        transition: "top 0.3s",
        borderBottom: "1px solid",
        zIndex: 9999, // TODO: tokenとかで管理したい
      })}
    >
      <nav
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        })}
      >
        <Link href={`/trainees/${props.traineeId}/trainings`}>.STRIVE</Link>
        <Link href={`/trainees/${props.traineeId}`}>
          <EmojiIcon emoji="👤" label="マイページ" size="medium" />
        </Link>
      </nav>
    </header>
  );
};
