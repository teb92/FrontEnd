// ── EXERCISE 2 AXIOS ─────────────────────────────────────────────────────────
async function createObject(name, data) {
  const out = document.getElementById("out2");

  if (!name && !data) {
    name = document.getElementById("objName")?.value.trim();
    const email = document.getElementById("objEmail")?.value.trim();
    const password = document.getElementById("objPassword")?.value.trim();
    const address = document.getElementById("objAddress")?.value.trim();

    if (!name || !email || !password || !address) {
      if (out) out.textContent = "Error: Please fill in all fields.";
      return null;
    }

    data = { email, password, address };
  }

  if (out) out.textContent = "Creating user...";

  try {
    const response = await axios.post("https://api.restful-api.dev/objects", { name, data });
    const created = response.data;

    if (out) out.textContent = JSON.stringify(created, null, 2);
    console.log("User created successfully:", created);
    return created;
  } catch (error) {
    const message = error.response
      ? `Server error: ${error.response.status} ${error.response.statusText}`
      : `Network error: ${error.message}`;

    if (out) out.textContent = message;
    console.log(message);
    return null;
  }
}