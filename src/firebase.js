import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGgZehhl0kicu3r1EckA5HR7XLwAhICN0",
  authDomain: "todolist-2602179151.firebaseapp.com",
  projectId: "todolist-2602179151",
  storageBucket: "todolist-2602179151.appspot.com",
  messagingSenderId: "721628314151",
  appId: "1:721628314151:web:d8a2c962542576af5eec02",
  measurementId: "G-3DY1FJQ1ZC",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const addTask = async (title, description, state, uid) => {
  try {
    await addDoc(collection(db, "tasks"), {
      title,
      description,
      state,
      uid,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
    console.log("Task deleted successfully");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const editTask = async (taskId, newTitle, newDescription, newState) => {
  try {
    const updatedData = {};

    if (newTitle !== undefined) {
      updatedData.title = newTitle;
    }

    if (newDescription !== undefined) {
      updatedData.description = newDescription;
    }

    if (newState !== undefined) {
      updatedData.state = newState;
    }

    await updateDoc(doc(db, "tasks", taskId), updatedData);
    console.log("Task updated successfully");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const logout = () => {
  signOut(auth);
};
export {
  auth,
  db,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  addTask,
  deleteTask,
  editTask,
  sendPasswordReset,
  logout,
};
