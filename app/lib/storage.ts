import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth } from "./firebase";

export const storage = getStorage(auth.app);

export async function uploadLogo(uid: string, subId: string, file: File): Promise<string> {
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `users/${uid}/logos/${subId}.${ext}`;
  const snap = await uploadBytes(ref(storage, path), file, { contentType: file.type });
  return getDownloadURL(snap.ref);
}

export async function deleteLogo(uid: string, subId: string, logoUrl: string): Promise<void> {
  try {
    const ext  = logoUrl.split("?")[0].split(".").pop() ?? "jpg";
    const path = `users/${uid}/logos/${subId}.${ext}`;
    await deleteObject(ref(storage, path));
  } catch {
    // ignore — file may not exist
  }
}
