import { getFirestore } from "firebase/firestore";
import { auth } from "./firebase";

export { auth };
export const db = getFirestore(auth.app);
