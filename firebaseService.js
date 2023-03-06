import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

class UserExtensionDataService {
  addUser = (newUser) => {
    const userRef = doc(db, "users-extensions", newUser.id);
    return setDoc(userRef, newUser);
  };

  updateUserExtensions = (id, extns) => {
    const userRef = doc(db, "users-extensions", id);
    return updateDoc(userRef, { extensions: extns });
  };

  deleteUser = (id) => {
    const usersDocRef = doc(db, "users-extensions", id);
    return deleteDoc(usersDocRef);
  };

  getAllUsers = async () => {
    const colRef = collection(db, "users-extensions");
    const docsSnap = await getDocs(colRef);

    const allDocs = docsSnap.docs.map((doc) => {
      return {
        id: doc.id,
        data: doc.data(),
      };
    });

    return allDocs;
  };

  getUser = async (id) => {
    try {
      const docRef = await doc(db, "users-extensions", id);
      const docSnap = await getDoc(docRef);
      const ret = docSnap.data();
      return ret;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
}

export const service = new UserExtensionDataService();
