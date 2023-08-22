import { SetTimezoneOffset } from "@/app/_components/set-timezone-offset";
import { Layout } from "@/app/_types/layout";

const Layout: Layout = ({ children }) => {
  return (
    <>
      <SetTimezoneOffset />
      {children}
    </>
  );
};
export default Layout;
