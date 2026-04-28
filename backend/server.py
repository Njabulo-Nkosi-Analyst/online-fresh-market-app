from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import requests
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ['SUPABASE_URL'].rstrip('/')
SUPABASE_SERVICE_ROLE_KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
SB_HEADERS = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
}

app = FastAPI()
api_router = APIRouter(prefix="/api")


class OrderItemIn(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int
    image_url: Optional[str] = None


class OrderIn(BaseModel):
    user_id: Optional[str] = None
    delivery_type: Literal['delivery', 'pickup']
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    phone: str
    subtotal: float
    delivery_fee: float
    total: float
    estimated_minutes: int
    items: List[OrderItemIn]


@api_router.get("/")
async def root():
    return {"service": "roots-and-earth", "ok": True}


@api_router.post("/orders")
async def create_order(payload: OrderIn):
    # Insert order using service_role (bypasses RLS) — supports guest checkouts
    order_doc = {
        'user_id': payload.user_id,
        'status': 'confirmed',
        'delivery_type': payload.delivery_type,
        'address': payload.address,
        'city': payload.city,
        'postal_code': payload.postal_code,
        'phone': payload.phone,
        'subtotal': payload.subtotal,
        'delivery_fee': payload.delivery_fee,
        'total': payload.total,
        'payment_method': 'cod',
        'estimated_minutes': payload.estimated_minutes,
    }
    r = requests.post(
        f'{SUPABASE_URL}/rest/v1/orders',
        headers=SB_HEADERS,
        json=order_doc,
        timeout=15,
    )
    if r.status_code not in (200, 201):
        raise HTTPException(status_code=400, detail=r.text)
    order = r.json()[0]

    item_docs = [
        {
            'order_id': order['id'],
            'product_id': it.product_id,
            'product_name': it.product_name,
            'price': it.price,
            'quantity': it.quantity,
            'image_url': it.image_url,
        }
        for it in payload.items
    ]
    r2 = requests.post(
        f'{SUPABASE_URL}/rest/v1/order_items',
        headers=SB_HEADERS,
        json=item_docs,
        timeout=15,
    )
    if r2.status_code not in (200, 201):
        # rollback the order if items fail
        requests.delete(
            f'{SUPABASE_URL}/rest/v1/orders?id=eq.{order["id"]}',
            headers=SB_HEADERS,
            timeout=10,
        )
        raise HTTPException(status_code=400, detail=r2.text)

    return order


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)
