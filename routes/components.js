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

router.get('/api/components/rfidTag', async (req, res, next) => {
  try {
    const querySnapshot = await getDocs(collection(db, "rfid_tag"));
    const tags = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.post('/api/components/rfidTag', async (req, res, next) => {
  try {
    const docRef = await addDoc(collection(db, "rfid_tag"), {
      created_datetime: new Date(),
      rfid_id: req.body.rfidId,
      used: false
    });
    res.json({ id: docRef.id });
  } catch (err) {
    next(err);
  }
});

router.get('/api/components/element', async (req, res, next) => {
  try {
    const querySnapshot = await getDocs(collection(db, "precast_element"));
    const elements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(elements);
  } catch (err) {
    next(err);
  }
});

export default router;