// ── EXERCISE 4 ───────────────────────────────────────────────────────────────
// Create a function that updates a user's address, taking their ID and the
// new address as parameters.

//  4a: The function receives the 2 required parameters: ID and new address
async function updateAddress(id, newAddress) {

  //  4b: First a GET is made to retrieve the user's current data.
  //    This is necessary because the API replaces the entire `data` object on
  //    PATCH, deleting any fields that are not sent.
  const getResponse = await fetch(`https://api.restful-api.dev/objects/${id}`);
  const currentUser = await getResponse.json();

  // 4c: The current data is merged with the new address using spread (...).
  //    This preserves email, password and any other existing fields.
  const updatedData = {
    ...currentUser.data,
    address: newAddress,
  };

  // 4d: Using PATCH to the endpoint with the user's ID
  // 4e: The body sends the full data object (not just the address) to avoid losing fields
  const response = await fetch(`https://api.restful-api.dev/objects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: updatedData,
    }),
  });

  // 4f: Parsing the response with the already updated object
  const updatedUser = await response.json();

  console.log("Address updated successfully:");
  console.log(`  ID: ${updatedUser.id}`);
  console.log(`  Name: ${updatedUser.name}`);
  console.log(`  Data: ${JSON.stringify(updatedUser.data, null, 2)}`);

  return updatedUser;
}

updateAddress("ID_HERE", "Cartago, Costa Rica");
