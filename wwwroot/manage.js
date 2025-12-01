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

const confirmTagBtn = document.getElementById('confirmTagBtn');

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
    editElementWidth.textContent = currentEditingElement.width || '';
    editElementHeight.textContent = currentEditingElement.height || '';
    editElementDeliveryDate.textContent = currentEditingElement.delivery_date || '';
    editElementInstallationDate.textContent = currentEditingElement.expected_installation || '';
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

    showModal(editElementModal);

  } catch (err) {
    alert('Could not load element details. See the console for more details.');
    console.error(err);
  }
}

function showModal(modal) {
  modal.classList.remove('hidden');
}

function hideModal(modal) {
  modal.classList.add('hidden');
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
    loadRfidTags();
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

    // TODO: Update the element in the table
    // TODO: Updadte RFID tag association
    // TODO: Update RFID tags in the table

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