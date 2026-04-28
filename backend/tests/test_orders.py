"""Backend tests for Roots & Earth - guest order creation via /api/orders."""
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ecom-makeover-3.preview.emergentagent.com').rstrip('/')


@pytest.fixture(scope='module')
def session():
    s = requests.Session()
    s.headers.update({'Content-Type': 'application/json'})
    return s


def test_root_health(session):
    r = session.get(f'{BASE_URL}/api/')
    assert r.status_code == 200
    data = r.json()
    assert data.get('ok') is True
    assert data.get('service') == 'roots-and-earth'


def _get_a_real_product():
    """Fetch one product directly via Supabase REST using anon key (read-only)."""
    SB_URL = 'https://ufmhthhligxrhtthoiyg.supabase.co'
    SB_ANON = 'sb_publishable_pd8ZLKcd9Jtqo467cytPRA_-Bl2dwqK'
    r = requests.get(
        f'{SB_URL}/rest/v1/products?select=id,name,price,image_url&limit=1',
        headers={'apikey': SB_ANON, 'Authorization': f'Bearer {SB_ANON}'},
        timeout=10,
    )
    if r.status_code == 200 and r.json():
        return r.json()[0]
    return None


def test_create_guest_order_pickup(session):
    p = _get_a_real_product()
    if not p:
        pytest.skip('Could not fetch a product to use for order test')
    payload = {
        'user_id': None,
        'delivery_type': 'pickup',
        'phone': '+27821234567',
        'subtotal': float(p['price']) * 2,
        'delivery_fee': 20.0,
        'total': float(p['price']) * 2 + 20.0,
        'estimated_minutes': 20,
        'items': [
            {
                'product_id': p['id'],
                'product_name': p['name'],
                'price': float(p['price']),
                'quantity': 2,
                'image_url': p.get('image_url'),
            }
        ],
    }
    r = session.post(f'{BASE_URL}/api/orders', json=payload)
    assert r.status_code == 200, f'Unexpected: {r.status_code} {r.text}'
    order = r.json()
    assert 'id' in order
    assert order['delivery_type'] == 'pickup'
    assert order['phone'] == '+27821234567'
    assert order['status'] == 'confirmed'
    assert float(order['total']) == payload['total']


def test_create_guest_order_delivery(session):
    p = _get_a_real_product()
    if not p:
        pytest.skip('Could not fetch a product to use for order test')
    subtotal = float(p['price']) * 1
    payload = {
        'user_id': None,
        'delivery_type': 'delivery',
        'address': '123 Long St',
        'city': 'Cape Town',
        'postal_code': '8001',
        'phone': '+27821234567',
        'subtotal': subtotal,
        'delivery_fee': 45.0,
        'total': subtotal + 45.0,
        'estimated_minutes': 45,
        'items': [
            {
                'product_id': p['id'],
                'product_name': p['name'],
                'price': float(p['price']),
                'quantity': 1,
                'image_url': p.get('image_url'),
            }
        ],
    }
    r = session.post(f'{BASE_URL}/api/orders', json=payload)
    assert r.status_code == 200, f'Unexpected: {r.status_code} {r.text}'
    order = r.json()
    assert order['delivery_type'] == 'delivery'
    assert order['address'] == '123 Long St'
    assert order['city'] == 'Cape Town'


def test_create_order_invalid_delivery_type(session):
    payload = {
        'user_id': None,
        'delivery_type': 'invalid',
        'phone': '+27821234567',
        'subtotal': 100.0,
        'delivery_fee': 20.0,
        'total': 120.0,
        'estimated_minutes': 20,
        'items': [],
    }
    r = session.post(f'{BASE_URL}/api/orders', json=payload)
    # Pydantic validation should fail with 422
    assert r.status_code == 422


def test_supabase_products_count():
    """Sanity check there are 16 products as per problem statement."""
    SB_URL = 'https://ufmhthhligxrhtthoiyg.supabase.co'
    SB_ANON = 'sb_publishable_pd8ZLKcd9Jtqo467cytPRA_-Bl2dwqK'
    r = requests.get(
        f'{SB_URL}/rest/v1/products?select=id,name,image_url',
        headers={'apikey': SB_ANON, 'Authorization': f'Bearer {SB_ANON}'},
        timeout=10,
    )
    assert r.status_code == 200
    products = r.json()
    print(f'Total products: {len(products)}')
    for p in products:
        print(f"  - {p['name']}: {p.get('image_url', 'NO IMAGE')[:80]}")
    assert len(products) >= 1


def test_supabase_categories():
    SB_URL = 'https://ufmhthhligxrhtthoiyg.supabase.co'
    SB_ANON = 'sb_publishable_pd8ZLKcd9Jtqo467cytPRA_-Bl2dwqK'
    r = requests.get(
        f'{SB_URL}/rest/v1/categories?select=id,name',
        headers={'apikey': SB_ANON, 'Authorization': f'Bearer {SB_ANON}'},
        timeout=10,
    )
    assert r.status_code == 200
    cats = r.json()
    names = sorted([c['name'] for c in cats])
    print(f'Categories: {names}')
    assert len(cats) == 6
