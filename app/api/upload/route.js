import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: "Image is required" }), {
        status: 400,
      });
    }

    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: "after-images",
    });

    return new Response(JSON.stringify({ url: uploadRes.secure_url }), {
      status: 200,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}
