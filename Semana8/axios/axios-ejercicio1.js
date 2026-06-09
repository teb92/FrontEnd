// ── EXERCISE 1 ───────────────────────────────────────────────────────────────
async function listObjects() {
  const out = document.getElementById("out1");
  out.textContent = "Loading...";

  try {
    const response = await axios.get("https://api.restful-api.dev/objects");
    const objects = response.data;

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

    // Muestra el resultado en el HTML y en la consola
    out.textContent = results.length > 0 ? results.join("\n") : "No results with data found.";
    results.forEach((line) => console.log(line));

  } catch (error) {
    const status = error.response?.status;
    const message = status
      ? `Server error: ${status} ${error.response.statusText}`
      : `Network error: ${error.message}`;
    
    out.textContent = message;
    console.log(message);
  }
}