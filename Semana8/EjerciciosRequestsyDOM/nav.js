// nav.js — shared navigation bar with session logic

function renderNav() {
  const session = localStorage.getItem("user");
  const currentPage = window.location.pathname.split("/").pop();

  // Links available depending on whether there is a session or not
  const linksNoSession = [
    { href: "registro.html",          label: "Register" },
    { href: "login.html",             label: "Login" },
    { href: "cambio-contrasena.html", label: "Change Password" },
  ];

  const linksWithSession = [
    { href: "perfil.html",            label: "My Profile" },
    { href: "cambio-contrasena.html", label: "Change Password" },
  ];

  const links = session ? linksWithSession : linksNoSession;

  // Build the <a> tags, marking the active page
  const linksHTML = links
    .map(({ href, label }) => {
      const active = href === currentPage ? ' style="font-weight: bold; text-decoration: underline;"' : "";
      return `<a href="${href}"${active}>${label}</a>`;
    })
    .join(" | ");

  // Log out link only when there is an active session
  const logoutHTML = session
    ? ` | <a href="#" onclick="logoutNav()">Log Out</a>`
    : "";

  // Inject the nav at the top of the body
  const nav = document.createElement("nav");
  nav.style.cssText = "border-bottom: 1px solid #ccc; padding: 10px 0; margin-bottom: 20px;";
  nav.innerHTML = linksHTML + logoutHTML;
  document.body.prepend(nav);
}

function logoutNav() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// Run on page load
renderNav();
