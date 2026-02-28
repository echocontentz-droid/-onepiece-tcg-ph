"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CARD_SETS, CARD_CONDITIONS, CARD_RARITIES,
  SHIPPING_METHODS, PH_PROVINCES, MIN_LISTING_IMAGES, MAX_LISTING_IMAGES
} from "@/lib/constants";
import { createListingSchema, type CreateListingInput } from "@/lib/validations/listing";
import { createClient } from "@/lib/supabase/client";
import { cn, formatPHP, isValidImageType, isValidImageSize } from "@/lib/utils";
import toast from "react-hot-toast";

interface ListingFormProps {
  userId: string;
}

interface UploadedImage {
  file: File;
  preview: string;
  path?: string;
  uploading?: boolean;
  error?: string;
}

export function ListingForm({ userId }: ListingFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      language: "English",
      is_foil: false,
      quantity: 1,
      is_negotiable: false,
      allows_meetup: false,
      free_shipping: false,
      shipping_fee: 0,
      shipping_options: [],
      image_paths: [],
    },
  });

  const price = watch("price");
  const freeShipping = watch("free_shipping");
  const allowsMeetup = watch("allows_meetup");
  const shippingOptions = watch("shipping_options") ?? [];

  // Image upload
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const remaining = MAX_LISTING_IMAGES - images.length;
      const filesToAdd = acceptedFiles.slice(0, remaining);

      for (const file of filesToAdd) {
        if (!isValidImageType(file)) {
          toast.error(`${file.name}: Invalid file type (JPEG, PNG, WEBP only)`);
          continue;
        }
        if (!isValidImageSize(file, 10)) {
          toast.error(`${file.name}: File too large (max 10MB)`);
          continue;
        }

        const preview = URL.createObjectURL(file);
        const idx = images.length;

        setImages((prev) => [...prev, { file, preview, uploading: true }]);

        // Upload to Supabase storage
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from("listing-images")
          .upload(path, file, { cacheControl: "3600" });

        if (error) {
          setImages((prev) =>
            prev.map((img, i) =>
              i === idx ? { ...img, uploading: false, error: "Upload failed" } : img
            )
          );
          toast.error(`Failed to upload ${file.name}`);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("listing-images")
            .getPublicUrl(path);

          setImages((prev) => {
            const updated = prev.map((img, i) =>
              i === idx
                ? { ...img, uploading: false, path, preview: publicUrl }
                : img
            );
            const paths = updated.filter((i) => i.path).map((i) => i.path!);
            setValue("image_paths", paths, { shouldValidate: true });
            return updated;
          });
        }
      }
    },
    [images.length, userId, supabase, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    multiple: true,
    disabled: images.length >= MAX_LISTING_IMAGES,
  });

  const removeImage = (idx: number) => {
    const img = images[idx];
    if (img.path) {
      supabase.storage.from("listing-images").remove([img.path]);
    }
    URL.revokeObjectURL(img.preview);
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      setValue(
        "image_paths",
        updated.filter((i) => i.path).map((i) => i.path!),
        { shouldValidate: true }
      );
      return updated;
    });
  };

  const toggleShipping = (method: string) => {
    const current = shippingOptions;
    const updated = current.includes(method as any)
      ? current.filter((m) => m !== method)
      : [...current, method];
    setValue("shipping_options", updated as any, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateListingInput) => {
    if (images.some((i) => i.uploading)) {
      toast.error("Please wait for all images to upload");
      return;
    }
    if (images.some((i) => i.error)) {
      toast.error("Some images failed to upload. Please remove them and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Failed to create listing");
      toast.success("Listing created successfully!");
      router.push(`/listings/${result.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Card Details */}
      <FormSection title="Card Details" icon="🃏">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Card Name *</label>
            <Input
              placeholder="e.g. Monkey D. Luffy, Roronoa Zoro"
              error={errors.card_name?.message}
              {...register("card_name")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Card Number</label>
            <Input
              placeholder="e.g. OP01-001"
              {...register("card_number")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Language</label>
            <select
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("language")}
            >
              <option>English</option>
              <option>Japanese</option>
              <option>Traditional Chinese</option>
              <option>Simplified Chinese</option>
              <option>Korean</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Card Set *</label>
            <select
              className={cn(
                "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                errors.card_set && "border-destructive"
              )}
              {...register("card_set")}
            >
              <option value="">Select set...</option>
              {Object.entries(CARD_SETS).map(([value, label]) => (
                <option key={value} value={value}>{value} — {label.split(" — ")[1] ?? label}</option>
              ))}
            </select>
            {errors.card_set && <p className="text-xs text-destructive">{errors.card_set.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Rarity *</label>
            <select
              className={cn(
                "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                errors.rarity && "border-destructive"
              )}
              {...register("rarity")}
            >
              <option value="">Select rarity...</option>
              {Object.entries(CARD_RARITIES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.rarity && <p className="text-xs text-destructive">{errors.rarity.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Condition *</label>
            <select
              className={cn(
                "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                errors.condition && "border-destructive"
              )}
              {...register("condition")}
            >
              <option value="">Select condition...</option>
              {Object.entries(CARD_CONDITIONS).map(([value, { label, description }]) => (
                <option key={value} value={value} title={description}>{label}</option>
              ))}
            </select>
            {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Quantity</label>
            <Input
              type="number"
              min={1}
              max={100}
              {...register("quantity", { valueAsNumber: true })}
              error={errors.quantity?.message}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="is_foil" className="h-4 w-4 rounded accent-primary" {...register("is_foil")} />
            <label htmlFor="is_foil" className="text-sm font-medium cursor-pointer">
              Foil / Parallel Art variant
            </label>
          </div>
        </div>
      </FormSection>

      {/* Listing Details */}
      <FormSection title="Listing Details" icon="📝">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Listing Title *</label>
            <Input
              placeholder="e.g. NM Monkey D. Luffy SEC OP01-120 English"
              error={errors.title?.message}
              {...register("title")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Describe the card's condition, any defects, or other details buyers should know..."
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Price (PHP) *</label>
              <Input
                type="number"
                placeholder="0"
                min={1}
                {...register("price", { valueAsNumber: true })}
                error={errors.price?.message}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded accent-primary" {...register("is_negotiable")} />
                <span className="text-sm">Negotiable</span>
              </label>
            </div>
          </div>

          {price > 0 && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Platform fee (3%): <strong className="text-foreground">{formatPHP(price * 0.03)}</strong> —
              you receive: <strong className="text-foreground">{formatPHP(price * 0.97)}</strong>
            </div>
          )}
        </div>
      </FormSection>

      {/* Photos */}
      <FormSection title="Card Photos" icon="📸">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Upload at least {MIN_LISTING_IMAGES} clear photos (front, back, corners).
            Good photos = faster sales.
          </p>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              images.length >= MAX_LISTING_IMAGES && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive ? "Drop photos here..." : "Click or drag photos here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, WEBP · Max 10MB each · {images.length}/{MAX_LISTING_IMAGES} uploaded
            </p>
          </div>

          {/* Image preview grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview} alt="" className="object-cover w-full h-full" />
                  {img.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    </div>
                  )}
                  {img.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-destructive/80">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {img.path && !img.uploading && (
                    <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {i === 0 && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-primary text-[10px] font-bold text-white">
                      MAIN
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.image_paths && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.image_paths.message}
            </p>
          )}
        </div>
      </FormSection>

      {/* Location & Shipping */}
      <FormSection title="Location & Shipping" icon="📦">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Province *</label>
              <select
                className={cn(
                  "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.location_province && "border-destructive"
                )}
                {...register("location_province")}
              >
                <option value="">Select province...</option>
                {PH_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.location_province && (
                <p className="text-xs text-destructive">{errors.location_province.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">City / Municipality *</label>
              <Input
                placeholder="e.g. Makati City, Cebu City"
                error={errors.location_city?.message}
                {...register("location_city")}
              />
            </div>
          </div>

          {/* Shipping options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Shipping Options *</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SHIPPING_METHODS).map(([method, { label, icon }]) => {
                const isSelected = shippingOptions.includes(method as any);
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleShipping(method)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border text-sm text-left transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <span>{icon}</span>
                    <span className={isSelected ? "font-medium" : ""}>{label}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
            {errors.shipping_options && (
              <p className="text-xs text-destructive">{errors.shipping_options.message}</p>
            )}
          </div>

          {/* Shipping fee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Shipping Fee (PHP)</label>
              <Input
                type="number"
                min={0}
                disabled={freeShipping}
                placeholder="0"
                {...register("shipping_fee", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded accent-primary" {...register("free_shipping")} />
                <span className="text-sm">Free Shipping</span>
              </label>
            </div>
          </div>

          {/* Meetup */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded accent-primary" {...register("allows_meetup")} />
              <span className="text-sm font-medium">Allow Meetup Transactions</span>
            </label>
            {allowsMeetup && (
              <textarea
                placeholder="Suggest meetup locations (e.g. SM Mall, LRT stations...)"
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                {...register("meetup_details")}
              />
            )}
          </div>
        </div>
      </FormSection>

      {/* Submit */}
      <div className="flex gap-3 pb-8">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" size="lg" loading={submitting}>
          Publish Listing
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  title, icon, children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}
