// ============================================================
// Utilice el API https://pokeapi.co/api/v2/pokemon/:ID para solicitar 3 distintos pokemónes. 
// Utilice la función Promise.all() para mostrar en pantalla el nombre de los tres pokemónes 
// al mismo tiempo, hasta que todas las promesas se resuelvan.
// ============================================================

Promise.all([
  fetch("https://pokeapi.co/api/v2/pokemon/1").then(res => res.json()),
  fetch("https://pokeapi.co/api/v2/pokemon/2").then(res => res.json()),
  fetch("https://pokeapi.co/api/v2/pokemon/3").then(res => res.json()),
])
  .then(([pokemon1, pokemon2, pokemon3]) => {
    console.log(pokemon1.name);
    console.log(pokemon2.name);
    console.log(pokemon3.name);
  })
  .catch(error => console.error("Error:", error.message));


// ============================================================
// Realice el mismo ejercicio anterior utilizando la función Promse.any() 
// para mostrar el nombre del primer pokemón que esté contenido en la primera promesa que se resuelva.
// ============================================================

Promise.any([
  fetch("https://pokeapi.co/api/v2/pokemon/4").then(res => res.json()),
  fetch("https://pokeapi.co/api/v2/pokemon/5").then(res => res.json()),
  fetch("https://pokeapi.co/api/v2/pokemon/6").then(res => res.json()),
])
  .then(pokemon => {
    console.log("First resolved:", pokemon.name);
  })
  .catch(error => console.error("Error:", error.message));


// ============================================================
// Cree cuatro promesas, donde cada una resuelve a una de las palabras de la lista 
// ["very", "dogs", "cute", "are"] respectivamente, en el mismo orden. Utilice la 
// combinación de la función setTimeout y Promse.all() para obtener la salida "Dogs are very cute" , 
// sin modificar el orden de la lista manualmente o mediante un sort.
// ============================================================

const words = ["very", "dogs", "cute", "are"];

const promises = [
  new Promise(resolve => setTimeout(() => resolve(words[0]), 3000)), // "very"  — 3s
  new Promise(resolve => setTimeout(() => resolve(words[1]), 1000)), // "dogs"  — 1s
  new Promise(resolve => setTimeout(() => resolve(words[2]), 4000)), // "cute"  — 4s
  new Promise(resolve => setTimeout(() => resolve(words[3]), 2000)), // "are"   — 2s
];

Promise.all(promises).then(results => {
  // results = ["very", "dogs", "cute", "are"] — always in array order, not resolve order
  const [very, dogs, cute, are] = results;
  console.log(`${dogs} ${are} ${very} ${cute}`); // "dogs are very cute"
});


// ============================================================
// Repita los ejercicios 1 y 2 de la sección de Async/Await resolviéndolos con las 
// funciones .then(), .catch() y .finally() de ser requerido.
// ============================================================


fetch("https://reqres.in/api/users/2", {
  headers: { "x-api-key": "pub_bd73db21584d88186ed2e01f64113122d3b65d211f6bf033f6b3d44f3002a065" }
})
  .then(res => res.json())
  .then(data => console.log(data.data))
  .catch(error => console.error("Error:", error.message))
  .finally(() => console.log("Exercise 4a done"));



fetch("https://reqres.in/api/users/23", {
  headers: { "x-api-key": "pub_bd73db21584d88186ed2e01f64113122d3b65d211f6bf033f6b3d44f3002a065" }
})
  .then(res => {
    if (!res.ok) throw new Error(`User not found (status: ${res.status})`);
    return res.json();
  })
  .then(data => console.log(data.data))
  .catch(error => console.error("Error:", error.message))
  .finally(() => console.log("Exercise 4b done"));