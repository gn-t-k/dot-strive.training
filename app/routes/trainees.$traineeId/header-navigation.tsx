import { CircleUserRound, Dumbbell, History, Tag } from "lucide-react";

import { Link } from "@remix-run/react";
import { Logotype } from "app/ui/logotype";
import type { FC } from "react";

type Props = {
  traineeId: string;
  location: string;
};
export const HeaderNavigation: FC<Props> = ({ traineeId, location }) => {
  return (
    <nav className="flex w-full items-center justify-between bg-white py-2 px-4">
      <div>
        <Logotype />
      </div>
      <div className="flex w-full items-center justify-end">
        <Link to={`/trainees/${traineeId}/trainings`} className="p-2">
          <History
            size="20px"
            className={
              location === "trainings"
                ? "text-primary"
                : "text-muted-foreground"
            }
          />
        </Link>
        <Link to={`/trainees/${traineeId}/exercises`} className="p-2">
          <Dumbbell
            size="20px"
            className={
              location === "exercises"
                ? "text-primary"
                : "text-muted-foreground"
            }
          />
        </Link>
        <Link to={`/trainees/${traineeId}/tags`} className="p-2">
          <Tag
            size="20px"
            className={
              location === "tags" ? "text-primary" : "text-muted-foreground"
            }
          />
        </Link>
        <Link to={`/trainees/${traineeId}`} className="p-2">
          <CircleUserRound
            size="20px"
            className={
              location === "" ? "text-primary" : "text-muted-foreground"
            }
          />
        </Link>
      </div>
    </nav>
  );
};
