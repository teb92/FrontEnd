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
    const response = await fetch(`https://api.restful-api.dev/objects/${id}`);

    if (response.status === 404) {
      const notFoundMessage = `Error 404: No object found with ID "${id}".`;
      out.textContent = notFoundMessage;
      console.log(notFoundMessage);
      return;
    }

    if (!response.ok) {
      const serverError = `Server error: ${response.status} ${response.statusText}`;
      out.textContent = serverError;
      console.log(serverError);
      return;
    }

    const object = await response.json();

    out.textContent = JSON.stringify(object, null, 2);
    console.log("Object found:", object);
    return object;

  } catch (error) {
    const netError = `Network error: ${error.message}`;
    out.textContent = netError;
    console.log(netError);
  }
}