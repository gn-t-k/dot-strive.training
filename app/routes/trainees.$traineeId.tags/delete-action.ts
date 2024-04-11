import {
  type AppLoadContext,
  type TypedResponse,
  json,
} from "@remix-run/cloudflare";
import { checkOwnTag } from "app/features/tag/check-own-tag";
import { deleteTag } from "app/features/tag/delete-tag";
import type { Trainee } from "app/features/trainee/schema";

type DeleteAction = (props: {
  formData: FormData;
  context: AppLoadContext;
  trainee: Trainee;
}) => Promise<
  TypedResponse<
    | {
        action: "delete";
        success: false;
        description: string;
      }
    | {
        action: "delete";
        success: true;
        description: string;
      }
  >
>;
export const deleteAction: DeleteAction = async ({
  formData,
  context,
  trainee,
}) => {
  const tagId = formData.get("id")?.toString();
  if (!tagId) {
    return json({
      action: "delete",
      success: false,
      description: 'formData "id" is not found',
    });
  }

  const checkOwnTagResult = await checkOwnTag(context)({
    traineeId: trainee.id,
    tagId,
  });
  if (checkOwnTagResult.result === "failure") {
    return json({
      action: "delete",
      success: false,
      description: "check own tag failed",
    });
  }
  const isOwnTag = checkOwnTagResult.data;
  if (!isOwnTag) {
    return json({
      action: "delete",
      success: false,
      description: "not own tag",
    });
  }

  const deleteResult = await deleteTag(context)({ id: tagId });
  if (deleteResult.result === "failure") {
    return json({
      action: "delete",
      success: false,
      description: "delete data failed",
    });
  }

  return json({
    action: "delete",
    success: true,
    description: "success",
  });
};
