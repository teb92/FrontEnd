// ── EXERCISE 2 FETCH ─────────────────────────────────────────────────────────
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
    const response = await fetch("https://api.restful-api.dev/objects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, data }),
    });

    if (!response.ok) {
      const serverError = `Server error: ${response.status} ${response.statusText}`;
      if (out) out.textContent = serverError;
      console.log(serverError);
      return null;
    }

    const created = await response.json();
    if (out) out.textContent = JSON.stringify(created, null, 2);
    console.log("User created successfully:", created);
    return created;
  } catch (error) {
    const netError = `Network error: ${error.message}`;
    if (out) out.textContent = netError;
    console.log(netError);
    return null;
  }
}