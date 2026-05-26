// ── EXERCISE 3 ───────────────────────────────────────────────────────────────
// Create a function that returns a user from the API, taking their ID as a
// parameter. If the user doesn't exist, it must properly handle the 404 code
// and return an error message.

//  3a: The function receives the ID as a parameter
async function getUser(id) {

  // 3b: Making a GET request to the /objects/{id} endpoint using the received ID
  const response = await fetch(`https://api.restful-api.dev/objects/${id}`);

  // 3c: Properly handling the 404 status code
  //    The status is checked BEFORE parsing the JSON to avoid errors
  //    If the user doesn't exist, a descriptive error message is returned
  if (response.status === 404) {
    const message = `Error 404: No user found with ID "${id}".`;
    console.log(message);
    return message; 
  }

  // 3d: If the user exists, parse and return their information
  const user = await response.json();

  console.log("User found:");
  console.log(`  ID: ${user.id}`);
  console.log(`  Name: ${user.name}`);
  console.log(`  Data: ${JSON.stringify(user.data, null, 2)}`);

  return user;
}

getUser("non-existent-id");
