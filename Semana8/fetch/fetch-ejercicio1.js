// ── EXERCISE 1 ───────────────────────────────────────────────────────────────
async function listObjects() {
  const out = document.getElementById("out1");
  out.textContent = "Loading...";

  try {
    const response = await fetch("https://api.restful-api.dev/objects");

    if (!response.ok) {
      const serverError = `Server error: ${response.status} ${response.statusText}`;
      out.textContent = serverError;
      console.log(serverError);
      return;
    }

    const objects = await response.json();

    const objectsWithData = objects.filter((obj) => {
      if (obj.data === null || obj.data === undefined) return false;
      if (typeof obj.data === "object" && Object.keys(obj.data).length === 0) return false;
      return true;
    });

    const results = objectsWithData.map((obj) => {
      const details = Object.entries(obj.data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      return `${obj.name} (${details})`;
    });

    // Muestra el resultado en la interfaz DOM
    out.textContent = results.length > 0 ? results.join("\n") : "No results with data found.";
    results.forEach((line) => console.log(line));

  } catch (error) {
    const netError = `Network error: ${error.message}`;
    out.textContent = netError;
    console.log(netError);
  }
}