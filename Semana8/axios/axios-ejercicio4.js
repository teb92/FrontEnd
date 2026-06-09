// ── EXERCISE 4 AXIOS ─────────────────────────────────────────────────────────
async function updateAddress(id, newData) {
  const out = document.getElementById("out4");

  if (!id && !newData) {
    id = document.getElementById("idUpdate")?.value.trim();
    const newAddress = document.getElementById("newAddress")?.value.trim();

    if (!id || !newAddress) {
      if (out) out.textContent = "Error: Please fill in both fields.";
      return null;
    }

    newData = { address: newAddress };
  }

  if (out) out.textContent = "Updating user data...";

  try {
    const getResponse = await axios.get(`https://api.restful-api.dev/objects/${id}`);
    const currentObject = getResponse.data;
    const updatedData = { ...currentObject.data, ...newData };

    const patchResponse = await axios.patch(`https://api.restful-api.dev/objects/${id}`, {
      data: updatedData,
    });

    const updated = patchResponse.data;
    if (out) out.textContent = JSON.stringify(updated, null, 2);
    console.log("Updated successfully:", updated);
    return updated;
  } catch (error) {
    let message = "";

    if (error.response?.status === 404) {
      message = `Error 404: No user found with ID "${id}". Cannot update.`;
    } else {
      message = error.response
        ? `Server error: ${error.response.status} ${error.response.statusText}`
        : `Network error: ${error.message}`;
    }

    if (out) out.textContent = message;
    console.log(message);
    return null;
  }
}