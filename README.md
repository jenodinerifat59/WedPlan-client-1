# WedPlan – Wedding Planning Platform

WedPlan is a modern wedding planning platform designed to make wedding management easier and more organized. Customers can explore wedding services, connect with vendors, and manage their bookings from one place.

## 🌐 Live Project

- **Live Website:** https://wed-plan-client-1.vercel.app
- **Backend API:** https://wedplan-server-1.vercel.app
- **GitHub Repository:** https://github.com/jenodinerifat59/WedPlan-client-1

## ✨ Key Features

- **User Authentication:** Secure registration and login using Email/Password and Google authentication with Better Auth.
- **Role-Based Dashboard:** Separate dashboards for Admin, Vendor, and Customer.
- **Service Management:** Vendors can create, update, and manage their wedding services.
- **Service Discovery:** Customers can browse, search, and explore available wedding services.
- **Booking System:** Customers can book services and manage their booking requests.
- **Booking Management:** Vendors can view and manage incoming booking requests.
- **Admin Dashboard:** Admin can manage users, vendors, services, and platform activities.
- **Image Upload:** Upload and manage service and profile images using ImageBB.
- **Subscription System:** Supports vendor subscription plans and payment integration.
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices.
- **Protected Routes:** Authentication and role-based route protection using Next.js Proxy.

## 🛠️ Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth
- Lucide React
- ImageBB API
- Stripe
- REST API

## 📦 Dependencies

Install the project dependencies:

```bash
npm install
```

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key

BETTER_AUTH_SECRET=your_better_auth_secret
MONGODB_URI=your_mongodb_connection_string
DB_NAME=wedplan

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Use the environment variables actually required by your frontend and server deployment. Never expose private secrets through `NEXT_PUBLIC_` variables.

## 🚀 Run Locally

1. Clone the repository:

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
```

2. Navigate to the project directory:

```bash
cd wedplan-client
```

3. Install dependencies:

```bash
npm install
```

4. Configure the `.env.local` file.

5. Start the development server:

```bash
npm run dev
```

6. Open:

```text
http://localhost:3000
```

## 👥 User Roles

| Role | Access |
|---|---|
| Admin | Platform and user management |
| Vendor | Service and booking management |
| Customer | Service browsing and booking |

## 📁 Project Structure

```text
wedplan-client/
├── app/
│   ├── admin/
│   ├── vendor/
│   ├── customer/
│   ├── services/
│   ├── booking/
│   ├── login/
│   └── register/
├── components/
├── lib/
├── public/
├── proxy.ts
├── package.json
└── README.md
```

## 🔐 Security

- Better Auth authentication.
- Role-based dashboard access.
- Protected routes using Next.js Proxy.
- Authenticated API requests using JWT.
- Environment-based configuration.

## 👨‍💻 Developer

**MD. Jenodine Islam Rifat**

Frontend Developer | React.js | Next.js | TypeScript

