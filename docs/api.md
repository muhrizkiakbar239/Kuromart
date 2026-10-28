# Referensi API

Semua respons berbentuk `{ "success": true, "data": ... }` atau `{ "success": false, "message": "..." }`. Endpoint bertanda (auth) memerlukan header `Authorization: Bearer <accessToken>`.

## Autentikasi
- POST /api/auth/register  body: email, password, fullName
- POST /api/auth/login  body: email, password
- POST /api/auth/refresh  body: refreshToken
- GET /api/auth/me (auth)

## Katalog
- GET /api/categories
- GET /api/products?category=&q=&sort=popular|rating|priceAsc|priceDesc|newest&page=&limit=
- GET /api/products/:slug
- GET /api/products/id/:id
- GET /api/reviews/product/:productId

## Keranjang dan pesanan
- POST /api/vouchers/check (auth)  body: code, subtotal
- POST /api/orders (auth)  body: items[{productId, qty}], address{name, phone, street, city, postalCode}, paymentMethod, voucherCode
- GET /api/orders (auth)
- GET /api/orders/:id (auth)
- PATCH /api/orders/:id/status (auth)  body: status = cancelled | completed

## Ulasan dan notifikasi
- POST /api/reviews (auth)  body: productId, rating, comment
- GET /api/notifications (auth)
- PATCH /api/notifications/read-all (auth)

## Favorit
- GET /api/wishlist (auth)
- GET /api/wishlist/ids (auth)
- POST /api/wishlist (auth)  body: productId
- DELETE /api/wishlist/:productId (auth)

## Seller
- POST /api/stores/apply (auth)  body: name, description
- GET /api/stores/me (auth)
- GET /api/seller/products (seller)
- POST /api/seller/products (seller)
- GET /api/seller/products/:id (seller)
- PATCH /api/seller/products/:id (seller)
- DELETE /api/seller/products/:id (seller, mengarsipkan)
- GET /api/seller/orders (seller)
- PATCH /api/seller/orders/:id/status (seller)  body: status = shipped, courier, trackingNumber

## Owner
- GET /api/stores/owner/pending
- PATCH /api/stores/owner/:id/approve
- GET /api/owner/stats
- GET /api/owner/orders
- GET /api/owner/vouchers
- POST /api/owner/vouchers
- PATCH /api/owner/vouchers/:id  body: active
