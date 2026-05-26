// ── EXERCISE 3 ───────────────────────────────────────────────────────────────
// Create a function that returns a user by ID. If the user doesn't exist,
// handle the 404 and return an error message.

// 3a: The function receives the ID as a parameter
async function getUser(id) {
  try {
    //  3b: Making a GET request to the /objects/{id} endpoint with axios
    const response = await axios.get(`https://api.restful-api.dev/objects/${id}`);

    //  3c: If the user exists, return their information from response.data
    const user = response.data;

    console.log("User found:");
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Data: ${JSON.stringify(user.data, null, 2)}`);

    return user;

  } catch (error) {
    //  3d: Axios automatically throws an error when the status is 404,
    if (error.response && error.response.status === 404) {
      const message = `Error 404: No user found with ID "${id}".`;
      console.log(message);
      return message;
    }

    throw error;
  }
}

getUser("non-existent-id");
