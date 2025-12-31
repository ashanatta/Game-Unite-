# Game-Unite - Full-Stack Web Application

A comprehensive MERN stack web application featuring authentication, e-commerce functionality, messaging system, blogging platform, and payment integration with Stripe.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - Secure user registration, login, and profile management
- **E-commerce Platform** - Product catalog, shopping cart, and order management
- **Messaging System** - Real-time conversations between users
- **Blog Platform** - Create, read, and manage blog posts with rich text editor
- **Payment Integration** - Stripe payment processing for orders
- **Contact System** - User contact form and communication
- **File Upload** - Cloudinary integration for image storage
- **Email Notifications** - Nodemailer for transactional emails

### Technical Features
- **RESTful API** - Well-structured backend API with Express.js
- **State Management** - Redux Toolkit for frontend state management
- **Database** - MongoDB with Mongoose ODM
- **Security** - JWT authentication, bcrypt password hashing, CORS protection
- **Modern UI** - React with Bootstrap 5, responsive design
- **Development Tools** - Hot reload with Vite, concurrent development server

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing
- **Cloudinary** - Cloud image storage
- **Nodemailer** - Email sending
- **Multer** - File upload handling

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Bootstrap 5** - CSS framework
- **React Bootstrap** - React components for Bootstrap
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Jodit React** - Rich text editor
- **Web3.js** - Blockchain integration

## 📁 Project Structure

```
Game-Unite/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── data/            # Seed data
│   ├── seeder.js        # Database seeder
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── Pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── slices/      # Redux slices
│   │   ├── assets/      # Static assets
│   │   └── utils/       # Utility functions
│   └── public/          # Public files
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
└── package.json        # Root package configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Game-Unite
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add the following environment variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLIC_KEY=your_stripe_public_key
   
   # Email (optional)
   EMAIL_HOST=your_email_host
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   
   # Cloudinary (optional)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Database Setup**
   ```bash
   # Import seed data (optional)
   npm run data:import
   
   # Destroy seed data (if needed)
   npm run data:destroy
   ```

### Running the Application

1. **Development Mode** (Recommended for development)
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and frontend dev server (port 5173) concurrently.

2. **Production Mode**
   ```bash
   # Start backend server only
   npm start
   
   # Or start backend with nodemon
   npm run server
   
   # Start frontend separately
   npm run client
   ```

## 📊 Available Scripts

### Root Scripts
- `npm start` - Start production server
- `npm run server` - Start backend with nodemon
- `npm run client` - Start frontend dev server
- `npm run dev` - Run both backend and frontend concurrently
- `npm run data:import` - Import seed data to database
- `npm run data:destroy` - Clear all data from database

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/pay` - Update order payment status

### Messages
- `GET /api/messages` - Get user conversations
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

## 🎯 Key Features in Detail

### Authentication System
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes with middleware
- User profile management

### E-commerce Features
- Product catalog with categories
- Shopping cart functionality
- Order management system
- Stripe payment integration
- Order status tracking

### Messaging System
- Real-time messaging between users
- Conversation management
- Read/unread message status
- Message timestamps

### Blog Platform
- Rich text editor with Jodit
- Blog creation and editing
- Content sanitization with DOMPurify
- Blog categorization

### File Management
- Cloudinary integration for image uploads
- Multer for file handling
- Image optimization and transformation

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Environment variable protection
- Secure file upload handling

## 🌐 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application
3. Deploy to hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the dist folder to static hosting (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author

Originally created by Brad Traversy as a MERN authentication system, extended with additional features.

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a full-stack application that requires proper environment setup and configuration to run correctly. Make sure to set up all environment variables and database connections before running the application.
