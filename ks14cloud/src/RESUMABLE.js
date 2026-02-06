import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const uploadFile = (file) => {
  if (file.size > 5 * 1024 * 1024 * 1024) {
    alert("File exceeds 5GB limit");
    return;
  }

  const storageRef = ref(
    storage,
    `uploads/${user.uid}/${Date.now()}_${file.name}`
  );

  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress =
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
    },
    (error) => {
      console.error(error);
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      await addDoc(
        collection(db, "savedMessages", user.uid, "messages"),
        {
          type: "file",
          name: file.name,
          mime: file.type,
          size: file.size,
          url: downloadURL,
          createdAt: serverTimestamp(),
        }
      );
    }
  );
};
