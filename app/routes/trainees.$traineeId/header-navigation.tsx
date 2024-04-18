import { CalendarDays, CircleUserRound, Dumbbell, Tag } from "lucide-react";

import { Link, useLocation, useNavigation } from "@remix-run/react";
import { Logotype } from "app/ui/logotype";
import type { FC } from "react";

type Props = {
  traineeId: string;
};
export const HeaderNavigation: FC<Props> = ({ traineeId }) => {
  const { state } = useNavigation();
  const { pathname } = useLocation();
  const location = pathname.split("/")[3] ?? "";

  return (
    <nav className="flex w-full items-center justify-between bg-white py-2 px-4">
      <div>
        <Logotype />
      </div>
      <div className="flex w-full items-center justify-end">
        <Link to={`/trainees/${traineeId}/trainings`} className="p-2">
          <CalendarDays
            size="20px"
            className={
              location === "trainings" && state === "idle"
                ? "text-primary"
                : "text-muted-foreground/50"
            }
          />
        </Link>
        <Link to={`/trainees/${traineeId}/exercises`} className="p-2">
          <Dumbbell
            size="20px"
            className={
              location === "exercises" && state === "idle"
                ? "text-primary"
                : "text-muted-foreground/50"
            }
          />
        </Link>
        <Link to={`/trainees/${traineeId}/tags`} className="p-2">
          <Tag
            size="20px"
            className={
              location === "tags" && state === "idle"
                ? "text-primary"
                : "text-muted-foreground/50"
            }
          />
        </Link>
        <Link to={`/trainees/${traineeId}`} className="p-2">
          <CircleUserRound
            size="20px"
            className={
              location === "" && state === "idle"
                ? "text-primary"
                : "text-muted-foreground/50"
            }
          />
        </Link>
      </div>
    </nav>
  );
};
