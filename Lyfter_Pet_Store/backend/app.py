from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from functools import wraps
from datetime import datetime, timedelta, timezone
import math
import os
import re
import secrets
import threading
import time

import mailer

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

SECRET_KEY = os.environ.get("SECRET_KEY") or secrets.token_hex(32)
TOKEN_MAX_AGE_SECONDS = 8 * 60 * 60
token_serializer = URLSafeTimedSerializer(SECRET_KEY, salt="auth-token")

RESET_CODE_MINUTES = 10
RESET_MAX_ATTEMPTS = 5
RESET_COOLDOWN_SECONDS = int(os.environ.get("RESET_COOLDOWN_SECONDS", "60"))


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(200), nullable=True)
    description = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "category": self.category,
            "stock": self.stock,
            "image": self.image,
            "description": self.description
        }


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="client", nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role
        }


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120), nullable=True)
    shipping_address = db.Column(db.String(200), nullable=True)
    phone = db.Column(db.String(30), nullable=True)
    total = db.Column(db.Float, nullable=False)
    items = db.relationship("OrderItem", backref="order", cascade="all, delete-orphan",
                            order_by="OrderItem.id")

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() + "Z",
            "customer_name": self.customer_name,
            "customer_email": self.customer_email,
            "address": self.shipping_address,
            "phone": self.phone,
            "total": self.total,
            "items": [item.to_dict() for item in self.items]
        }


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.Integer, nullable=True)
    product_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "name": self.product_name,
            "quantity": self.quantity,
            "price": self.unit_price
        }


class PasswordReset(db.Model):
    __tablename__ = "password_resets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    code_hash = db.Column(db.String(200), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    attempts = db.Column(db.Integer, nullable=False, default=0)


def create_token(user):
    return token_serializer.dumps({"user_id": user.id})


def get_token_user():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        data = token_serializer.loads(header[len("Bearer "):], max_age=TOKEN_MAX_AGE_SECONDS)
    except (BadSignature, SignatureExpired):
        return None
    if not isinstance(data, dict):
        return None
    return User.query.get(data.get("user_id"))


def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_token_user()
        if not user:
            return jsonify({"message": "Tu sesión no es válida o expiró. Inicia sesión de nuevo."}), 401
        if user.role != "admin":
            return jsonify({"message": "No tienes permisos para realizar esta acción."}), 403
        return f(*args, **kwargs)
    return decorated_function


def validate_product_data(data, is_update=False):
    errors = []

    if not is_update:
        if not data.get("name") or not str(data.get("name")).strip():
            errors.append("El nombre del producto es obligatorio.")
        if not data.get("category") or not str(data.get("category")).strip():
            errors.append("La categoría es obligatoria.")
    else:
        if "name" in data and (not data.get("name") or not str(data.get("name")).strip()):
            errors.append("El nombre no puede estar vacío.")
        if "category" in data and (not data.get("category") or not str(data.get("category")).strip()):
            errors.append("La categoría no puede estar vacía.")

    if "price" in data or not is_update:
        price = data.get("price")
        if price is None or not isinstance(price, (int, float)) or price <= 0:
            errors.append("El precio debe ser un número mayor a 0.")

    image = data.get("image")
    if image and (not isinstance(image, str) or len(image) > 200
                  or not re.match(r"^https?://", image.strip(), re.IGNORECASE)):
        errors.append("La imagen debe ser una dirección web que empiece con http:// o https:// (máximo 200 caracteres).")

    if "stock" in data or not is_update:
        stock = data.get("stock")
        if stock is None or not isinstance(stock, int) or stock < 0:
            errors.append("El stock debe ser un número entero mayor o igual a 0.")

    return errors


def create_default_admin():
    admin_email = "admin@pawstore.com"
    existing_admin = User.query.filter_by(email=admin_email).first()

    if not existing_admin:
        hashed_password = generate_password_hash("admin123")
        default_admin = User(
            name="Administrador",
            email=admin_email,
            password_hash=hashed_password,
            role="admin"
        )
        db.session.add(default_admin)
        db.session.commit()
        print("Usuario administrador creado por defecto: admin@pawstore.com / admin123")


@app.route("/")
def home():
    return jsonify({"message": "API de PawStore activa"})


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "Todos los campos son obligatorios."}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "El correo electrónico ya está registrado."}), 400

    hashed_password = generate_password_hash(password)

    new_user = User(
        name=name.strip(),
        email=email.strip().lower(),
        password_hash=hashed_password,
        role="client"
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuario registrado exitosamente", "user": new_user.to_dict()}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Correo y contraseña son obligatorios."}), 400

    user = User.query.filter_by(email=email.strip().lower()).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Credenciales inválidas."}), 401

    return jsonify({
        "message": "Inicio de sesión exitoso",
        "user": user.to_dict(),
        "token": create_token(user)
    }), 200


