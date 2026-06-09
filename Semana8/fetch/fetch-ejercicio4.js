// ── EXERCISE 4 FETCH ─────────────────────────────────────────────────────────
let currentObjectToUpdate = null;

async function loadFieldsToUpdate() {
  const out = document.getElementById("out4");
  const id = document.getElementById("idUpdate")?.value.trim();
  const fieldSelect = document.getElementById("fieldName");
  const fieldValue = document.getElementById("fieldValue");
  const updateButton = document.getElementById("updateButton");

  fieldSelect.innerHTML = '<option value="">Select a field to update</option>';
  fieldSelect.disabled = true;
  fieldValue.value = "";
  fieldValue.disabled = true;
  updateButton.disabled = true;
  currentObjectToUpdate = null;

  if (!id) {
    out.textContent = "Error: Please enter the user ID you want to update.";
    return null;
  }

  out.textContent = "Loading available fields...";

  try {
    const response = await fetch(`https://api.restful-api.dev/objects/${id}`);

    if (response.status === 404) {
      const notFoundMessage = `Error 404: No user found with ID "${id}". Cannot update.`;
      out.textContent = notFoundMessage;
      console.log(notFoundMessage);
      return null;
    }

    if (!response.ok) {
      const serverError = `Server error on GET: ${response.status} ${response.statusText}`;
      out.textContent = serverError;
      console.log(serverError);
      return null;
    }

    currentObjectToUpdate = await response.json();
    const data = currentObjectToUpdate.data || {};
    const fields = Object.keys(data);

    if (fields.length === 0) {
      out.textContent = "This user has no data fields available to update.";
      return null;
    }

    fields.forEach((field) => {
      const option = document.createElement("option");
      option.value = field;
      option.textContent = field;
      fieldSelect.appendChild(option);
    });

    fieldSelect.disabled = false;
    fieldValue.disabled = false;
    updateButton.disabled = false;
    out.textContent = "Fields loaded. Please select one field and enter the new value.";
    return currentObjectToUpdate;
  } catch (error) {
    const netError = `Network error: ${error.message}`;
    out.textContent = netError;
    console.log(netError);
    return null;
  }
}

async function updateAddress(id, newData) {
  const out = document.getElementById("out4");

  if (!id && !newData) {
    id = document.getElementById("idUpdate")?.value.trim();
    const fieldName = document.getElementById("fieldName")?.value;
    const fieldValue = document.getElementById("fieldValue")?.value.trim();

    if (!id || !fieldName || !fieldValue) {
      out.textContent = "Error: Please enter an ID, select a field, and enter the new value.";
      return null;
    }

    newData = {
      [fieldName]: fieldValue,
    };
  }

  out.textContent = "Updating user data...";

  try {
    let currentObject = currentObjectToUpdate;

    if (!currentObject || currentObject.id !== id) {
      const getResponse = await fetch(`https://api.restful-api.dev/objects/${id}`);

      if (getResponse.status === 404) {
        const notFoundMessage = `Error 404: No user found with ID "${id}". Cannot update.`;
        out.textContent = notFoundMessage;
        console.log(notFoundMessage);
        return null;
      }

      if (!getResponse.ok) {
        const serverGetError = `Server error on GET: ${getResponse.status} ${getResponse.statusText}`;
        out.textContent = serverGetError;
        console.log(serverGetError);
        return null;
      }

      currentObject = await getResponse.json();
    }

    const updatedData = { ...currentObject.data, ...newData };

    const patchResponse = await fetch(`https://api.restful-api.dev/objects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: updatedData }),
    });

    if (!patchResponse.ok) {
      const serverPatchError = `Server error on PATCH: ${patchResponse.status} ${patchResponse.statusText}`;
      out.textContent = serverPatchError;
      console.log(serverPatchError);
      return null;
    }

    const updated = await patchResponse.json();
    currentObjectToUpdate = updated;
    out.textContent = JSON.stringify(updated, null, 2);
    console.log("Updated successfully:", updated);
    return updated;
  } catch (error) {
    const netError = `Network error: ${error.message}`;
    out.textContent = netError;
    console.log(netError);
    return null;
  }
}