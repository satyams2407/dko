"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Leaf, Mic, Square, UploadCloud, AudioLines } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient, uploadFile } from "@/lib/api";

const voiceImage =
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80&auto=format&fit=crop";

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

export default function FarmerVoiceQueryPage() {
  const router = useRouter();
  const { appUser, loading } = useAuth();
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!loading && !appUser) {
      router.replace("/farmer/login");
    }
  }, [appUser, loading, router]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioPreviewUrl]);

  function updateAudioFile(file: File) {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }

    setAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));
  }

  async function handleStartRecording() {
    setError(null);

    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
      setError("This browser does not support in-app recording. Please upload an audio file instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-query-${Date.now()}.webm`, { type: "audio/webm" });
        updateAudioFile(file);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (recordingError) {
      console.error(recordingError);
      setError("Microphone access failed. Check browser permissions or upload an audio file instead.");
    }
  }

  function handleStopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  }

  async function handleSubmit() {
    if (!audioFile) {
      setError("Record or upload a voice note first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const uploadResult = await uploadFile<UploadResponse>("/upload/audio", audioFile);
      const queryResult = await apiClient.post<QueryCreateResponse>("/queries", {
        type: "voice",
        audioUrl: uploadResult.data.data.url,
        audioMimeType: uploadResult.data.data.mimeType,
        description: description.trim()
      });

      router.push(`/farmer/response/${queryResult.data.data.query.queryId}`);
    } catch (submitError) {
      console.error(submitError);
      setError("Failed to process the voice query. Check backend connectivity and try again.");
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
            <Mic className="mr-2 h-4 w-4" /> Voice advisory live
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(10,10,10,0.06)]">
            <div
              className="h-[240px] w-full"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.04) 0%, rgba(10,10,10,0.42) 100%), url('${voiceImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
            <div className="p-6 md:p-8">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                <Leaf className="h-4 w-4" /> Hands-free advisory
              </div>
              <h1
                className="mt-4 text-[40px] font-bold leading-[1.04] tracking-[-1.4px] md:text-[54px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Speak What You See In The Field.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-[#6B7280]">
                Describe the crop, the visible issue, and how quickly it spread. Gemini will interpret the voice note, transcribe it, and return practical field guidance.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-[#6B7280]">
                {[
                  "Say the crop name first.",
                  "Mention the exact symptom: wilting, spots, curling, pests, yellowing.",
                  "Add whether the issue started after rain, irrigation, or spray."
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
                <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Voice query</div>
                <h2
                  className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Record or upload your field note.
                </h2>
              </div>
              <div className="rounded-full border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#6B7280]">
                Max 10 MB
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <button
                className={`inline-flex h-14 items-center justify-center rounded-[22px] border text-sm font-semibold transition ${recording ? "border-[#0A0A0A] bg-[#0A0A0A] text-white" : "border-[#E5E7EB] bg-[#F9FAFB] text-[#0A0A0A] hover:bg-white"}`}
                onClick={recording ? handleStopRecording : handleStartRecording}
                type="button"
              >
                {recording ? <Square className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                {recording ? "Stop recording" : "Start recording"}
              </button>

              <label className="inline-flex h-14 cursor-pointer items-center justify-center rounded-[22px] border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-semibold text-[#0A0A0A] transition hover:bg-white">
                <UploadCloud className="mr-2 h-4 w-4" /> Upload audio file
                <input
                  accept="audio/webm,audio/mp4,audio/mpeg"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      updateAudioFile(file);
                    }
                  }}
                  type="file"
                />
              </label>
            </div>

            <label className="mt-6 block text-sm font-medium text-[#0A0A0A]">
              Optional typed note
              <textarea
                className="mt-2 min-h-[160px] w-full rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] px-5 py-4 text-base leading-7 outline-none transition focus:border-[#2E7D32]"
                maxLength={300}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Example: This is paddy at vegetative stage. Leaves started yellowing after heavy rain and the patch is expanding from one side of the field."
                value={description}
              />
            </label>

            {audioFile ? (
              <div className="mt-6 rounded-[28px] border border-[#E5E7EB] bg-[#FCFCFB] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.22em] text-[#6B7280]">Selected audio</div>
                    <div className="mt-2 text-sm font-semibold text-[#0A0A0A]">{audioFile.name}</div>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#6B7280]">
                    <AudioLines className="mr-2 h-4 w-4" /> {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                {audioPreviewUrl ? <audio className="mt-4 w-full" controls src={audioPreviewUrl} /> : null}
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm leading-7 text-[#6B7280]">
                Your audio will be uploaded securely, analyzed by Gemini, and saved with the transcript and advisory.
              </div>
              <motion.button
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
                disabled={submitting || !audioFile}
                onClick={handleSubmit}
                type="button"
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
              >
                {submitting ? "Analyzing audio..." : "Get Voice Advice"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
