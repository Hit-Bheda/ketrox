import { supabase } from "@/lib/supabase/client";
import QRCode from "qrcode"; 
import { v4 as uuidv4 } from "uuid";

// Function to generate QR code image, upload to Supabase, and return the URL
export async function generateQrImage(url: string): Promise<string> {
  const qrBuffer: Buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 400,
  });

  const fileName = `${Date.now()}-${uuidv4()}.png`;
  const filePath = `qr-codes/${fileName}`;

  // Get a client
  const supabaseClient = supabase();

  // Upload QR buffer
  const { error } = await supabaseClient.storage
    .from("mybucket")
    .upload(filePath, qrBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data, error: signedUrlError } = await supabaseClient.storage
    .from("mybucket")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365);

  if (signedUrlError || !data) {
    throw new Error(signedUrlError?.message || "Failed to create signed URL");
  }

  return data.signedUrl;
}