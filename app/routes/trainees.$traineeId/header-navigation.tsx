import { CircleUserRound } from "lucide-react";

import { Logotype } from "app/ui/logotype";
import type { FC } from "react";

type Props = {
  traineeId: string;
};
export const HeaderNavigation: FC<Props> = ({ traineeId }) => {
  return (
    <nav className="inline-flex w-full items-center justify-between bg-white py-2 pl-4 pr-1">
      <a href="/">
        <Logotype />
      </a>
      <a href={`/trainees/${traineeId}`}>
        <div className="p-2">
          <CircleUserRound size="20px" />
        </div>
      </a>
    </nav>
  );
};
