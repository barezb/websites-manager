# Web Management Application

## Features
- Website Management
- Client Tracking
- Domain & Hosting Renewal Tracking
- Simple Authentication
- Health Status Monitoring

## Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm or yarn

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://your-repo-url.git
cd web-management-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following:
```
DATABASE_URL="postgresql://username:password@localhost:5432/web_management_db"
NEXTAUTH_SECRET="your_nextauth_secret"
```

### 4. Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 5. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

## Deployment
### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy

### VPS Deployment
1. Build the application
```bash
npm run build
```
2. Start the production server
```bash
npm start
```

## Technologies
- Next.js 14
- React
- Prisma
- PostgreSQL
- Tailwind CSS
- bcrypt for authentication

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
Distributed under the MIT License.