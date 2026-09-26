document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault(); //  Detiene la recarga automática de la página

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('error-msg');

  // Ocultamos cualquier mensaje de error previo
  if (errorMsg) {
    errorMsg.style.display = 'none';
  }

  //  Paso 1: Verificación del Administrador
  if (email === 'admin@pawstore.com' && password === 'admin123') {
    const adminUser = { nombre: 'Administrador', email, rol: 'admin' };
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    
    // Redirige directamente al panel de administración
    window.location.href = 'admin.html';
    return;
  }

  //  Paso 2: Verificación de Clientes Registrados
  const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
  
  //  Diagnóstico en consola para verificar los datos guardados
  console.log('Usuarios en localStorage:', registeredUsers);
  console.log('Intentando ingresar con:', { email, password });

  const clientFound = registeredUsers.find(
    user => user.email === email && user.password === password
  );

  if (clientFound) {
    const clientUser = { 
      nombre: clientFound.nombre || 'Cliente', 
      email: clientFound.email, 
      rol: 'cliente' 
    };
    localStorage.setItem('currentUser', JSON.stringify(clientUser));
    
    //  Redirige al inicio para clientes
    window.location.href = 'index.html';
  } else {
    //  Paso 3: Mostrar mensaje de error si los datos no coinciden
    if (errorMsg) {
      errorMsg.style.display = 'block';
    }
  }
});
