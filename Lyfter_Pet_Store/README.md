# PawStore — Lyfter Pet Store

Frontend of an online pet store, built for the **Module 2 final project** (Frontend). It is a multi-page web app written with plain HTML5, CSS3 and JavaScript (ES modules, no framework and no build step) that talks to a Flask REST API.

Customers can browse the catalog, register, log in, fill a cart and complete a (simulated) purchase. Administrators can manage the product inventory and see every sale in a dedicated panel.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Project structure](#project-structure)
5. [How the frontend connects to the backend](#how-the-frontend-connects-to-the-backend)
6. [Pages and access rules](#pages-and-access-rules)
7. [Technical decisions and justification](#technical-decisions-and-justification)
8. [Requirements checklist](#requirements-checklist)
9. [Manual testing guide](#manual-testing-guide)
10. [Known limitations](#known-limitations)

---

## Features

**1. Home and authentication**
- Landing page with the value proposition and clear ways to enter (`Iniciar sesión` / `Crear cuenta`).
- Login and registration forms with strict validation.
- The header changes with the session: visitors see a login button; logged-in users see their name and a logout button; administrators also see the admin link.

**2. Customer dashboard and cart**
- Product catalog grid with search, an "only available" filter and visible stock (`Disponible`, `¡Últimas N unidades!`, `Agotado`).
- All catalog states are covered: loading, empty (the API returned no data), and error with a retry button.
- Single product page, shopping cart (change quantity, remove, totals), order summary with a simulated payment form, and an order confirmation page.
- The catalog and the product page never let you add more units than the available stock, and the backend checks the stock again when the order is created.

**3. Admin panel** (administrators only)
- Inventory table with a link to the edit page and a delete button.
- Sales table (date, customer, products and total), loaded from the database.
- Form to add products, and a dedicated page to edit a product (price, stock and every other field).

**Extra:** contact page, input masks for the card number and expiry date, non-blocking notifications, and responsive layout.

---

## Tech stack

| Layer | Technology |
|---|---|
| Structure | Semantic HTML5 |
| Styles | Plain CSS3 with Flexbox and Grid. **No `px`:** only `rem`, `em`, `%`, `vh`, `vw` |
| Logic | JavaScript (ES modules) and the Fetch API |
| Persistence in the browser | `localStorage` (session and cart) |
| Backend | Python, Flask, Flask-SQLAlchemy, SQLite |

---

## Getting started

### Requirements
- Python 3.10 or newer (tested with 3.12)
- A modern browser
- A way to serve static files, for example the VS Code **Live Server** extension or `python3 -m http.server`

### 1. Start the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py                   # optional: loads 7 sample products (safe to run again)
python app.py                    # API running at http://127.0.0.1:5000
```

The SQLite database is created automatically in `backend/instance/database.db` the first time the server starts. The tables for sales (`orders`, `order_items`) are created together with the rest.

**Default administrator** (created automatically): `admin@pawstore.com` / `admin123`.
Customers register themselves from the registration page.

To start from scratch, stop the server, delete `backend/instance/database.db` and run `python seed.py` again.

### 2. Open the frontend

Serve the project root (the folder with `index.html`) and open it in the browser:

- **Live Server:** right click `index.html` → *Open with Live Server* (usually `http://127.0.0.1:5500`).
- **Or Python:** `python3 -m http.server 5500` from the project root, then open `http://localhost:5500`.

> Do not open the HTML files by double clicking them (`file://`): browsers block ES modules and cross-origin requests from `file://`, so nothing would load.

> If Live Server reloads the page by itself after a purchase, it is detecting the database file changing. Add `backend/**` to the `liveServer.settings.ignoreFiles` setting.

### Configuration

Everything the frontend needs to know about the backend is at the top of [`js/services/api.js`](js/services/api.js):

```js
export const API_BASE_URL = 'http://127.0.0.1:5000';
const API_KEY = 'mi_clave_secreta_123';
```

The API key must be the same as `API_KEY` in `backend/app.py`. The backend allows requests from any origin (CORS), so the frontend can run on any port.

---

## Project structure

```
.
├── index.html                 Home
├── productos.html             Catalog
├── producto.html              Single product (producto.html?id=1)
├── carrito.html               Shopping cart
├── summary.html               Order summary + simulated payment
├── order-completed.html       Purchase confirmation
├── login.html / registro.html Authentication
├── contacto.html              Contact form (simulated sending)
├── admin.html                 Admin panel (inventory, sales, add product)
├── edit-product.html          Edit one product (edit-product.html?id=1)
├── css/
│   ├── styles.css             All shared styles (rem/em only)
│   └── carrito.css            Styles of the cart page
├── js/
│   ├── services/
│   │   └── api.js             The ONLY file that talks to the backend (no DOM code)
│   ├── (page controllers)
│   │   ├── index.js           main.js (catalog)        producto.js
│   │   ├── carrito.js         summary.js               order-completed.js
│   │   ├── login.js           registro.js              contacto.js
│   │   └── admin.js           edit-product.js
│   └── (shared modules)
│       ├── validators.js      Pure validation functions (Regex), no DOM
│       ├── ui.js              Error messages, toasts, error/login-required screens
│       ├── layout.js          Header, cart modal and footer shared by every page
│       ├── cart.js            Cart in localStorage (add, stock check, totals)
│       ├── session.js         Reads the logged-in user
│       ├── auth-guard.js      Keeps non-admins out of the admin pages
│       ├── sales.js           Normalizes the orders shown in the sales table
│       ├── product-ui.js      Image, stock badge and "add to cart" button state
│       ├── product-form.js    Validation/reading of the product form (add and edit)
│       ├── input-masks.js     Card number / expiry / CVV masks
│       └── utils.js           Currency formatting and safe element creation
└── backend/
    ├── app.py                 Flask API (products, users, orders)
    ├── seed.py                Loads sample products
    └── requirements.txt       Python dependencies
```

---

## How the frontend connects to the backend

All requests go through one function (`request()` in `js/services/api.js`) that adds the headers, parses the JSON and turns every failure into an `Error` with a message that is ready to show to the user. Pages never call `fetch` directly.

| Method | Endpoint | Protected | Used for |
|---|---|---|---|
| `POST` | `/register` | no | Create an account (`nombre`, `email`, `password`) |
| `POST` | `/login` | no | Log in; returns `{ user: { id, nombre, email, role } }` |
| `GET` | `/products` | no | Catalog, product page, admin inventory, edit page |
| `POST` | `/products` | API key | Add a product |
| `PUT` | `/products/:id` | API key | Edit a product |
| `DELETE` | `/products/:id` | API key | Delete a product |
| `POST` | `/orders` | no | Create an order: `{ items: [{ id, cantidad }], customer: { nombre, email, direccion, telefono }, user_id }` → `201 { message, order }` |
| `GET` | `/orders` | API key | Sales history for the admin panel, newest first |

- **Protected** endpoints expect the header `X-API-Key`.
- Errors can come as `{ "message": ... }`, `{ "error": ... }` or `{ "errors": [...] }`; the API module understands all three.
- When the server cannot be reached, the user sees *"No se pudo conectar con el servidor..."* instead of an empty screen.

### What the backend does with an order (`POST /orders`)

1. Validates every line (whole numbers ≥ 1) and groups repeated products.
2. Checks that every product exists and has enough stock **before changing anything**, so a failed order never leaves the stock half updated.
3. Calculates the total **on the server** from the database prices (a total sent by the client is ignored).
4. Subtracts the stock and saves the sale in `orders` / `order_items`, in the same transaction.

Each sale line stores the **name and price at the moment of the sale**, so later price changes or deleting a product never alter the sales history.

> **Older backends:** if the API has no `GET /orders` (it answers 404/405), the admin panel falls back to a local record of the purchases made in that browser and shows a notice saying so. With the included backend this fallback is never used.

---

## Pages and access rules

| Page | Who can open it |
|---|---|
| `index`, `productos`, `producto`, `login`, `registro`, `contacto` | Everyone |
| `carrito`, `summary` | Logged-in users. Visitors see a "Debes iniciar sesión para continuar" screen |
| `order-completed` | Shows the last order; redirects to the home page if there is none |
| `admin`, `edit-product` | Administrators only. Anyone else is sent to the login page |

---

## Technical decisions and justification

### Architecture and modularity
- **Vanilla ES modules, no framework or bundler.** The project requirements ask for HTML/CSS/JS, and native modules give clean separation and no tooling to install: cloning the repo and serving the folder is enough.
- **API logic is separated from DOM logic.** `services/api.js` contains no DOM code and is the only place that calls `fetch`. `validators.js` and `sales.js` are pure functions. `ui.js`, `layout.js` and the page controllers handle the DOM. This makes each piece easy to read, reuse and test.
- **One controller per page, shared modules for what repeats.** The product form (`product-form.js`) is shared by the add form and the edit page; the stock badge and "add to cart" button (`product-ui.js`) are shared by the catalog and the product page.
- **Fetch instead of Axios.** Fetch is built in (no dependency) and covers the needs. The small `request()` wrapper gives what Axios would: JSON handling, a single place for headers, and normalized errors (including the HTTP status, used for example to detect a missing endpoint).

### Styles
- **Relative units only (`rem`, `em`, `%`, `vh`, `vw`).** Sizes follow the user's browser font size, which is better for accessibility and responsive design. Even 1-pixel borders are written as `0.0625rem`, and media queries use `em`. No `px` appears in any CSS, HTML or JS file.
- **Grid for two-dimensional layouts** (product grid, product detail, checkout), **Flexbox for one-dimensional ones** (header, button groups, forms rows).
- Colors and fonts are free to choose in the brief; the palette is green on neutral grays and the system font stack is used (no external fonts to load).

### State in the browser
- **`localStorage`** keeps the session (`currentUser`) and the cart (`cart`), as required, so both survive a page reload and closing the tab. Reading these values is wrapped in `try/catch`, so a corrupted value never breaks a page.
- The stock is checked again **by the backend** when the order is created: the cart in the browser is a convenience, never the source of truth.

### Validation
- Every form is validated in the browser **before** calling the API, with Regex rules in `validators.js`, and the backend validates again (the client is never trusted).
- Browser-native validation bubbles are turned off (`novalidate`) so every message is in Spanish, in the page, and consistent.

| Field | Rule |
|---|---|
| Email | `name@domain.tld`, no spaces, TLD of 2+ letters |
| Full name | At least two words, letters only (accents allowed), 5–60 characters |
| Password (register) | 8–64 characters with a lowercase, an uppercase and a digit. Login only requires it not to be empty, so older accounts are never locked out |
| Phone | Costa Rican number: 8 digits starting with 2–8, optional `+506` |
| Card | 16 digits (grouped in 4), expiry `MM/AA` that is not in the past, CVV of 3–4 digits |
| Product | Name 3–80 characters, description 10–500, price > 0 with up to 2 decimals, whole-number stock ≥ 0, category of 3–30 letters, `http(s)` image URL |

### Error handling
The interface never relies on the console alone or on `alert()`:
- **Field errors** appear under the field (`aria-invalid` + `aria-describedby`), the first invalid field gets the focus, and the error disappears as soon as the user edits the field.
- **Form messages** show validation summaries and server errors (for example *"Stock insuficiente para el producto: ..."*).
- **Error states with a "Reintentar" button** for the catalog, product page, edit page and admin tables. A product that does not exist shows *"Producto no encontrado"* without a pointless retry button.
- **Toasts** (non-blocking) confirm actions such as adding to the cart or deleting a product.

### Sales stored in the database
- A sale is saved by the backend in the same transaction that updates the stock, so sales and stock cannot disagree.
- Prices and names are copied into the sale lines (see above) and totals are computed server-side.
- The admin sales table reads `GET /orders`, so any browser sees the same history.

### Security
- Data coming from the API (product names, customer names...) is written with `textContent` / DOM APIs in the catalog, product page, admin tables, edit page and sales table, so it can never be interpreted as HTML. See *Known limitations* for the places still to harden.
- **Card data never leaves the browser**: it is validated on the client and is not sent to the backend or stored anywhere (the payment is simulated).
- Passwords are hashed by the backend (Werkzeug).
- Admin pages are guarded in the browser (`auth-guard.js`) for a clean user experience, and the admin API routes are protected with an API key (see limitations).

### Accessibility and UX
- Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, labels on every input, `aria-live` for loading/status areas, `aria-current` on the active menu link and visible keyboard focus.
- Input masks help the user: the card number is grouped as they type, and the expiry date adds the `/` automatically.

### Simulated features
- **Payment:** the card form is fictitious by design (the title says so). Nothing is charged.
- **Contact form:** the backend has no contact endpoint, so the form validates and confirms but does not send anything.

### Product page lookup
`GET /products/:id` does not exist in the backend, so the product page asks for the list and picks the product by id. It is simple and fine for a small catalog; the function (`getProductById`) is isolated in `api.js` so it is a one-line change if the route is added.

---

## Requirements checklist

| Requirement | Where it is met |
|---|---|
| Semantic HTML5 | Landmarks and headings on every page; header/footer from `layout.js` |
| CSS3 with Flexbox or Grid | `css/styles.css`, `css/carrito.css` |
| No `px` for sizes or fonts | Only `rem`, `em`, `%`, `vh`, `vw` |
| Fetch or Axios | Fetch, in `js/services/api.js` |
| `localStorage` for session and cart | `login.js`, `session.js`, `cart.js` |
| API logic separated from DOM logic | `services/api.js` (no DOM) vs `ui.js` and page controllers |
| Strict form validation (Regex, minimum lengths, data types) | `js/validators.js`, `js/ui.js` |
| API errors shown to the user | `request()` in `api.js` + `ui.js` (messages, retry states, toasts) |
| Index, login, register, session restriction, headers | `index.html`, `login.html`, `registro.html`, `layout.js`, `ui.js` (login required screen) |
| Catalog (with empty state), product page, cart, order summary, confirmation | `productos.html`, `producto.html`, `carrito.html`, `summary.html`, `order-completed.html` |
| Admin: inventory and sales tables, edit page | `admin.html`, `edit-product.html` |
| GitHub repository and this README | This file |

---

## Manual testing guide

1. Start the backend with `python seed.py` and `python app.py`, then serve the frontend.
2. **As a visitor:** open the catalog. You should see 7 products with one `Agotado` and two `¡Últimas N unidades!` badges. Try the search box and the "only available" filter. Open a product.
3. **Register** a new account (password with uppercase, lowercase and digit) and **log in**.
4. **Add products to the cart.** Add the same product repeatedly: the button becomes *"Máximo en tu carrito"* when you reach the stock.
5. **Check out:** fill the form. A test card: `4000 1234 5678 9010`, an expiry in the future (for example `12/30`) and CVV `123`. You land on the confirmation page.
6. **Log in as the administrator** (`admin@pawstore.com` / `admin123`): the sale appears in the sales table with the customer, products and total, and the stock in the inventory has decreased.
7. **Edit a product** from the inventory (change its price or stock) and **add** a new one.
8. **Error states:** stop the backend and reload the catalog: you get a clear message with a *Reintentar* button. Submit a form with invalid data to see the validation messages.

---

## Known limitations

- **Admin protection is client-side only.** The API key lives in the frontend (a requirement of the Module 1 API design), so it keeps casual users out but is not real security. A production version needs server-side sessions or tokens and role checks in the API.
- **Payment and contact are simulated** (see above).
- **Some HTML is still built from template strings** with product names: the cart page, the checkout list and the header/cart modal. Names are not escaped there yet, so they should be moved to `textContent` like the rest of the app.
- **The `+` button on the cart page does not check the stock yet** (the catalog and product page do). The backend still rejects an order that exceeds the stock and the message is shown to the user.
- **Forms do not declare `method="post"`.** They are always handled by JavaScript, but declaring it would keep credentials out of the URL if a form were submitted before the script loads.
- **Three pages** (`login.html`, `registro.html`, `carrito.html`) still start the shared layout from a small inline module script instead of from their own `.js` file.
- **Some file names are in Spanish** (`productos.html`, `carrito.js`, ...) because they predate the rest of the project.
- **No automated tests are included.** The app was verified manually and with throwaway browser scripts.
- The cart lives in each browser's `localStorage`, so it is not shared between devices.
