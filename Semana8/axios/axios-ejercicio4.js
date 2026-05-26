// ── EXERCISE 4 ───────────────────────────────────────────────────────────────
// Create a function that updates a user's address, taking their ID and the
// new address as parameters.

// 4a: The function receives the 2 required parameters: ID and new address
async function updateAddress(id, newAddress) {

  // 4b: First a GET is made to retrieve the user's current data.
  //    This is necessary because the API replaces the entire `data` object on
  //    PATCH, deleting any fields that are not sent.
  const getResponse = await axios.get(`https://api.restful-api.dev/objects/${id}`);
  const currentUser = getResponse.data;

  // 4c: The current data is merged with the new address using spread (...).
  //    This preserves email, password and any other existing fields.
  const updatedData = {
    ...currentUser.data,
    address: newAddress,
  };

  // 4d: Using axios.patch() to the endpoint with the user's ID
  //  4e: The body sends the full data object (not just the address) to avoid losing fields
  const response = await axios.patch(
    `https://api.restful-api.dev/objects/${id}`,
    {
      data: updatedData,
    }
  );

  // 4f: The response with the updated object comes in response.data
  const updatedUser = response.data;

  console.log("Address updated successfully:");
  console.log(`  ID: ${updatedUser.id}`);
  console.log(`  Name: ${updatedUser.name}`);
  console.log(`  Data: ${JSON.stringify(updatedUser.data, null, 2)}`);

  return updatedUser;
}

updateAddress("ID_HERE", "Cartago, Costa Rica");
