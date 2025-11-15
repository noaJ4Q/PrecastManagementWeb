import express from 'express';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAGNFR9W5IjuE2KpUFjVtIt9yZKnUsa2uQ",
  authDomain: "precastmanagement-7edec.firebaseapp.com",
  projectId: "precastmanagement-7edec",
  storageBucket: "precastmanagement-7edec.firebasestorage.app",
  messagingSenderId: "960557252606",
  appId: "1:960557252606:web:c46df51fe6bae8491b8aaf",
  measurementId: "G-QEWZN80BZZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let router = express.Router();

router.get('/api/manage/rfidTag', async (req, res, next) => {
  try {
    const querySnapshot = await getDocs(collection(db, "rfid_tag"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    })
  } catch (err) {
    next(err);
  }
})

router.post('/api/manage/rfidTag', async (req, res, next) => {
  console.log(req.body);
  try {
    const docRef = await addDoc(collection(db, "rfid_tag"), {
      created_datetime: new Date(),
      tag_id: req.body.tagId,
      used: false
    });
    res.json({ id: docRef.id });
  } catch (err) {
    next(err);
  }
})

export default router;