//  Verificar si hay una sesión activa de administrador
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser || currentUser.rol !== 'admin') {
  alert('Acceso denegado. Debes iniciar sesión como Administrador.');
  window.location.href = 'login.html';
}