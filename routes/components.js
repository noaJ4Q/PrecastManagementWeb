import express from 'express';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, addDoc, doc, writeBatch, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
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

router.get('/api/components/rfidTags', async (req, res, next) => {
  try {
    const querySnapshot = await getDocs(collection(db, "rfid_tag"));
    const tags = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.post('/api/components/rfidTags', async (req, res, next) => {
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

router.get('/api/components/elements', async (req, res, next) => {
  try {
    const modelName = 'racbasicsampleproject.rvt';
    const projectsRef = doc(db, 'projects', modelName);
    const elementsCollRef = collection(projectsRef, 'elements');
    const querySnapshot = await getDocs(elementsCollRef);
    const elements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(elements);
  } catch (err) {
    next(err);
  }
});

router.get('/api/components/elements/:dbId', async (req, res, next) => {
  try {
    const dbId = req.params.dbId;
    const modelName = 'racbasicsampleproject.rvt';
    const elementRef = doc(db, 'projects/' + modelName + '/elements', 'element_' + dbId);
    const elementSnap = await getDoc(elementRef);

    if (elementSnap.exists()) {
      res.json({ id: elementSnap.id, ...elementSnap.data() });
    } else {
      res.status(404).json({ error: 'Element not found' });
    }
  } catch (err) {
    next(err);
  }
})

router.post('/api/components/elements', async (req, res, next) => {
  try {
    const elements = req.body.elements;
    const modelName = req.body.modelName;
    const batch = writeBatch(db);

    elements.forEach(element => {
      const elementRef = doc(db, "projects/" + modelName + '/elements', 'element_' + element.dbId);
      batch.set(elementRef, element);
    });

    await batch.commit();
    res.json({ message: 'Elements added successfully.' });

  } catch (err) {
    next(err);
  }
})

router.patch('/api/components/elements/:dbId', async (req, res, next) => {
  try {
    const dbId = req.params.dbId;
    const updatedData = req.body;

    const modelName = 'racbasicsampleproject.rvt';
    const elementRef = doc(db, 'projects/' + modelName + '/elements', 'element_' + dbId);

    await updateDoc(elementRef, updatedData);
    res.json({ message: 'Element updated successfully.' });

  } catch (err) {
    next(err);
  }
})

export default router;