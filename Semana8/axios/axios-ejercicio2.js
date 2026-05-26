// ── EXERCISE 2 ───────────────────────────────────────────────────────────────
// Create a function that takes name, email, password and address as parameters,
// and creates a user using the POST endpoint.

// 2a: The function receives the 4 required parameters
async function createUser(name, email, password, address) {

  // 2b: Using axios.post() to the /objects endpoint
  //  2c: Axios adds the Content-Type: application/json header automatically
  //  2d: The body is passed as a plain object (no JSON.stringify needed)
  const response = await axios.post("https://api.restful-api.dev/objects", {
    name: name,
    data: { email, password, address },
  });

  //  2e: The server response comes in response.data
  const newUser = response.data;

  console.log("User created successfully:");
  console.log(`  ID: ${newUser.id}`);
  console.log(`  Name: ${newUser.name}`);
  console.log(`  Email: ${newUser.data.email}`);
  console.log(`  Address: ${newUser.data.address}`);
  console.log("⚠️  Save the ID — it is the only way to retrieve this user.");

  return newUser;
}

createUser(
  "John Doe",
  "john@example.com",
  "pass1234",
  "San Jose, Costa Rica"
);
