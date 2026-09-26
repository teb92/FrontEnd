document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();
  const errorMsg = document.getElementById('error-msg');

  // Limpiar mensajes anteriores
  errorMsg.style.display = 'none';

  // 1. Validar coincidencia de contraseñas
  if (password !== confirmPassword) {
    errorMsg.textContent = 'Las contraseñas no coinciden.';
    errorMsg.style.display = 'block';
    return;
  }

  // 2. Obtener la lista actual de usuarios en localStorage
  const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];

  // 3. Validar que el correo no esté registrado (ni sea el de admin)
  const userExists = registeredUsers.some(user => user.email === email);
  if (userExists || email === 'admin@pawstore.com') {
    errorMsg.textContent = 'Este correo electrónico ya está registrado.';
    errorMsg.style.display = 'block';
    return;
  }

  // 4. Crear nuevo usuario cliente
  const newUser = {
    nombre,
    email,
    password,
    rol: 'cliente'
  };

  //  Guardar en localStorage
  registeredUsers.push(newUser);
  localStorage.setItem('users', JSON.stringify(registeredUsers));

  // Redirigir al login
  alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
  window.location.href = 'login.html';
});