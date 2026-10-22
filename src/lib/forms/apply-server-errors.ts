import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toApiError } from "@/lib/api/api-error";

/**
 * Maps a failed API call onto a React Hook Form.
 * - VALIDATION_ERROR with field details -> error under each matching input.
 *   `fieldMap` renames API fields to form fields (e.g. priceInPaisa -> price).
 * - Known field-specific codes (e.g. EMAIL_ALREADY_EXISTS) -> error under that input.
 * - Anything else -> form-level "root.server" error shown above the submit button.
 */
export function applyServerErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  options: {
    fields: ReadonlyArray<Path<TFieldValues>>;
    fieldMap?: Partial<Record<string, Path<TFieldValues>>>;
    codeToField?: Partial<Record<string, Path<TFieldValues>>>;
  },
): void {
  const apiError = toApiError(error);
  let hasFieldError = false;

  for (const issue of apiError.validationIssues) {
    const field =
      options.fieldMap?.[issue.field] ?? options.fields.find((name) => name === issue.field);
    if (field) {
      setError(field, { type: "server", message: issue.message });
      hasFieldError = true;
    }
  }

  const mappedField = options.codeToField?.[apiError.code];
  if (mappedField) {
    setError(mappedField, { type: "server", message: apiError.message }, { shouldFocus: true });
    hasFieldError = true;
  }

  if (!hasFieldError) {
    setError("root.server", { type: apiError.code, message: apiError.message });
  }
}
