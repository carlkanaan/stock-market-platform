# Stripe Webhook Verification

Stripe webhooks were tested locally using Stripe CLI forwarding with verified signed webhook events.
launch the server using npm run start and open another terminal and type "stripe listen --forward-to localhost:3000/wallet/stripe/webhook" to activate listening mode for webhooks
Example of successful webhook delivery by crediting 150$ to a member's wallet:
(base) carlkanaan@Carls-MacBook-Pro stock-market-platform % stripe listen --forward-to localhost:3000/wallet/stripe/webhook

> Ready! You are using Stripe API Version [2026-04-22.dahlia]. Your webhook signing secret is xxxxxxxxxxxxxxxxxxxx (^C to quit)
> 2026-05-18 11:29:09 --> payment_intent.created [evt_3TYMXvRm5OgEoZxq10D24Vhj]
> 2026-05-18 11:29:09 <-- [201] POST http://localhost:3000/wallet/stripe/webhook [evt_3TYMXvRm5OgEoZxq10D24Vhj]
> 2026-05-18 11:29:09 <-- [201] POST http://localhost:3000/wallet/stripe/webhook [evt_1TYMXwRm5OgEoZxqs4aIQbkZ]
> 2026-05-18 11:36:00 --> charge.succeeded [evt_3TYMeYRm5OgEoZxq0NIRgw2e]
> 2026-05-18 11:36:00 <-- [201] POST http://localhost:3000/wallet/stripe/webhook [evt_3TYMeYRm5OgEoZxq0NIRgw2e]
> 2026-05-18 11:36:00 --> payment_intent.succeeded [evt_3TYMeYRm5OgEoZxq0yXrDkBM]
> 2026-05-18 11:36:00 <-- [201] POST http://localhost:3000/wallet/stripe/webhook [evt_3TYMeYRm5OgEoZxq0yXrDkBM]
> 2026-05-18 11:36:00 --> checkout.session.completed [evt_1TYMeaRm5OgEoZxqfmIPV5YU]

BEFORE:

{
"success": true,
"data": {
"id": "6a04509c87e7aea6bfc14767",
"memberId": "6a044c6a84507ede853874d2",
"balance": 268,
"createdAt": "2026-05-13T10:21:16.502Z",
"lastDepositAt": "2026-05-13T10:29:43.176Z",
"updatedAt": "2026-05-18T08:29:09.149Z"
}
}

AFTER:

{
"success": true,
"data": {
"id": "6a04509c87e7aea6bfc14767",
"memberId": "6a044c6a84507ede853874d2",
"balance": 418,
"createdAt": "2026-05-13T10:21:16.502Z",
"lastDepositAt": "2026-05-13T10:29:43.176Z",
"updatedAt": "2026-05-18T08:36:01.050Z"
}
}

### Microservices & Messaging

Implemented a Notification Service using RabbitMQ and NestJS microservices.
The Notification Service consumes these events asynchronously, fully decoupling notification responsibilities from the core backend.

The Core Service publishes domain events:

- wallet credited
- trade executed
- price alert triggered

Benefits involves : better scalability, improved separation of concerns, non-blocking event-driven processing

Proof of Successful Microservice Messaging Notfication Service:

(base) carlkanaan@Carls-MacBook-Pro notification-service % npm run start

> notification-service@0.0.1 start
> nest start
> [Nest] 20972 - 05/18/2026, 1:24:15 PM LOG [NestFactory] Starting Nest application...
> [Nest] 20972 - 05/18/2026, 1:24:15 PM LOG [InstanceLoader] AppModule dependencies initialized +5ms
> [Nest] 20972 - 05/18/2026, 1:24:15 PM LOG [NestMicroservice] Nest microservice successfully started +35ms
> [Nest] 19873 - 05/18/2026, 1:19:35 PM LOG [NotificationService] Wallet credited event received: {"memberId":"6a044c6a84507ede853874d2","amount":250,"balance":1024}
> [Nest] 19873 - 05/18/2026, 1:20:34 PM LOG [NotificationService] Wallet credited event received: {"memberId":"6a044c6a84507ede853874d2","amount":100,"balance":1124}
> [Nest] 19873 - 05/18/2026, 1:20:48 PM LOG [NotificationService] Trade executed event received: {"type":"BUY","memberId":"6a044c6a84507ede853874d2","stockId":"6a05f6500d95fd7850ed4432","quantity":1,"totalValue":182}
> [Nest] 19873 - 05/18/2026, 1:20:53 PM LOG [NotificationService] Trade executed event received: {"type":"SELL","memberId":"6a044c6a84507ede853874d2","stockId":"6a041387667b1eae85092b91","quantity":1,"totalValue":120}
> [Nest] 20972 - 05/18/2026, 1:25:35 PM LOG [NotificationService] Price alert event received: {"memberId":"6a044c6a84507ede853874d2","stockId":"6a041387667b1eae85092b91","currentPrice":125,"targetPrice":100}
> [Nest] 20972 - 05/18/2026, 1:25:35 PM LOG [NotificationService] Price alert event received: {"memberId":"6a044c6a84507ede853874d2","stockId":"6a041387667b1eae85092b91","currentPrice":125,"targetPrice":125}
