import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export function getCurrentUserSafe() {
  return new Promise<typeof auth.currentUser>((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}