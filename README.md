# Sri Lakshmi Ganapathi Photo Frames

> A modern full-stack web application for **Sri Lakshmi Ganapathi Photo Frames**, digitizing a traditional family-owned business with a responsive customer storefront and an AI-powered admin dashboard.

---

**📖 Overview**

Sri Lakshmi Ganapathi Photo Frames is a digital transformation project built for a devotional photo frame business established in **1985**. The application modernizes the traditional catalog system by providing customers with an elegant online browsing experience while enabling administrators to efficiently manage inventory, images, and product information.

The platform focuses on performance, scalability, and ease of management through a modern full-stack architecture.

---

**✨ Features**

**Customer**

* Browse products by category
* Search and filter products
* Product detail pages
* Wishlist
* WhatsApp enquiry integration
* Responsive design
* Google Maps location

**Admin**

* Secure authentication
* Product & Category management
* Dashboard analytics
* AI-generated product descriptions
* Cloudinary image uploads
* SEO management

---

**🛠 Tech Stack**

| Layer          | Technologies                                              |
| -------------- | --------------------------------------------------------- |
| Frontend       | React • TypeScript • Vite • Tailwind CSS • TanStack Query |
| Backend        | Node.js • Express • TypeScript                            |
| Database       | PostgreSQL (Neon)                                         |
| ORM            | Drizzle ORM                                               |
| Media Storage  | Cloudinary                                                |
| Authentication | JWT                                                       |
| AI             | Google Gemini                                             |
| Deployment     | Vercel • Render                                           |

---

**🏗 Architecture**

```text
Customer / Admin
        │
        ▼
 React + Vite Frontend
        │
      REST API
        │
 Express Backend
        │
 ├── PostgreSQL (Neon)
 ├── Cloudinary
 └── Gemini AI
```

---

**📂 Project Structure**

```text
src/            Frontend
server/         Backend
drizzle/        Database schema & migrations
public/         Static assets
```

---

## 🚀 Getting Started

**Prerequisites**

* Node.js 18+
* npm
* Neon PostgreSQL
* Cloudinary Account
* Gemini API Key

**Clone Repository**

```bash
git clone <repository-url>
cd SLGPhotoFrames
```

**Install Dependencies**

```bash
npm install
```

**Configure Environment Variables**

Create a `.env` file.

```env
DATABASE_URL=
JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GEMINI_API_KEY=
```

**Setup Database**

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

**Run Development Server**

```bash
npm run dev:all
```

---

**📜 Available Scripts**

| Command               | Description              |
| --------------------- | ------------------------ |
| `npm run dev`         | Start frontend           |
| `npm run dev:backend` | Start backend            |
| `npm run dev:all`     | Start frontend & backend |
| `npm run build`       | Production build         |
| `npm run db:generate` | Generate migrations      |
| `npm run db:migrate`  | Run migrations           |
| `npm run db:seed`     | Seed database            |

---

**🚀 Future Improvements**

* Online ordering
* Payment integration
* Customer reviews
* Multi-language support
* Order tracking
* Analytics dashboard
* Role-based access control

---

**📄 License**

MIT License.
