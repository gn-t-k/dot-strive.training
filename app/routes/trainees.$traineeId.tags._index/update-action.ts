import type { SubmissionResult } from "@conform-to/react";
import {
  type AppLoadContext,
  type TypedResponse,
  json,
} from "@remix-run/cloudflare";
import { checkOwnTag } from "app/features/tag/check-own-tag";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { validateTag } from "app/features/tag/schema";
import { updateTag } from "app/features/tag/update-tag";
import type { Trainee } from "app/features/trainee/schema";
import { parseWithValibot } from "conform-to-valibot";
import { getTagFormSchema } from "./tag-form";

type UpdateAction = (props: {
  formData: FormData;
  context: AppLoadContext;
  trainee: Trainee;
}) => Promise<
  TypedResponse<
    | {
        action: "update";
        success: false;
        description: string;
        submission?: SubmissionResult<string[]>;
      }
    | {
        action: "update";
        success: true;
        description: string;
        submission: SubmissionResult<string[]>;
      }
  >
>;
export const updateAction: UpdateAction = async ({
  formData,
  context,
  trainee,
}) => {
  const tagId = formData.get("id")?.toString();
  if (!tagId) {
    return json({
      action: "update",
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
      action: "update",
      success: false,
      description: "check own tag failed",
    });
  }
  const isOwnTag = checkOwnTagResult.data;
  if (!isOwnTag) {
    return json({
      action: "update",
      success: false,
      description: "not own tag",
    });
  }

  const getTagsResult = await getTagsByTraineeId(context)(trainee.id);
  if (getTagsResult.result === "failure") {
    return json({
      action: "update",
      success: false,
      description: "get tags failed",
    });
  }
  const registeredTags = getTagsResult.data;

  const beforeName = registeredTags.find((tag) => tag.id === tagId)?.name;
  const submission = parseWithValibot(formData, {
    schema: getTagFormSchema({ registeredTags, beforeName }),
  });
  if (submission.status !== "success") {
    return json({
      action: "update",
      success: false,
      description: "form validation failed",
      submission: submission.reply(),
    });
  }

  const tag = validateTag({
    id: tagId,
    name: submission.value.name,
  });
  if (!tag) {
    return json({
      action: "update",
      success: false,
      description: "domain validation failed",
    });
  }

  const updateResult = await updateTag(context)(tag);
  if (updateResult.result === "failure") {
    return json({
      action: "update",
      success: false,
      description: "update data failed",
    });
  }

  return json({
    action: "update",
    success: true,
    description: "success",
    submission: submission.reply(),
  });
};
