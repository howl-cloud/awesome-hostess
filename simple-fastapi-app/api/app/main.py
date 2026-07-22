from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from hostess_sdk.fastapi import instrument
from pydantic import BaseModel

_PRODUCTS: list[dict] = [
    {"id": 1, "name": "Pro Match Soccer Ball", "category": "football", "price": 29.99, "stock": 142},
    {"id": 2, "name": "Trail Running Shoes", "category": "running", "price": 119.99, "stock": 37},
    {"id": 3, "name": "Adjustable Basketball Hoop", "category": "basketball", "price": 249.99, "stock": 12},
    {"id": 4, "name": "Road Cycling Helmet", "category": "cycling", "price": 89.99, "stock": 54},
    {"id": 5, "name": "Grip Training Gloves", "category": "fitness", "price": 24.99, "stock": 203},
    {"id": 6, "name": "Match Football Boots", "category": "football", "price": 79.99, "stock": 28},
    {"id": 7, "name": "Compression Running Socks", "category": "running", "price": 14.99, "stock": 411},
    {"id": 8, "name": "Indoor Basketball", "category": "basketball", "price": 39.99, "stock": 88},
]

_ORDERS: list[dict] = []
_next_order_id = 1


class HealthResponse(BaseModel):
    status: str


class Product(BaseModel):
    id: int
    name: str
    category: str
    price: float
    stock: int


class OrderCreate(BaseModel):
    product_id: int
    quantity: int


class Order(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    total: float
    created_at: str


app = FastAPI(title="KickOff Sports API", version="1.0.0")
instrument(app)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/products", response_model=list[Product])
async def list_products(category: str | None = None) -> list[Product]:
    products = _PRODUCTS if category is None else [p for p in _PRODUCTS if p["category"] == category]
    return [Product(**p) for p in products]


@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int) -> Product:
    product = next((p for p in _PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)


CATEGORIES = list(dict.fromkeys(p["category"] for p in _PRODUCTS))


@app.get("/categories", response_model=list[str])
async def list_categories() -> list[str]:
    return CATEGORIES


@app.post("/orders", response_model=Order, status_code=201)
async def create_order(body: OrderCreate) -> Order:
    global _next_order_id
    product = next((p for p in _PRODUCTS if p["id"] == body.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["stock"] < body.quantity:
        raise HTTPException(status_code=409, detail="Insufficient stock")
    order = {
        "id": _next_order_id,
        "product_id": product["id"],
        "product_name": product["name"],
        "quantity": body.quantity,
        "total": round(product["price"] * body.quantity, 2),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _ORDERS.append(order)
    _next_order_id += 1
    return Order(**order)


@app.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: int) -> Order:
    order = next((o for o in _ORDERS if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)
