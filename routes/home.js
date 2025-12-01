import express from 'express';

let router = express.Router();

router.get('/', async (req, res) => {

  const tags = await loadRfidTags();
  const elements = await loadPrecastElements();

  res.status(200).render(
    'userHome.ejs',
    { tags, elements }
  )
})

async function loadRfidTags() {
  try {
    const resp = await fetch('http://localhost:8080/api/components/rfidTags');
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    return await resp.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadPrecastElements() {
  try {
    const resp = await fetch('http://localhost:8080/api/components/elements');
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    return await resp.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default router;