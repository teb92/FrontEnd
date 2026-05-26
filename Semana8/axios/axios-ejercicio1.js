// ── EXERCISE 1 ───────────────────────────────────────────────────────────────
// Create a function that lists all elements returned from a GET to the endpoint
// https://api.restful-api.dev/objects. Filter out results that don't return
// `data`, and format the ones that do in a readable way.

// 1a: Function that makes a GET request to the /objects endpoint with axios
async function listObjects() {
  const response = await axios.get("https://api.restful-api.dev/objects");

  const objects = response.data;

  //  1b: Filter out all results that do NOT have data
  const objectsWithData = objects.filter(
    (obj) => obj.data !== null && obj.data !== undefined
  );

  // 1c: Format the ones that DO have data in a readable way
  const results = objectsWithData.map((obj) => {
    const details = Object.entries(obj.data)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return `${obj.name} (${details})`;
  });

  //  1d: Display on screen
  results.forEach((line) => console.log(line));

  return results;
}

listObjects();
