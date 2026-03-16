"use client";

import { useRef, useCallback } from "react";
import { Reorder, motion } from "framer-motion";
import { ImagePlus, Star, X, GripVertical } from "lucide-react";
import type { ImageItem } from "./types";

interface Props {
  images: ImageItem[];
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
}

const MAX_FILES = 20;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Step4Photos({ images, setImages }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: File[]) => {
      const valid = files
        .filter((f) => ACCEPTED.includes(f.type))
        .slice(0, MAX_FILES - images.length);

      const newItems: ImageItem[] = valid.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary: images.length === 0 && valid.indexOf(file) === 0,
      }));

      setImages((prev) => [...prev, ...newItems]);
    },
    [images.length, setImages]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const setPrimary = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === id }))
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      // If we removed the primary, auto-assign the first remaining
      if (prev.find((img) => img.id === id)?.isPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const dropZoneActive = images.length < MAX_FILES;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">Photos</h2>
        <p className="text-[#64748B] text-sm">
          Listings with 10+ photos receive 3× more inquiries. Add up to {MAX_FILES} images.
        </p>
      </div>

      {/* Drop zone */}
      {dropZoneActive && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#2563EB] bg-slate-50 hover:bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
            <ImagePlus size={24} className="text-[#2563EB]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#0F172A]">
              Drop photos here or click to browse
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              JPG, PNG, WEBP — max {MAX_FILES} images
              {images.length > 0 && ` (${images.length}/${MAX_FILES} added)`}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(",")}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* Image list — drag to reorder */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#0F172A]">
              {images.length} photo{images.length > 1 ? "s" : ""} added
            </p>
            <p className="text-xs text-[#64748B]">
              Drag to reorder · ★ = cover photo
            </p>
          </div>

          <Reorder.Group
            axis="y"
            values={images}
            onReorder={setImages}
            className="space-y-2"
          >
            {images.map((img, idx) => (
              <Reorder.Item
                key={img.id}
                value={img}
                className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3 cursor-grab active:cursor-grabbing shadow-sm"
              >
                {/* Drag handle */}
                <GripVertical size={16} className="text-slate-300 flex-shrink-0" />

                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">
                    {img.isPrimary && (
                      <span className="text-[#2563EB] mr-1">Cover •</span>
                    )}
                    Photo {idx + 1}
                  </p>
                  <p className="text-xs text-[#64748B]">{formatBytes(img.file.size)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setPrimary(img.id)}
                    title="Set as cover photo"
                    className={`p-1.5 rounded-lg transition-colors ${
                      img.isPrimary
                        ? "text-amber-500 bg-amber-50"
                        : "text-slate-300 hover:text-amber-400 hover:bg-amber-50"
                    }`}
                  >
                    <Star size={15} />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() => removeImage(img.id)}
                    title="Remove"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={15} />
                  </motion.button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-4 text-[#64748B] text-sm">
          No photos yet — listings with photos get far more visibility.
        </div>
      )}
    </div>
  );
}
