"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { presignUpload, uploadToR2 } from "@/lib/api";
import { toast } from "sonner";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface UploadedImage {
  key: string;
  previewUrl: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 4 }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Solo se aceptan imágenes JPEG, PNG o WEBP.");
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error("La imagen supera el máximo de 5MB.");
        return;
      }
      if (images.length >= maxImages) {
        toast.error(`Máximo ${maxImages} imágenes por reseña.`);
        return;
      }

      setUploading(true);
      try {
        const presign = await presignUpload(file);
        await uploadToR2(presign, file);
        onChange([...images, { key: presign.r2Key, previewUrl: presign.publicUrl }]);
      } catch {
        toast.error("No se pudo subir la imagen. Intenta de nuevo.");
      } finally {
        setUploading(false);
      }
    },
    [images, maxImages, onChange]
  );

  function removeImage(key: string) {
    onChange(images.filter((img) => img.key !== key));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Subir imagen de evidencia, arrastra o presiona para elegir un archivo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200",
          dragging
            ? "border-primary bg-primary/10"
            : "border-border bg-muted/50 hover:border-primary hover:bg-primary/5"
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
        ) : (
          <ImagePlus className="size-6 text-primary" aria-hidden />
        )}
        <p className="text-sm text-muted-foreground">
          Arrastra una imagen aquí o haz clic para elegirla
          <br />
          JPEG, PNG o WEBP, máximo 5MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {images.map((img) => (
            <li key={img.key} className="relative size-24 overflow-hidden rounded-lg border border-border">
              <Image
                src={img.previewUrl}
                alt="Vista previa de evidencia"
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                aria-label="Quitar imagen"
                onClick={() => removeImage(img.key)}
                className="absolute right-1 top-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground shadow"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
