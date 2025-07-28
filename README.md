# Batuta Orders API

Order Management System built with Node.js, TypeScript, Express, and MongoDB (Mongoose).

## 📦 Technologies

Node.js 18 + TypeScript
* Express
* MongoDB via Mongoose
* Redis for centralized caching
* Pagination with `mongoose-paginate-v2`
* Alert scheduling with `node-cron` and `dayjs`
* Unit and integration testing with Jest + SuperTest
* Containerization with Docker & Docker Compose

---

## 🚀 Local Setup and Running

1. Clone the repository and navigate into it:

   ```bash
   git clone https://github.com/arturnfranco/batuta-orders.git
   cd batuta-orders
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and configure:

   ```env
   HOST=localhost
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/orderdb
   REDIS_URL=redis://localhost:6379
   REDIS_TTL_SECONDS=3600
   WAREHOUSE_LIMIT_DAYS=3
   ```

4. Start the server in development mode:

   ```bash
   npm run dev
   ```

5. Access the API at `http://localhost:3000`

---

## 🛠 Available Scripts

* `npm run build` — Transpile TypeScript to `dist/`
* `npm run dev` — Run in watch mode with `ts-node-dev`
* `npm run lint` — Run eslint to identify issues
* `npm run lint:fix` — Run eslint and try to fix issues
* `npm start` — Run the compiled code (`dist/app.js`)
* `npm test` — Execute all tests (unit and integration)
* `npm run test:watch` — Run tests in watch mode

---

## 📄 API Endpoints

### Orders

| Method  | Route                | Description                              |
| ------- | -------------------- | ---------------------------------------- |
| `POST`  | `/orders`            | Create a new order (status → `CREATION`) |
| `GET`   | `/orders`            | List orders with pagination              |
| `PATCH` | `/orders/:id/status` | Update an order's status                 |

**Query Parameters** for `GET /orders`:

* `page` (number) — Page number (default: 1)
* `limit` (number) — Page size (default: 10)
* `status` (string) — Filter by status (`CREATION`, `PREPARATION`, `DISPATCH`, `DELIVERY`)
* `startDate` / `endDate` (YYYY-MM-DD) — Filter by creation date range

### Alerts

| Method | Route     | Description                  |
| ------ | --------- | ---------------------------- |
| `GET`  | `/alerts` | Retrieve current alert cache |

Alerts are generated automatically when:

* Orders in `CREATION` or `PREPARATION` exceed `WAREHOUSE_LIMIT_DAYS` without dispatch
* Orders in `DISPATCH` are not delivered by end of day

---

## 🧪 Testing

1. Run all tests:

   ```bash
   npm test
   ```

2. In watch mode:

   ```bash
   npm run test:watch
   ```

---

## 🐋 Docker

1. Build the Docker image:

   ```bash
   docker-compose build
   ```

2. Start the containers:

   ```bash
   docker-compose up -d
   ```

3. View logs:

   ```bash
   docker-compose logs -f api
   ```

The API will be available at `http://localhost:3000` and MongoDB at `mongodb://mongo:27017/orderdb` and Redis at `redis://localhost:6379`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
