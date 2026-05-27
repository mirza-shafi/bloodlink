# BloodLink - AI-Powered Blood Donor & Patient Connection Platform

A comprehensive full-stack web application built with **Java Spring Boot** (backend) and **React + TypeScript** (frontend) that connects blood donors with patients in need through AI-powered matching.

---

## Features

### Core Features
- **Dual User Roles**: Donor and Patient registration and profiles
- **AI-Powered Donor Matching**: Smart recommendation engine based on blood compatibility, distance, availability, and donation history
- **Real-time Chat**: WebSocket-based messaging between donors and patients
- **Blood Request System**: Full lifecycle management (Pending -> Accepted -> Completed)
- **Advanced Search & Filter**: Search donors by blood group, location, availability
- **Notification System**: Real-time alerts for requests and messages
- **Responsive Design**: Works on desktop, tablet, and mobile

### AI Recommendation Engine
The AI scoring algorithm weighs multiple factors:
- **Distance (30%)**: Closer donors score higher
- **Blood Match (25%)**: Perfect compatibility = 1.0
- **Availability (20%)**: Available now = 1.0
- **Donation History (15%)**: More donations = higher score
- **Last Donation Recency (10%)**: Recent donors score lower (recovery period)

### Security
- JWT Authentication with 24-hour token expiry
- BCrypt password encryption (strength 12)
- Role-based authorization (@PreAuthorize)
- CORS configuration
- Input validation (Jakarta Bean Validation)
- Global exception handling

---

## Technology Stack

### Backend (Java Spring Boot)
| Layer | Technology |
|-------|------------|
| Language | Java 17+ |
| Framework | Spring Boot 3.2.5 |
| ORM | Hibernate / Spring Data JPA |
| Database | MySQL 8.x |
| Security | Spring Security + JWT |
| WebSocket | Spring WebSocket (STOMP) |
| Build Tool | Maven |

### Frontend (React)
| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Routing | React Router v7 |

---

## Project Structure

```
bloodlink/
├── backend/                     # Java Spring Boot Backend
│   ├── pom.xml                  # Maven configuration
│   └── src/
│       ├── main/
│       │   ├── java/com/bloodlink/
│       │   │   ├── BloodLinkApplication.java
│       │   │   ├── config/      # Security, WebSocket, Web configs
│       │   │   ├── controller/  # REST API controllers
│       │   │   ├── dto/         # Data Transfer Objects
│       │   │   ├── entity/      # JPA Entities (OOP)
│       │   │   ├── enums/       # Enumerations
│       │   │   ├── exception/   # Exception handling
│       │   │   ├── repository/  # JPA Repositories
│       │   │   ├── security/    # JWT, UserPrincipal
│       │   │   ├── service/     # Business logic (interfaces + impl)
│       │   │   ├── ai/          # AI Recommendation Engine
│       │   │   ├── util/        # Utilities
│       │   │   └── websocket/   # WebSocket handlers
│       │   └── resources/
│       │       ├── application.properties
│       │       └── schema.sql   # Database schema + sample data
│       └── test/
│
└── client/                      # React Frontend (deployed)
    ├── src/
    │   ├── pages/               # Page components
    │   ├── components/          # Shared components
    │   ├── hooks/               # Custom hooks (useAuth)
    │   ├── services/            # API service layer
    │   └── types/               # TypeScript types
    └── dist/                    # Production build
```

---

## OOP Principles Demonstrated

| Principle | Implementation |
|-----------|---------------|
| **Encapsulation** | All entity fields are `private`, accessed via getters/setters |
| **Inheritance** | `AbstractUser` base class with `Donor` and `Patient` subclasses |
| **Polymorphism** | Service interfaces (`IUserService`, `IDonorService`) with multiple implementations |
| **Abstraction** | Abstract `AbstractUser` class, service interfaces define contracts |
| **SOLID** | Single Responsibility per class, Dependency Injection throughout |

