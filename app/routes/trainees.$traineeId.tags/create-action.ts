import type { SubmissionResult } from "@conform-to/react";
import { createId } from "@paralleldrive/cuid2";
import {
  type AppLoadContext,
  type TypedResponse,
  json,
} from "@remix-run/cloudflare";
import { createTag } from "app/features/tag/create-tag";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { validateTag } from "app/features/tag/schema";
import type { Trainee } from "app/features/trainee/schema";
import { parseWithValibot } from "conform-to-valibot";
import { getTagFormSchema } from "./tag-form";

type CreateAction = (props: {
  formData: FormData;
  context: AppLoadContext;
  trainee: Trainee;
}) => Promise<
  TypedResponse<
    | {
        action: "create";
        success: false;
        description: string;
        submission?: SubmissionResult<string[]>;
      }
    | {
        action: "create";
        success: true;
        description: string;
        submission: SubmissionResult<string[]>;
      }
  >
>;
export const createAction: CreateAction = async ({
  formData,
  context,
  trainee,
}) => {
  const getTagsResult = await getTagsByTraineeId(context)(trainee.id);
  if (getTagsResult.result === "failure") {
    return json({
      action: "create",
      success: false,
      description: "get tags failed",
    });
  }
  const registeredTags = getTagsResult.data;

  const submission = parseWithValibot(formData, {
    schema: getTagFormSchema({ registeredTags }),
  });
  if (submission.status !== "success") {
    return json({
      action: "create",
      success: false,
      description: "form validation failed",
      submission: submission.reply(),
    });
  }

  const tag = validateTag({
    id: createId(),
    name: submission.value.name,
  });
  if (!tag) {
    return json({
      action: "create",
      success: false,
      description: "domain validation failed",
    });
  }

  const createResult = await createTag(context)({
    tag,
    traineeId: trainee.id,
  });
  if (createResult.result === "failure") {
    return json({
      action: "create",
      success: false,
      description: "create data failed ",
    });
  }

  return json({
    action: "create",
    success: true,
    description: "success",
    submission: submission.reply(),
  });
};
