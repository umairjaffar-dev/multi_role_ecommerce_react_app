import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm, useWatch, type UseFormSetError } from "react-hook-form";
import { FormAlert } from "@/components/shared/form-alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  getCameraFormSchema,
  STREAM_PATH_REGEX,
  suggestStreamPath,
  type CameraFormInputType,
  type CameraFormOutputType,
} from "../../schemas/camera.schema";

export type CameraFormSubmitType = {
  values: CameraFormOutputType;
  /** Fields the admin actually changed; the edit page PATCHes only these. */
  dirtyFields: Partial<Record<keyof CameraFormInputType, boolean>>;
  setError: UseFormSetError<CameraFormInputType>;
};

/** Shared create/edit form for a camera. */
export function CameraForm({
  mode,
  defaultValues,
  currentRtspUrlMasked,
  isPending,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues: CameraFormInputType;
  /** Edit only: the saved source with its password masked, shown as a hint. */
  currentRtspUrlMasked?: string;
  isPending: boolean;
  onSubmit: (submit: CameraFormSubmitType) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<CameraFormInputType, unknown, CameraFormOutputType>({
    resolver: zodResolver(getCameraFormSchema(mode)),
    defaultValues,
    mode: "onTouched",
  });

  const name = useWatch({ control, name: "name" });
  const streamPath = useWatch({ control, name: "streamPath" });
  const suggestedPath = suggestStreamPath(name);
  const effectivePath = streamPath.trim().toLowerCase() || suggestedPath;

  const submit = (values: CameraFormOutputType) => {
    // An empty stream path on create falls back to the name; that suggestion must be valid too
    if (mode === "create" && !STREAM_PATH_REGEX.test(values.streamPath || suggestedPath)) {
      setError("streamPath", {
        type: "required",
        message: "Enter a stream path (the name does not give a usable one)",
      });
      return;
    }
    onSubmit({ values, dirtyFields, setError });
  };

  return (
    <form onSubmit={(event) => void handleSubmit(submit)(event)} noValidate>
      <fieldset disabled={isPending} className="contents">
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                placeholder="Warehouse gate"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </Field>

            <Field data-invalid={Boolean(errors.location)}>
              <FieldLabel htmlFor="location">
                Location <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="location"
                placeholder="Block A, ground floor"
                aria-invalid={Boolean(errors.location)}
                {...register("location")}
              />
              <FieldError message={errors.location?.message} />
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.rtspUrl)}>
            <FieldLabel htmlFor="rtspUrl">
              RTSP URL{" "}
              {mode === "edit" && <span className="text-muted-foreground">(optional)</span>}
            </FieldLabel>
            <Input
              id="rtspUrl"
              type="url"
              autoComplete="off"
              spellCheck={false}
              placeholder={
                mode === "edit"
                  ? "Leave empty to keep the current address"
                  : "rtsp://user:password@192.168.1.64:554/stream"
              }
              aria-invalid={Boolean(errors.rtspUrl)}
              {...register("rtspUrl")}
            />
            <FieldDescription>
              {mode === "edit" && currentRtspUrlMasked ? (
                <>
                  Current: <code className="break-all">{currentRtspUrlMasked}</code>. The saved
                  address is encrypted and never sent back, so type the full address to change it.
                </>
              ) : (
                <>
                  The media server pulls video from here. It is stored encrypted and shown later
                  with the password hidden. Lab cameras: <code>rtsp://localhost:8554/fake1</code>,{" "}
                  <code>fake2</code>.
                </>
              )}
            </FieldDescription>
            <FieldError message={errors.rtspUrl?.message} />
          </Field>

          <Field data-invalid={Boolean(errors.streamPath)}>
            <FieldLabel htmlFor="streamPath">
              Stream path{" "}
              {mode === "create" && <span className="text-muted-foreground">(optional)</span>}
            </FieldLabel>
            <Input
              id="streamPath"
              autoComplete="off"
              spellCheck={false}
              placeholder={mode === "create" ? suggestedPath || "cam1" : ""}
              aria-invalid={Boolean(errors.streamPath)}
              {...register("streamPath")}
            />
            <FieldDescription>
              Playback path: /{effectivePath || "…"}/index.m3u8
              {mode === "edit" && " · Changing it moves the stream; open players reconnect."}
            </FieldDescription>
            <FieldError message={errors.streamPath?.message} />
          </Field>

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <FieldLabel htmlFor="isActive">Active</FieldLabel>
                  <FieldDescription>
                    Disabled cameras stay saved but are not streamed or shown in the live view.
                  </FieldDescription>
                </div>
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </div>
            )}
          />

          <FormAlert message={errors.root?.server?.message} />

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || (mode === "edit" && !isDirty)}>
              {isPending && <Loader2 className="animate-spin" />}
              {mode === "create" ? "Add camera" : "Save changes"}
            </Button>
          </div>
        </FieldGroup>
      </fieldset>
    </form>
  );
}
