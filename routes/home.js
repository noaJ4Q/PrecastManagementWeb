import express from 'express';

let router = express.Router();

router.get('/', async (req, res) => {

  const tags = await loadRfidTags();
  const elements = await loadProcastElements();

  res.status(200).render(
    'userHome.ejs',
    { tags, elements }
  )
})

async function loadRfidTags() {
  console.log('Loading RFID tags...');
  try {
    console.log('Fetching from API...');
    const resp = await fetch('http://localhost:8080/api/components/rfidTag');
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    console.log('API response received');
    return await resp.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadProcastElements() {
  console.log('Loading Precast Elements...');
  try {
    console.log('Fetching from API...');
    const resp = await fetch('http://localhost:8080/api/components/element');
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    console.log('API response received');
    return await resp.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default router;