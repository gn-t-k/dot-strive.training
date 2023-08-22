import { SetClientTimezoneOffset } from "@/app/_components/set-client-timezone-offset";
import { Layout } from "@/app/_types/layout";

const Layout: Layout = ({ children }) => {
  return (
    <>
      <SetClientTimezoneOffset />
      {children}
    </>
  );
};
export default Layout;
