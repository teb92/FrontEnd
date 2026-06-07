// ── EXERCISE 3 ───────────────────────────────────────────────────────────────
async function getObject() {
  const out = document.getElementById("out3");
  const id = document.getElementById("idSearch").value.trim();

  if (!id) {
    out.textContent = "Error: Please enter an ID.";
    return;
  }

  out.textContent = "Searching...";

  try {
    const response = await axios.get(`https://api.restful-api.dev/objects/${id}`);
    const object = response.data;

    out.textContent = JSON.stringify(object, null, 2);
    console.log("Object found:", object);
    return object;

  } catch (error) {
    let message = "";
    
    if (error.response?.status === 404) {
      message = `Error 404: No object found with ID "${id}".`;
    } else {
      message = error.response
        ? `Server error: ${error.response.status} ${error.response.statusText}`
        : `Network error: ${error.message}`;
    }

    out.textContent = message;
    console.log(message);
  }
}