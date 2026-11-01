# 🏗️ SmartBuild – Smart Construction Material Procurement Platform

SmartBuild is a web-based construction material procurement platform designed to simplify the process of discovering, comparing, and sourcing construction materials from suppliers.

The platform aims to bring customers, engineers, suppliers, and administrators together through a centralized system, with planned machine learning capabilities for material recommendations, price prediction, and supplier evaluation.

## ✨ Key Features

### Currently Implemented
- 🏠 **Homepage:** Professional landing page introducing the SmartBuild platform.
- 🧱 **Material Listing:** Browse available construction materials.
- 🔍 **Material Search:** Search and explore construction materials.
- 📋 **Material Details:** View material specifications, indicative pricing, and supplier information.
- 🔢 **Quantity Selection:** Select material quantities and view indicative subtotals.
- 🔐 **Authentication UI:** Login and registration interface.

### Planned Features
- 👤 User registration, login, and role-based access.
- 🛒 Shopping cart and checkout functionality.
- 📦 Order management and delivery tracking.
- 🏢 Supplier management and material listings.
- 📊 Personalized material recommendations.
- 🤖 Machine learning-based price prediction.
- ⭐ Supplier evaluation and comparison.
- 🌱 Sustainable construction material recommendations.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Machine Learning | Python |
| Version Control | Git, GitHub |

## 📁 Project Structure

```text
Smart-Build/
│
├── frontend/       # React frontend application
│
├── backend/        # Node.js and Express backend
│
├── ml/             # Machine learning module
│
├── .gitignore
├── README.md
└── LICENSE
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB Atlas account or a MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/kunalllll18/SmartBuild.git
```

### 2. Navigate to the Project

```bash
cd SmartBuild
```

### 3. Setup the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will start. Open the URL displayed in your terminal.

### 4. Setup the Backend

Open another terminal:

```bash
cd SmartBuild/backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

## 🔮 Future Enhancements

- Machine learning-based construction material recommendations.
- Construction material price forecasting.
- Supplier performance evaluation.
- Personalized project-based material suggestions.
- Real-time order and delivery updates.
- Improved procurement and inventory management.

## 🎯 Project Objective

The main objective of SmartBuild is to make construction material procurement more accessible, efficient, and organized by connecting customers with suppliers and exploring intelligent, data-driven recommendations.

## 👨‍💻 Developer

**Kunal Bachhav**

GitHub: [kunalllll18](https://github.com/kunalllll18)

---

⭐ If you find this project interesting, consider giving the repository a star!

*Note: This project is under active development. Features listed under Planned Features are not yet fully implemented. Material prices displayed in the application are indicative/demo values.*