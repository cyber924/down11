import { NextRequest, NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const fieldName = searchParams.get("field") || "localGuide";
  const indexStr = searchParams.get("index") || "0";
  const index = parseInt(indexStr, 10);

  if (!postId) {
    return new NextResponse("Missing postId", { status: 400 });
  }

  try {
    const { firestore } = initializeFirebase();
    const docSnap = await getDoc(doc(firestore, "packages", postId));
    if (!docSnap.exists()) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const data = docSnap.data();
    const htmlContent = data[fieldName] || "";

    const base64Regex = /src=["'](data:(image\/[^;]+);base64,([^"']+))["']/g;
    const matches: { mime: string; base64Data: string }[] = [];
    
    let match;
    while ((match = base64Regex.exec(htmlContent)) !== null) {
      const mime = match[2];
      const base64Data = match[3];
      matches.push({ mime, base64Data });
    }

    if (matches.length === 0 || index < 0 || index >= matches.length) {
      return new NextResponse("Image index not found", { status: 404 });
    }

    const targetImage = matches[index];
    const imageBuffer = Buffer.from(targetImage.base64Data, "base64");

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": targetImage.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error in image API route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
