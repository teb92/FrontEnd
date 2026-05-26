// ── EXERCISE 2 ───────────────────────────────────────────────────────────────
// Create a function that takes name, email, password and address as parameters,
// and creates a user using the POST endpoint from the documentation.

//  2a: The function receives the 4 required parameters
async function createUser(name, email, password, address) {

  // 2b: Using the POST method to the /objects endpoint
  //  2c: Sending the Content-Type header to indicate the body is JSON
  //  2d: Building the body with the 4 received parameters
  const response = await fetch("https://api.restful-api.dev/objects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      data: {
        email,
        password,
        address,
      },
    }),
  });

  // 2e: Parsing the server response which includes the generated ID
  const newUser = await response.json();

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
