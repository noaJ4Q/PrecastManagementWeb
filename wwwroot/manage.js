const addTagBtn = document.getElementById('addTagBtn');
const addElementBtn = document.getElementById('addElementBtn');

const tagIdInput = document.getElementById('tagIdInput');
const elementNameInput = document.getElementById('elementNameInput');
const elementTagSelect = document.getElementById('elementTagSelect');

const confirmTagBtn = document.getElementById('confirmTagBtn');
const confirmElementBtn = document.getElementById('confirmElementBtn');

function showModal(modal) {
  modal.classList.remove('hidden');
}

function hideModal(modal) {
  modal.classList.add('hidden');
}

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

// Event listeners to open modals
addTagBtn.addEventListener('click', () => {
  tagIdInput.value = '';
  showModal(addTagModal);
});

addElementBtn.addEventListener('click', () => {
  elementNameInput.value = '';
  elementTagSelect.value = '';
  showModal(addElementModal);
});

// Event listeners to confirm actions
confirmTagBtn.addEventListener('click', async () => {
  const tagId = tagIdInput.value.trim();
  if (!tagId) {
    alert('Please enter a valid Tag ID.');
    return;
  }
  try {
    const resp = await fetch('/api/manage/rfidTag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tagId })
    });
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const result = await resp.json();
    console.log('Tag added with ID:', result.id);
    hideModal(addTagModal);
    loadRfidTags();
  } catch (err) {
    alert('Could not add RFID tag. See the console for more details.');
    console.error(err);
  }
})

// Event listeners to close modals
document.getElementById('cancelTagBtn').addEventListener('click', () => {
  hideModal(addTagModal);
});

document.getElementById('cancelElementBtn').addEventListener('click', () => {
  hideModal(addElementModal);
});