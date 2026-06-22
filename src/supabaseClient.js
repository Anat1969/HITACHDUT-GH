import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://slcpldoaaagkoozpbjsk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsY3BsZG9hYWFna29venBianNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM0MjEsImV4cCI6MjA5NDM2OTQyMX0.g0iLhliFQNlD3Ey_mrvwMolppj-nV24Pj9klrFtsLWo"
);

export const BUCKET = "prompt-images";

function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const raw = atob(parts[1]);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

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
    if (!file.name || file.name === ".emptyFolderPlaceholder") continue;
    const id = file.name.replace(/\.[^.]+$/, "");
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(file.name);
    images[id] = urlData.publicUrl + "?t=" + file.updated_at;
  }
  return images;
}

export async function migrateLocalStorageToSupabase() {
  const LS_KEY = "afa-prompt-images";
  let localImages;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    localImages = JSON.parse(raw);
  } catch {
    return {};
  }

  if (!localImages || typeof localImages !== "object" || Object.keys(localImages).length === 0) {
    return {};
  }

  const existing = await listPromptImages();
  const migrated = { ...existing };
  let didMigrate = false;

  for (const [promptId, dataURL] of Object.entries(localImages)) {
    if (!dataURL || typeof dataURL !== "string" || !dataURL.startsWith("data:image")) continue;
    if (existing[promptId]) continue;

    try {
      const blob = dataURLtoBlob(dataURL);
      const mime = blob.type || "image/png";
      const ext = mime.split("/")[1] || "png";
      const path = `${promptId}.${ext}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { upsert: true, contentType: mime });

      if (!error) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        migrated[promptId] = data.publicUrl + "?t=" + Date.now();
        didMigrate = true;
      }
    } catch (err) {
      console.error("Migration failed for", promptId, err);
    }
  }

  if (didMigrate) {
    localStorage.removeItem(LS_KEY);
  }

  return migrated;
}

export default supabase;
