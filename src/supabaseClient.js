import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://slcpldoaaagkoozpbjsk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsY3BsZG9hYWFna29venBianNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM0MjEsImV4cCI6MjA5NDM2OTQyMX0.g0iLhliFQNlD3Ey_mrvwMolppj-nV24Pj9klrFtsLWo"
);

export const BUCKET = "prompt-images";

export async function uploadPromptImage(promptId, file) {
  const ext = file.name?.split(".").pop() || "png";
  const path = `${promptId}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl + "?t=" + Date.now();
}

export async function deletePromptImage(promptId) {
  const { data } = await supabase.storage.from(BUCKET).list("", {
    search: promptId,
  });
  if (data && data.length > 0) {
    await supabase.storage
      .from(BUCKET)
      .remove(data.map((f) => f.name));
  }
}

export async function listPromptImages() {
  const { data, error } = await supabase.storage.from(BUCKET).list();
  if (error || !data) return {};

  const images = {};
  for (const file of data) {
    const id = file.name.replace(/\.[^.]+$/, "");
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(file.name);
    images[id] = urlData.publicUrl + "?t=" + file.updated_at;
  }
  return images;
}

export default supabase;
