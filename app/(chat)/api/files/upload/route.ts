import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

function getUploadDir() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.issues
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const originalName = (formData.get("file") as File).name;
    const ext = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, "");
    const safeName = `${nanoid()}${ext}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    try {
      const uploadDir = getUploadDir();
      await mkdir(/* turbopackIgnore: true */ uploadDir, { recursive: true });
      await writeFile(
        path.join(/* turbopackIgnore: true */ uploadDir, safeName),
        fileBuffer
      );

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

      return NextResponse.json({
        contentType: file.type,
        pathname: originalName,
        url: `${basePath}/api/uploads/${safeName}`,
      });
    } catch {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
