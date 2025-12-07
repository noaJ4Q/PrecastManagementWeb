const dataContainer = document.getElementById('app-data');

let currentEditingElement = null;

const addTagBtn = document.getElementById('addTagBtn');
const editElementModal = document.getElementById('editElementModal');

// References to edit modal
const editElementName = document.getElementById('editElementName');
const editElementRfidTag = document.getElementById('editElementRfidTag');
const editElementWidth = document.getElementById('editElementWidth');
const editElementHeight = document.getElementById('editElementHeight');
const editElementDeliveryDate = document.getElementById('editElementDeliveryDate');
const editElementInstallationDate = document.getElementById('editElementInstallationDate');
const editElementStatus = document.getElementById('editElementStatus');

// Reference to add tag modal
const tagIdInput = document.getElementById('tagIdInput');

// Edit element function
window.editElement = async function (dbId) {
  console.log('Editing element with dbId:', dbId);

  try {
    const response = await fetch(`/api/components/elements/${dbId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    currentEditingElement = await response.json();

    // Populate modal fields
    editElementName.textContent = currentEditingElement.name || '';
    editElementWidth.value = currentEditingElement.width || '';
    editElementHeight.value = currentEditingElement.height || '';
    editElementDeliveryDate.value = currentEditingElement.expected_delivery || '';
    editElementInstallationDate.value = currentEditingElement.expected_installation || '';
    // Set status select
    for (let i = 0; i < editElementStatus.options.length; i++) {
      if (editElementStatus.options[i].value === currentEditingElement.status) {
        editElementStatus.selectedIndex = i;
        break;
      }
    }

    // Load RFID tags available into the select
    const tagsResponse = await fetch('/api/components/rfidTags');
    if (!tagsResponse.ok) {
      throw new Error(`HTTP error! status: ${tagsResponse.status}`);
    }
    const tags = await tagsResponse.json();
    for (let i = 1; i < tags.length + 1; i++) {
      editElementRfidTag.options[i] = new Option(tags[i - 1].rfid_id, tags[i - 1].rfid_id);
    }
    // Set selected RFID tag
    for (let i = 0; i < editElementRfidTag.options.length; i++) {
      if (editElementRfidTag.options[i].value === currentEditingElement.rfid_tag) {
        editElementRfidTag.selectedIndex = i;
        break;
      }
    }

    showModal(editElementModal);

  } catch (err) {
    alert('Could not load element details. See the console for more details.');
    console.error(err);
  }
}

// Remove tag function
window.removeTag = async function (id) {
  try {
    const resp = await fetch(`/api/components/rfidTags/${id}`, {
      method: 'DELETE'
    });
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    console.log('Tag removed successfully');
    updateTagsTable();
  }
  catch (err) {
    alert('Could not remove RFID tag. See the console for more details.');
    console.error(err);
  }
}

function showModal(modal) {
  modal.classList.remove('hidden');
}

function hideModal(modal) {
  modal.classList.add('hidden');
}

function updateTagsTable() {
  window.location.reload();
}

function updateElementsTable() {
  window.location.reload();
}

// Event listeners to open modals
addTagBtn.addEventListener('click', () => {
  tagIdInput.value = '';
  showModal(addTagModal);
});

// Event listeners to confirm actions
document.getElementById('confirmTagBtn').addEventListener('click', async () => {
  const rfidId = tagIdInput.value.trim();
  if (!rfidId) {
    alert('Please enter a valid Tag ID.');
    return;
  }
  try {
    const resp = await fetch('/api/components/rfidTags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rfidId })
    });
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const result = await resp.json();
    console.log('Tag added with ID:', result.id);
    hideModal(addTagModal);
    updateTagsTable();

  } catch (err) {
    alert('Could not add RFID tag. See the console for more details.');
    console.error(err);
  }
})

document.getElementById('confirmEditElementBtn').addEventListener('click', async () => {
  const updatedElement = {
    ...currentEditingElement,
    width: editElementWidth.value,
    height: editElementHeight.value,
    expected_delivery: editElementDeliveryDate.value,
    expected_installation: editElementInstallationDate.value,
    status: editElementStatus.value,
    rfid_tag: editElementRfidTag.value
  }

  try {

    const resp = await fetch(`/api/components/elements/${currentEditingElement.dbId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedElement)
    });
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    console.log('Element updated successfully');

    // Updadte RFID tag association

    const operation = updatedElement.rfid_tag ? 'associate' : 'dissociate';
    const tagId = updatedElement.rfid_tag || currentEditingElement.rfid_tag;

    const respTag = await fetch('/api/components/rfidTags/associate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tagId, operation })
    });
    if (!respTag.ok) {
      throw new Error(await respTag.text());
    }
    console.log('RFID tag associated successfully');

    updateElementsTable();
    hideModal(editElementModal);
    currentEditingElement = null;

  } catch (err) {
    alert('Could not update element. See the console for more details.');
    console.error(err);
  }

})

// Event listeners to close modals
document.getElementById('cancelTagBtn').addEventListener('click', () => {
  hideModal(addTagModal);
});

document.getElementById('cancelEditElementBtn').addEventListener('click', () => {
  hideModal(editElementModal);
})