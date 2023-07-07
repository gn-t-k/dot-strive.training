import { err, ok, type Result } from "neverthrow";

import { getFetcher } from "@/app/_utils/get-fetcher";

type RegisterInitialData = () => Promise<Result<string, Error>>;
export const registerInitialData: RegisterInitialData = async () => {
  const registerResponse = await getFetcher({
    method: "POST",
  })(`/api/trainees/onboarding`);

  if (registerResponse.ok) {
    return ok("登録に成功しました");
  } else {
    const result = await registerResponse.json();

    return err(new Error(`初期登録に失敗しました: ${JSON.stringify(result)}`));
  }
};
