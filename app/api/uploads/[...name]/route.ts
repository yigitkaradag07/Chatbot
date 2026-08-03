import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

function getUploadDir() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string[] }> }
) {
  const { name } = await params;
  const filename = name.join("/");

  if (filename.includes("..") || path.isAbsolute(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const filePath = path.join(
      /* turbopackIgnore: true */ getUploadDir(),
      filename
    );
    const file = await readFile(filePath);
    return new Response(new Uint8Array(file), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
