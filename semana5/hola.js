// Ejercicios

//1. Realiza un programa que recorra una lista e imprima todos sus elementos.
const fruits = ["apple", "banana", "cherry", "mango"];

for (const fruit of fruits) {
  console.log(fruit);
}
//2. Realiza un programa que recorra una lista de números y almacene todos los pares en otra lista

    //1. Para este ejercicio intenta hacer una solución con un `for` y otra utilizando la función `filter`

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
const evens = numbers.filter(num => num % 2 === 0);

console.log(evens); // [2, 4, 6, 8]


//3. Toma una lista de temperaturas en grados celsius y conviertala a farenheit utilizando la función `map`

const celsius = [0, 20, 37, 100];

const fahrenheit = celsius.map(temp => (temp * 9/5) + 32);

console.log(fahrenheit); // [32, 68, 98.6, 212]


//4. Toma un string y conviertelo en una lista de palabras, separandolas por espacios en blanco. No puedes usar la función `split`.

const example = "This is a string!";
const result = [];
let currentWord = "";

for (const char of example) {
  if (char === " ") {
    if (currentWord !== "") {
      result.push(currentWord);
      currentWord = "";
    }
  } else {
    currentWord += char;
  }
}

if (currentWord !== "") {
  result.push(currentWord);
}

console.log(result); 


//1. Realiza un programa que reciba el siguiente objeto, e imprima otro objeto con los siguientes datos:

const student = {
  name: "John Doe",
  grades: [
    { name: "math",    grade: 80 },
    { name: "science", grade: 100 },
    { name: "history", grade: 60 },
    { name: "PE",      grade: 90 },
    { name: "music",   grade: 98 }
  ]
};

// Promedio
const gradeAvg = student.grades.reduce((sum, s) => sum + s.grade, 0) / student.grades.length;

// Nota más alta
const highest = student.grades.reduce((best, s) => s.grade > best.grade ? s : best);

// Nota más baja
const lowest = student.grades.reduce((worst, s) => s.grade < worst.grade ? s : worst);

const result2 = {
  name: student.name,
  gradeAvg: Math.round(gradeAvg * 10) / 10,  // redondea a 1 decimal
  highestGrade: highest.name,
  lowestGrade: lowest.name
};

console.log(result2);

