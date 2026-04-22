/*
1. Cree una función que reciba tres parámetros: un número y dos funciones de callback. 
1. Si el número es par, se debe ejecutar el primer callback. 
1. Este debe mostrar “The number is even!”. 
2. Si el número es impar, se debe ejecutar el segundo. 
1. Este debe mostrar “The number is odd!”.
*/


function checkNumber(number, evenCallback, oddCallback) {
    if (number % 2 === 0) {
        evenCallback();
    } else {
        oddCallback();
    }
}

function showEven() {
    console.log("The number is even!");
}

function showOdd() {
    console.log("The number is odd!");
}


checkNumber(4, showEven, showOdd); // even
checkNumber(7, showEven, showOdd); // odd


/*
2. Cree dos archivos de texto con el siguiente contenido. 
Lea ambos archivos y compare cuales palabras se repiten en ambos. 
Muestre el mensaje escondido al final del programa.
*/

const fs = require('fs');

// Read files
const file1 = fs.readFileSync('file1.txt', 'utf-8').split('\n');
const file2 = fs.readFileSync('file2.txt', 'utf-8').split('\n');

// Clean spaces
const words1 = file1.map(word => word.trim());
const words2 = file2.map(word => word.trim());

// Find common words
const commonWords = words1.filter(word => words2.includes(word));

// Show result
console.log("Hidden message:");
console.log(commonWords.join(' '));



