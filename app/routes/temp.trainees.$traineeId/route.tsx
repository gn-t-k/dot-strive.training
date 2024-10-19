import { Outlet, useLoaderData } from "@remix-run/react";

import { HeaderNavigation } from "./header-navigation";

import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { FC } from "react";

export const loader = ({ params }: LoaderFunctionArgs) => {
  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const traineeIdParam = params["traineeId"]!;

  return { traineeIdParam };
};

const PageWithNavigationHeader: FC = () => {
  const { traineeIdParam } = useLoaderData<typeof loader>();

  return (
    <>
      <header className="sticky top-0">
        <HeaderNavigation isLoading={false} traineeId={traineeIdParam} />
      </header>
      <Outlet />
      <footer className="mt-8 flex h-24 items-center justify-center border-t px-4">
        <p className="text-muted-foreground">.STRIVE</p>
      </footer>
    </>
  );
};
export default PageWithNavigationHeader;