---

## How to Run

### Prerequisites
- **Docker Desktop** (running on Mac, Windows, or Linux)
- **Node.js 20+** and **npm** (for building the client assets locally)
- **Java 17+** / **Maven 3.8+** (optional, only if you want to run the backend locally without Docker)

---

### Method 1: Running the Application in Docker (Recommended)

To avoid network timeouts and NPM registry proxy blocks inside containerized build environments, the frontend Docker setup is optimized to copy pre-built assets from the host. Therefore, **you must build the client assets on your host machine first**.

#### Step 1: Build the Client Locally (Host Machine)
Open your terminal (macOS/Linux) or PowerShell/CMD (Windows) and run:
```bash
# Navigate to the client directory
cd client

# Install dependencies and compile the production build
npm install
npm run build
```
*(This creates the static production bundle in `client/dist` in ~5 seconds).*

#### Step 2: Spin Up Containers
You can now run the services in Docker. Choose one of the options below:

##### Option A: Run the Full Stack (DB + Backend + Client)
From the **root directory** of the project, run:
```bash
# macOS / Linux
docker compose up --build -d

# Windows (PowerShell / CMD)
docker compose up --build -d
```
This builds and starts:
- **MySQL Database**: Exposed on port `3306`
- **Backend (Spring Boot)**: Exposed on `http://localhost:8080`
- **Client (Nginx served)**: Exposed on `http://localhost:3000`

##### Option B: Run the Client Standalone
If your DB and Backend are already running or if you just want to run the frontend client, navigate to the `client` directory and run:
```bash
cd client
docker compose up --build -d
```
The client will be active at `http://localhost:3000`.

#### Stopping the Containers
To stop and remove the containers (without deleting your database records):
```bash
docker compose down
```
To reset everything and wipe the database volumes:
```bash
docker compose down -v
```

---

### Method 2: Running Locally (Without Docker / Development Mode)

#### 1. Backend Setup
1. Start your local **MySQL server** and create the database:
   ```sql
   CREATE DATABASE bloodlink;
   ```
2. Build and start the Spring Boot application:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

#### 2. Frontend Setup (Hot Reloading)
1. Install and start the Vite dev server:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The frontend development server will start locally on `http://localhost:3000` (or fallback to `3001` if port 3000 is occupied) with hot-reloading active.



### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@bloodlink.com` | `password` |
| Donor | `john.donor@email.com` | `password` |
| Patient | `alice.need@email.com` | `password` |

> [!TIP]
> **Configurable Admin Credentials:** You can dynamically change the admin username (email) and password by modifying the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables inside the root `docker-compose.yml` file.

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user

### Donors
- `GET /api/donors` - List all donors
- `POST /api/donors/search` - Search with filters
- `GET /api/donors/{id}` - Get donor profile
- `PUT /api/donors/{id}/availability` - Update availability

### Blood Requests
- `POST /api/requests` - Create request
- `PUT /api/requests/{id}/accept` - Accept request
- `PUT /api/requests/{id}/decline` - Decline request
- `PUT /api/requests/{id}/complete` - Complete request

### Chat (WebSocket)
- `/ws` - WebSocket endpoint
- `/app/chat.send` - Send message
- `/topic/chat/{chatId}` - Subscribe to chat room

### AI Recommendations
- `GET /api/ai/recommend/{patientId}` - Get AI-recommended donors

---

## Database Schema

The application uses a Single Table Inheritance (STI) strategy:
- **users** table stores both donors and patients with a `dtype` discriminator
- **blood_requests** links patients to donors
- **chats** and **messages** for real-time communication
- **notifications** for system alerts

See `backend/src/main/resources/schema.sql` for the complete schema.

---

## Deployment

The frontend is deployed at: **https://htm5djvthydmg.kimi.page**

---

## License

This project is built for educational purposes demonstrating Java OOP principles, Spring Boot, and React development.