@app.route("/me", methods=["GET"])
def get_profile():
    user = get_token_user()
    if not user:
        return jsonify({"message": "Tu sesión no es válida o expiró. Inicia sesión de nuevo."}), 401
    return jsonify({"user": user.to_dict()})


@app.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@app.route("/products", methods=["POST"])
@require_admin
def add_product():
    data = request.get_json() or {}

    errors = validate_product_data(data, is_update=False)
    if errors:
        return jsonify({"errors": errors}), 400

    new_product = Product(
        name=data.get("name").strip(),
        price=float(data.get("price")),
        category=data.get("category").strip(),
        stock=int(data.get("stock")),
        image=data.get("image"),
        description=data.get("description")
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({"message": "Producto agregado exitosamente", "product": new_product.to_dict()}), 201

@app.route("/products/<int:product_id>", methods=["PUT"])
@require_admin
def update_product(product_id):
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Producto no encontrado"}), 404

    data = request.get_json() or {}

    errors = validate_product_data(data, is_update=True)
    if errors:
        return jsonify({"errors": errors}), 400

    product.name = data.get("name", product.name)
    product.price = data.get("price", product.price)
    product.category = data.get("category", product.category)
    product.stock = data.get("stock", product.stock)
    product.image = data.get("image", product.image)
    product.description = data.get("description", product.description)

    db.session.commit()
    return jsonify({"message": "Producto actualizado exitosamente", "product": product.to_dict()})

@app.route("/products/<int:product_id>", methods=["DELETE"])
@require_admin
def delete_product(product_id):
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Producto no encontrado"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Producto eliminado exitosamente"})


def clean_text(value, max_length):
    if not isinstance(value, str):
        return None
    value = value.strip()[:max_length]
    return value or None


def is_positive_int(value):
    return isinstance(value, int) and not isinstance(value, bool) and value >= 1


@app.route("/orders", methods=["POST"])
def create_order():
    data = request.get_json() or {}
    items = data.get("items", [])

    if not items or not isinstance(items, list):
        return jsonify({"message": "El carrito está vacío."}), 400

    quantities = {}
    for item in items:
        product_id = item.get("id") if isinstance(item, dict) else None
        quantity = item.get("quantity") if isinstance(item, dict) else None

        if not is_positive_int(product_id) or not is_positive_int(quantity):
            return jsonify({"message": "Datos de producto incompletos en la orden."}), 400

        quantities[product_id] = quantities.get(product_id, 0) + quantity

    products = {}
    for product_id, quantity in quantities.items():
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": f"Producto con ID {product_id} no encontrado."}), 404

        if product.stock < quantity:
            return jsonify({"message": f"Stock insuficiente para el producto: {product.name}"}), 400

        products[product_id] = product

    customer = data.get("customer") if isinstance(data.get("customer"), dict) else {}
    user_id = data.get("user_id")
    user = User.query.get(user_id) if is_positive_int(user_id) else None

    order = Order(
        user_id=user.id if user else None,
        customer_name=clean_text(customer.get("name"), 100) or (user.name if user else "Cliente"),
        customer_email=clean_text(customer.get("email"), 120) or (user.email if user else None),
        shipping_address=clean_text(customer.get("address"), 200),
        phone=clean_text(customer.get("phone"), 30),
        total=0
    )

    total = 0
    for product_id, quantity in quantities.items():
        product = products[product_id]
        product.stock -= quantity
        order.items.append(OrderItem(
            product_id=product.id,
            product_name=product.name,
            quantity=quantity,
            unit_price=product.price
        ))
        total += product.price * quantity

    order.total = round(total, 2)
    db.session.add(order)
    db.session.commit()

    return jsonify({
        "message": "Compra procesada exitosamente y stock actualizado.",
        "order": order.to_dict()
    }), 201


@app.route("/orders", methods=["GET"])
@require_admin
def get_orders():
    orders = Order.query.order_by(Order.created_at.desc(), Order.id.desc()).all()
    return jsonify([order.to_dict() for order in orders])


INVALID_CODE_MESSAGE = "Código inválido o vencido. Solicita uno nuevo."
DUMMY_HASH = generate_password_hash("000000")
RESET_REQUEST_TIMES = {}


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def normalize_email(value):
    return value.strip().lower() if isinstance(value, str) else ""


def validate_new_password(password):
    if (len(password) < 8 or len(password) > 64
            or not re.search(r"[a-z]", password)
            or not re.search(r"[A-Z]", password)
            or not re.search(r"\d", password)):
        return "La contraseña debe tener entre 8 y 64 caracteres, con mayúscula, minúscula y número."
    return None


