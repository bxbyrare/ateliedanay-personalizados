import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { AppError } from "../../lib/errors.js";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from "@ateliedanay/shared";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

// memoryStorage: the file never touches disk under a client-controlled name/path —
// we only write it out ourselves, after real content-sniffing, under a random name.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES, files: 1 },
});

export const uploadMiddleware = upload.single("file");

export const handleUpload = asyncHandler(async (req: Request, res: Response) => {
  const kind = req.body?.kind === "video" ? "video" : req.body?.kind === "image" ? "image" : null;
  if (!kind) {
    throw new AppError(400, 'Informe "kind" como "image" ou "video"');
  }
  if (!req.file) {
    throw new AppError(400, "Nenhum arquivo enviado");
  }

  const maxSize = kind === "image" ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
  if (req.file.size > maxSize) {
    throw new AppError(400, "Arquivo excede o tamanho máximo permitido");
  }

  // Never trust the client-declared mimetype/extension — sniff the real file signature.
  const detected = await fileTypeFromBuffer(req.file.buffer);
  const allowList = kind === "image" ? ALLOWED_IMAGE_MIME_TYPES : ALLOWED_VIDEO_MIME_TYPES;

  if (!detected || !(allowList as readonly string[]).includes(detected.mime)) {
    throw new AppError(400, "Tipo de arquivo não permitido");
  }

  const ext = MIME_TO_EXT[detected.mime];
  const filename = `${randomBytes(16).toString("hex")}.${ext}`;
  const subdir = kind === "image" ? "products" : "videos";
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), req.file.buffer);

  res.status(201).json({ url: `/uploads/${subdir}/${filename}` });
});
