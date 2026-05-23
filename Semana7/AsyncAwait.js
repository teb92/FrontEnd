// ============================================================
// Realice un programa que utilice la función fetch para solicitar un 
// usuario del API anterior. El URL debe ser [https://reqres.in/api/users/]
// (https://reqres.in/api/users/2)2. Al finalizar la solicitud, imprima los datos 
// del usuario en pantalla.
// ============================================================

async function getUser() {
  const response = await fetch("https://reqres.in/api/users/2", {
    headers: { "x-api-key": "pub_bd73db21584d88186ed2e01f64113122d3b65d211f6bf033f6b3d44f3002a065" }
  });
  const data = await response.json();
  console.log(data.data);
}

getUser();


// ============================================================
//Realice el mismo ejercicio anterior, pero con el URL https://reqres.in/api/users/23 para
//  generar un error. Realice el manejo de error adecuado e imprima un mensaje de error 
// indicando que el usuario no se encontró.
// ============================================================

async function getUserNotFound() {
  try {
    const response = await fetch("https://reqres.in/api/users/23", {
      headers: { "x-api-key": "pub_bd73db21584d88186ed2e01f64113122d3b65d211f6bf033f6b3d44f3002a065" }
    });

    if (!response.ok) {
      throw new Error(`User not found (status: ${response.status})`);
    }

    const data = await response.json();
    console.log(data.data);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

getUserNotFound();


// ============================================================
//Construya un pequeño contenedor con HTML donde haya espacios para un input y un botón. 
// Al presionar el botón tome el valor ingresado al input y realice la solicitud al endpoint 
// utilizado en los dos ejercicios anteriores. Si la solicitud fue exitosa, muestre nombre, 
// apellido y correo del usuario. Si la solicitud falló, muestre un mensaje de error en pantalla.
// ============================================================

async function fetchUser(id) {
  const res = await fetch(`https://reqres.in/api/users/${id}`, {
    headers: { "x-api-key": "pub_bd73db21584d88186ed2e01f64113122d3b65d211f6bf033f6b3d44f3002a065" }
  });
  if (!res.ok) throw new Error(`User not found (status: ${res.status})`);
  const json = await res.json();
  return json.data;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchBtn").addEventListener("click", async () => {
    const id = document.getElementById("userId").value;
    const resultDiv = document.getElementById("result");

    try {
      const user = await fetchUser(id);
      resultDiv.innerHTML = `
        <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
      `;
    } catch (error) {
      resultDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
  });
});