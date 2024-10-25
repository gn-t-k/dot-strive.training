import { Button } from "app/ui/button";

import type { FC, FormHTMLAttributes } from "react";

type Props = {
  form: FC<FormHTMLAttributes<HTMLFormElement>>;
};
export const LogoutButton: FC<Props> = ({ form: Form }) => {
  return (
    <Form>
      <Button type="submit" className="w-full">
        ログアウト
      </Button>
    </Form>
  );
};
