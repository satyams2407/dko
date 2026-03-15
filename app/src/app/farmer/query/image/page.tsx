"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, Eye, Leaf, UploadCloud } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient, uploadFile } from "@/lib/api";

const imageHero =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80&auto=format&fit=crop";

interface UploadResponse {
  success: true;
  data: {
    url: string;
    path: string;
    mimeType: string;
  };
}

interface QueryCreateResponse {
  success: true;
  data: {
    query: { queryId: string };
  };
}

export default function FarmerImageQueryPage() {
  const router = useRouter();
  const { appUser, loading } = useAuth();
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !appUser) {
      router.replace("/farmer/login");
    }
  }, [appUser, loading, router]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function updateImageFile(file: File) {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!imageFile) {
      setError("Upload a crop image first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const uploadResult = await uploadFile<UploadResponse>("/upload/image", imageFile);
      const queryResult = await apiClient.post<QueryCreateResponse>("/queries", {
        type: "image",
        imageUrl: uploadResult.data.data.url,
        imageMimeType: uploadResult.data.data.mimeType,
        description: description.trim()
      });

      router.push(`/farmer/response/${queryResult.data.data.query.queryId}`);
    } catch (submitError) {
      console.error(submitError);
      setError("Failed to analyze the image. Check backend connectivity and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !appUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#6B7280]">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] px-5 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <a className="inline-flex items-center text-sm font-semibold text-[#0A0A0A]" href="/farmer/query">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to query workspace
          </a>
          <div className="inline-flex items-center rounded-full border border-[#C8E6C9] bg-[#F1F8E9] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#2E7D32]">
            <Camera className="mr-2 h-4 w-4" /> Image advisory live
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(10,10,10,0.06)]">
            <div
              className="h-[240px] w-full"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.04) 0%, rgba(10,10,10,0.42) 100%), url('${imageHero}')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
            <div className="p-6 md:p-8">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                <Leaf className="h-4 w-4" /> Visual crop diagnosis
              </div>
              <h1
                className="mt-4 text-[40px] font-bold leading-[1.04] tracking-[-1.4px] md:text-[54px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Show The Crop. Add The Context.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-[#6B7280]">
                Upload one clear field image, mention the crop and symptom timeline, and the AI will return a probable issue summary with practical next steps.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-[#6B7280]">
                {[
                  "Capture leaves in focus and avoid heavy shadows.",
                  "Add one full-plant or canopy image for context.",
                  "Mention whether the issue began after rain, heat, or spraying."
                ].map((tip) => (
                  <div key={tip} className="rounded-2xl bg-[#F9FAFB] px-4 py-3">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_30px_70px_rgba(10,10,10,0.08)] md:p-8"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Image query</div>
                <h2
                  className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Upload your best crop photo.
                </h2>
              </div>
              <div className="rounded-full border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#6B7280]">
                Max 5 MB
              </div>
            </div>

            <label className="mt-6 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D1D5DB] bg-[#FCFCFB] px-6 py-8 text-center transition hover:border-[#2E7D32] hover:bg-white">
              <UploadCloud className="h-9 w-9 text-[#2E7D32]" />
              <div className="mt-4 text-base font-semibold text-[#0A0A0A]">Select an image from your device</div>
              <div className="mt-2 text-sm leading-7 text-[#6B7280]">JPEG, PNG, or WebP. A clear close-up plus a short note gives the best result.</div>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    updateImageFile(file);
                  }
                }}
                type="file"
              />
            </label>

            <label className="mt-6 block text-sm font-medium text-[#0A0A0A]">
              Symptom note
              <textarea
                className="mt-2 min-h-[160px] w-full rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] px-5 py-4 text-base leading-7 outline-none transition focus:border-[#2E7D32]"
                maxLength={300}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Example: This is chilli crop. White patches started two days ago on lower leaves and the leaf edges are curling after recent humid weather."
                value={description}
              />
            </label>

            {imagePreviewUrl ? (
              <div className="mt-6 overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-[#FCFCFB] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.22em] text-[#6B7280]">Image preview</div>
                    <div className="mt-2 text-sm font-semibold text-[#0A0A0A]">{imageFile?.name}</div>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#6B7280]">
                    <Eye className="mr-2 h-4 w-4" /> {(imageFile ? imageFile.size / (1024 * 1024) : 0).toFixed(2)} MB
                  </div>
                </div>
                <img alt="Crop preview" className="mt-4 h-[260px] w-full rounded-[24px] object-cover" src={imagePreviewUrl} />
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm leading-7 text-[#6B7280]">
                The uploaded image and your note will be analyzed together, then saved with the advisory response.
              </div>
              <motion.button
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
                disabled={submitting || !imageFile}
                onClick={handleSubmit}
                type="button"
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
              >
                {submitting ? "Analyzing image..." : "Get Image Advice"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
