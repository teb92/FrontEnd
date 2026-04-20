// Exercise 1
let counter = 1;

function addElement() {
  const list = document.getElementById("list");
  const item = document.createElement("li");
  item.textContent = "Element " + counter;
  list.appendChild(item);
  counter++;
}

function clearList() {
  const list = document.getElementById("list");
  list.innerHTML = "";
  counter = 1;
}

// Exercise 2
function showText() {
  const input = document.getElementById("myInput");
  const result = document.getElementById("result");
  result.textContent = input.value;
  input.value = "";
}

// Exercise 3
function toggleEmployment(radio) {
  const employmentField = document.getElementById("employmentField");
  if (radio.value === "yes") {
    employmentField.style.display = "block";
  } else {
    employmentField.style.display = "none";
  }
}

function submitForm() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const isEmployee = document.querySelector('input[name="employee"]:checked').value;
  const workplace = document.getElementById("workplace").value.trim();

  // Check if employee field is visible and empty
  if (isEmployee === "yes" && workplace === "") {
    alert("Please fill in all fields, including your workplace.");
    return;
  }

  // Check required fields
  if (!email || !password || !firstName || !lastName) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  // Build popup message
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  let message = `✅ Data submitted successfully!\n`;
  message += `📅 Date: ${today}\n\n`;
  message += `👤 Name: ${firstName} ${lastName}\n`;
  message += `📧 Email: ${email}\n`;
  message += `🔒 Password: ${"*".repeat(password.length)}\n`;
  message += `💼 Employee: ${isEmployee === "yes" ? "Yes" : "No"}`;
  if (isEmployee === "yes") {
    message += `\n🏢 Workplace: ${workplace}`;
  }

  alert(message);
}