# Stock Market Platform: A backend stock market trading platform

## Core features:

1- Authentication & Authorization : JWT-based authentication and role-based access control (Member , Analyst(Admin) , Super-Admin,Support Agent)
Includes : CMS/Member login , JWT routes protection, Role-based restrictions, decorators for public routes
2- Member Management: Member registration , OTP email verification, Account approval/rejection by Admin, Account suspension/reinstatement
3- Wallet Management: Deposit, Withdrawal (with approval), transaction history, Manual admin wallet adjustments, Negative balance, 48hr withdrawal block after deposit
4- Portfolio & Trading Stocks: Buy, Sell, Display Portfolio, Average purchase stock price, Profit/Loss for member, Order history
5- Stock Management: Create Stock, update stock price, delist stock, stock price history, price alert (emailed)
6- Analytics: Trading volume, assets under management, top traded stocks, active members, sector allocation, member growth, pending withdrawal

## Bonus Features

# 1- Redis Caching

Redis caching was implemented to reduce repeated database queries and allow faster request retrieval.
Caching was applied for stock catalogue and member portfolio display.
Cache invalidation happens directly after stock price updates and buy/sell trades.

Example: Instead of a request taking 1 second or more to retrieve data from the database, it will take 4 to 8 milliseconds to get the data because a copy of the data is found in the RAM for faster access.

# 2- Email Notification

SendGrid was used to implement transaction email member delivery and take action on the following features:
.OTP delivery
.Wallet credit confirmation
.Trade execution confirmation (buy/sell)
.Price alert notification
.CMS account provisioning

Example for received emails:

Your OTP Code
Inbox
ckanaan02@gmail.com via sendgrid.net
Wed 13 May, 13:03 (6 days ago) to me

Your verification code is 740121.

This code expires in 10 minutes.

# 3- Stripe Webhook Verification

Stripe webhooks were tested locally using Stripe CLI forwarding with verified signed webhook events.
launch the server using npm run start and open another terminal and type "stripe listen --forward-to localhost:3000/wallet/stripe/webhook" to activate listening mode for webhooks
Example of successful webhook delivery by crediting 150$ to a member's wallet:
(base) carlkanaan@Carls-MacBook-Pro stock-market-platform % stripe listen --forward-to localhost:3000/wallet/stripe/webhook

> Ready! You are using Stripe API Version [2026-04-22.dahlia]. Your webhook signing secret is xxxxxxxxxxxxxxxxxxxx
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

# 4- Microservices & Messaging

Notification service was implemented using RabbitMQ and NestJS microservices.
The Notification Service consumes these events asynchronously, fully decoupling notification responsibilities from the core backend.

The Standalone service involves domain events:

.wallet credited
.trade executed
.price alert triggered

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

# 5- Rate Limiting

Throttling was implemented using NestJS Throttler to prevent DDOS and brute force attack protecting the following features:
.Registration
.Member Login
.OTP Verification

Example API response:
{
"success": false,
"statusCode": 429,
"path": "/members/login",
"method": "POST",
"message": "ThrottlerException: Too Many Requests",
"timestamp": "2026-05-19T07:39:19.504Z"
}