def send_reset_email(to_email, code):
    if not mailer.is_configured():
        print(f"[DEV] Código para restablecer la contraseña de {to_email}: {code} "
              f"(vence en {RESET_CODE_MINUTES} min). Configura SMTP_HOST para enviar correos reales.")
        return

    body = (
        "Hola,\n\n"
        f"Tu código de verificación es: {code}\n\n"
        f"Vence en {RESET_CODE_MINUTES} minutos. Si no lo solicitaste, ignora este mensaje: "
        "tu contraseña no cambiará.\n\n"
        "PawStore"
    )
    try:
        mailer.send_email(to_email, "Tu código para restablecer la contraseña - PawStore", body)
        print(f"[INFO] Correo de recuperación enviado a {to_email}. Si no llega, revisa la carpeta de spam.")
    except Exception as error:
        print(f"[ERROR] No se pudo enviar el correo de recuperación a {to_email}: {error!r}\n"
              "        Ejecuta 'python test_email.py tu@correo.com' para diagnosticar la configuración.")


@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True)
    email = normalize_email(data.get("email") if isinstance(data, dict) else None)

    if not email or "@" not in email or len(email) > 120:
        return jsonify({"message": "Ingresa un correo electrónico válido."}), 400

    now = time.time()
    last_request = RESET_REQUEST_TIMES.get(email)
    if last_request is not None and now - last_request < RESET_COOLDOWN_SECONDS:
        wait = math.ceil(RESET_COOLDOWN_SECONDS - (now - last_request))
        return jsonify({"message": f"Espera {wait} segundos antes de solicitar otro código.",
                        "retry_after": wait}), 429

    if len(RESET_REQUEST_TIMES) > 1000:
        for key in [k for k, t in RESET_REQUEST_TIMES.items() if now - t >= RESET_COOLDOWN_SECONDS]:
            del RESET_REQUEST_TIMES[key]
    RESET_REQUEST_TIMES[email] = now

    user = User.query.filter_by(email=email).first()
    if user:
        code = f"{secrets.randbelow(10 ** 6):06d}"

        PasswordReset.query.filter_by(user_id=user.id).delete()
        db.session.add(PasswordReset(
            user_id=user.id,
            code_hash=generate_password_hash(code),
            expires_at=utc_now() + timedelta(minutes=RESET_CODE_MINUTES)
        ))
        db.session.commit()

        threading.Thread(target=send_reset_email, args=(user.email, code), daemon=True).start()
    else:
        generate_password_hash("000000")
        print(f"[INFO] Recuperación solicitada para un correo NO registrado ({email}): no se envía nada.")

    return jsonify({
        "message": "Si el correo está registrado, te enviamos un código de verificación.",
        "retry_after": RESET_COOLDOWN_SECONDS
    }), 200


@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True)
    data = data if isinstance(data, dict) else {}
    email = normalize_email(data.get("email"))
    code = data.get("code")
    password = data.get("password")

    if not email or not isinstance(code, str) or not isinstance(password, str):
        return jsonify({"message": "Todos los campos son obligatorios."}), 400
    code = code.strip()
    if not re.fullmatch(r"\d{6}", code):
        return jsonify({"message": "El código debe tener 6 dígitos."}), 400

    password_error = validate_new_password(password)
    if password_error:
        return jsonify({"message": password_error}), 400

    user = User.query.filter_by(email=email).first()
    reset = PasswordReset.query.filter_by(user_id=user.id).first() if user else None

    is_valid = False
    if reset and reset.expires_at > utc_now() and reset.attempts < RESET_MAX_ATTEMPTS:
        is_valid = check_password_hash(reset.code_hash, code)
    else:
        check_password_hash(DUMMY_HASH, code)

    if not is_valid:
        if reset:
            reset.attempts += 1
            if reset.attempts >= RESET_MAX_ATTEMPTS or reset.expires_at <= utc_now():
                db.session.delete(reset)
            db.session.commit()
        return jsonify({"message": INVALID_CODE_MESSAGE}), 400

    user.password_hash = generate_password_hash(password)
    PasswordReset.query.filter_by(user_id=user.id).delete()
    db.session.commit()
    return jsonify({"message": "Contraseña actualizada exitosamente."}), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        create_default_admin()
    if mailer.is_configured():
        settings = mailer.smtp_settings()
        print(f"Recuperación de contraseña: se enviarán correos por SMTP ({settings['host']}:{settings['port']}).")
    else:
        print("Recuperación de contraseña: SMTP_HOST no está configurado; los códigos se imprimirán en esta consola.")
    app.run(debug=True, port=5000)
