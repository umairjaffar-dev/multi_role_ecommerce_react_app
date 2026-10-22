import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/api-error";
import { useUploadProductImageMutation } from "../../api/product.mutations";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGES_PER_PRODUCT,
  type AdminProductImageSchemaType,
} from "../../schemas/product.schema";
import { ProductImage } from "../product-image";

const ALLOWED_TYPES: ReadonlyArray<string> = ALLOWED_IMAGE_TYPES;

/** Client-side checks give instant feedback; the backend re-checks the real file bytes. */
function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return `${file.name}: only JPEG, PNG and WebP are allowed`;
  if (file.size > MAX_IMAGE_SIZE_BYTES) return `${file.name}: image must be at most 5 MB`;
  return null;
}

type UploadStateType = { fileName: string; percent: number; index: number; total: number };

/**
 * Gallery + uploader for one product. Files upload one at a time (the backend accepts one
 * file per request and locks the product row), with a progress indicator per file.
 */
export function ProductImageManager({
  productId,
  images,
  disabled = false,
}: {
  productId: string;
  images: Array<AdminProductImageSchemaType>;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadProductImageMutation(productId);
  const [upload, setUpload] = useState<UploadStateType | null>(null);

  const remainingSlots = MAX_IMAGES_PER_PRODUCT - images.length;
  const isUploading = upload !== null;

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ""; // allow picking the same file again later
    if (files.length === 0) return;

    if (files.length > remainingSlots) {
      toast.error(`You can add ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}.`);
      return;
    }

    const invalid = files.map(validateImageFile).filter((message) => message !== null);
    if (invalid.length > 0) {
      invalid.forEach((message) => toast.error(message));
      return;
    }

    let uploadedCount = 0;
    for (const [index, file] of files.entries()) {
      setUpload({ fileName: file.name, percent: 0, index: index + 1, total: files.length });
      try {
        await uploadMutation.mutateAsync({
          file,
          onProgress: (percent) => {
            setUpload((current) => (current ? { ...current, percent } : current));
          },
        });
        uploadedCount += 1;
      } catch (error) {
        toast.error(`${file.name}: ${getErrorMessage(error)}`);
        break;
      }
    }
    setUpload(null);
    if (uploadedCount > 0) {
      toast.success(`${uploadedCount} image${uploadedCount === 1 ? "" : "s"} uploaded`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {images.length} / {MAX_IMAGES_PER_PRODUCT} images · JPEG, PNG or WebP up to 5 MB. The
          first image is the cover.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          multiple
          hidden
          onChange={(event) => void handleFiles(event)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading || remainingSlots <= 0}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {isUploading ? "Uploading…" : "Add images"}
        </Button>
      </div>

      {upload && (
        <div className="space-y-1" aria-live="polite">
          <p className="text-sm">
            Uploading {upload.fileName} ({upload.index}/{upload.total}) – {upload.percent}%
          </p>
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={upload.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${upload.percent}%` }}
            />
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No images yet. Products with a photo sell better.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="relative overflow-hidden rounded-lg border">
              <ProductImage src={image.url} alt={`Product image ${index + 1}`} />
              {index === 0 && (
                <Badge className="absolute top-2 left-2" variant="secondary">
                  Cover
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
