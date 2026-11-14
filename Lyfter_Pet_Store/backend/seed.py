from app import app, db, Product, create_default_admin

SAMPLE_PRODUCTS = [
    {"name": "Alimento para perro adulto 8 kg", "price": 18500, "category": "Comida", "stock": 20,
     "description": "Alimento balanceado para perros adultos de todas las razas."},
    {"name": "Alimento para gato 4 kg", "price": 12900, "category": "Comida", "stock": 15,
     "description": "Alimento seco con salmón para gatos adultos."},
    {"name": "Pelota de goma para perro", "price": 3500, "category": "Juguetes", "stock": 3,
     "description": "Pelota resistente a mordidas, ideal para jugar al aire libre."},
    {"name": "Rascador para gato", "price": 22000, "category": "Accesorios", "stock": 0,
     "description": "Rascador de sisal con plataforma y juguete colgante."},
    {"name": "Collar ajustable", "price": 4800, "category": "Accesorios", "stock": 12,
     "description": "Collar de nylon ajustable con hebilla de seguridad."},
    {"name": "Shampoo antipulgas 500 ml", "price": 6200, "category": "Salud", "stock": 5,
     "description": "Shampoo para perros y gatos, elimina pulgas y garrapatas."},
    {"name": "Cama acolchada mediana", "price": 27500, "category": "Accesorios", "stock": 8,
     "description": "Cama lavable para perros y gatos de tamaño mediano."},
]


def seed():
    added = 0
    for data in SAMPLE_PRODUCTS:
        if Product.query.filter_by(name=data["name"]).first():
            continue
        db.session.add(Product(**data))
        added += 1
    db.session.commit()
    print(f"Productos agregados: {added} (ya existían: {len(SAMPLE_PRODUCTS) - added}).")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        create_default_admin()
        seed()
