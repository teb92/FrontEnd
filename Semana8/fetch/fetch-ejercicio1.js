// ── EXERCISE 1 ───────────────────────────────────────────────────────────────
// Create a function that lists all elements returned from a GET to the endpoint
// https://api.restful-api.dev/objects. Filter out results that don't return
// `data`, and format the ones that do in a readable way.

//  1a: Function that makes a GET request to the /objects endpoint
async function listObjects() {
  const response = await fetch("https://api.restful-api.dev/objects");
  const objects = await response.json();

  // 1b: Filter out all results that do NOT return `data`
  //    Only objects where data exists and is not null pass the filter
  const objectsWithData = objects.filter(
    (obj) => obj.data !== null && obj.data !== undefined
  );

  // 1c: Format the ones that DO have data in a readable way
  //    Converts each object into a line like:
  //    Apple iPhone 12 Pro Max (color: Cloudy White, capacity GB: 512)
  const results = objectsWithData.map((obj) => {
    const { name, data } = obj;

    const details = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    return `${name} (${details})`;
  });

  // 1d: Display the formatted results on screen
  results.forEach((line) => console.log(line));

  return results;
}

listObjects();
