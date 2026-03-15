import { randomUUID } from "node:crypto";
import { assertCloudinaryConfig } from "../config/cloudinary.js";

interface UploadInput {
  folder: "audio" | "images" | "responses";
  userId: string;
  extension: string;
  mimeType: string;
  buffer: Buffer;
  fileNamePrefix?: string;
}

export async function uploadBufferToStorage(input: UploadInput) {
  const cloudinary = assertCloudinaryConfig();
  const publicId = `${input.fileNamePrefix ?? Date.now()}-${randomUUID()}`;
  const folder = `dko/${input.folder}/${input.userId}`;
  const dataUri = `data:${input.mimeType};base64,${input.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicId,
    resource_type: input.folder === "audio" ? "video" : "image"
  });

  return {
    path: `${folder}/${publicId}.${input.extension}`,
    url: result.secure_url
  };
}
