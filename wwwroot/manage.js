async function loadRfidTags() {
  console.log('Loading RFID tags...');
  try {
    const resp = await fetch('/api/manage/rfidTag');
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const tags = await resp.json();
    console.log('RFID Tags:', tags);
  } catch (err) {
    alert('Could not load RFID tags. See the console for more details.');
    console.error(err);
  }
}

loadRfidTags();