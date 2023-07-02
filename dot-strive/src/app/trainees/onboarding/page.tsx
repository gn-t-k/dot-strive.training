import { LogoutButton } from "@/app/_components/logout-button";
import { container } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";

const Page: NextPage = async () => {
  return (
    <main className={container()}>
      <h1>オンボーディング</h1>
      <LogoutButton />
    </main>
  );
};
export default Page;
