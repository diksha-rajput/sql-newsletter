# SQL Newsletter Platform

A full-stack newsletter subscription platform for SQL interview preparation with free and paid user management, automated content scraping, email sending, and analytics.

## Features

### Frontend (React)
- 🎨 Modern, responsive UI with Tailwind CSS
- 📱 Mobile-friendly design with smooth animations
- 🔐 Admin dashboard with real-time analytics
- ✉️ Beautiful subscription forms with preferences
- 📊 Data visualization for engagement metrics

### Backend (Node.js/Express)
- 🗄️ MongoDB database with Mongoose ODM
- 📧 Email sending via Gmail SMTP (Nodemailer)
- 🕷️ Web scraping for SQL interview content
- 🔒 JWT authentication and security middleware
- 📈 Analytics tracking and reporting

### Features
- **Free & Paid Subscriptions**: Manage different user tiers
- **Automated Content**: Daily scraping of SQL interview questions
- **Email Analytics**: Track opens, clicks, and engagement
- **Admin Dashboard**: Comprehensive management interface
- **Responsive Design**: Works perfectly on all devices
- **Scheduled Jobs**: GitHub Actions for automated tasks

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Email**: Nodemailer with Gmail SMTP
- **Scraping**: Cheerio, Axios
- **Deployment**: Vercel (Frontend + Serverless Functions)
- **Database**: MongoDB Atlas (Free Tier)
- **CI/CD**: GitHub Actions

## Setup Instructions

### 1. MongoDB Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster (M0 Sandbox)
3. Create a database user and get connection string
4. Whitelist your IP address (or 0.0.0.0/0 for testing)

### 2. Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. Use this app password (not your regular password)

### 3. Environment Variables
Create `.env` file in root directory:
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/newsletter

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Email Configuration  
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_SECRET=admin123

# Application
PORT=3001
NODE_ENV=development
```

### 4. Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

### 5. Development

```bash
# Start backend server (from root)
npm run dev

# Start frontend (from client folder)
cd client && npm start

# Or run both concurrently
npm run dev & npm run client
```

### 6. GitHub Secrets (for deployment)
Add these secrets to your GitHub repository:
- `MONGODB_URI`: Your MongoDB connection string
- `GMAIL_USER`: Your Gmail address
- `GMAIL_APP_PASSWORD`: Gmail app password
- `ADMIN_SECRET`: Admin authentication secret
- `APP_URL`: Your deployed app URL

### 7. Vercel Deployment

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Project Structure

```
sql-newsletter-platform/
├── api/                    # Serverless API functions
│   ├── index.js           # Main API entry
│   ├── subscribe.js       # Subscription endpoints
│   ├── admin.js           # Admin endpoints
│   ├── scrape.js          # Scraping endpoints
│   └── analytics.js       # Analytics endpoints
├── client/                # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── styles/        # CSS files
│       └── utils/         # Utilities
├── src/                   # Backend source
│   ├── config/           # Database and email config
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── services/         # Business logic
│   └── middleware/       # Express middleware
├── .github/workflows/     # GitHub Actions
└── package.json
```

## Database Schema

### Users Collection
- Email, name, subscription type (free/paid)
- Preferences (frequency, topics)
- Subscription dates and status

### Subscriptions Collection  
- User reference, plan details
- Payment information and status
- Start/end dates

### Newsletters Collection
- Title, content, HTML content
- Target audience, category, status
- Analytics data (opens, clicks)

### Analytics Collection
- User and newsletter references
- Event tracking (opens, clicks, bounces)
- Timestamps and metadata

## Admin Features

- **Dashboard**: Real-time stats and metrics
- **User Management**: View and manage subscribers
- **Newsletter Creation**: Rich text editor for content
- **Content Scraping**: Automated SQL tip generation  
- **Email Campaigns**: Send targeted newsletters
- **Analytics**: Detailed engagement reporting

## API Endpoints

### Public Endpoints
- `POST /api/subscribe` - Subscribe to newsletter
- `POST /api/subscribe/unsubscribe` - Unsubscribe
- `GET /api/subscribe/status/:email` - Check subscription
- `GET /api/analytics/track/open/:newsletterId/:userId` - Track opens

### Admin Endpoints (Protected)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List subscribers
- `POST /api/admin/newsletter` - Create newsletter
- `POST /api/admin/newsletter/:id/send` - Send newsletter
- `GET /api/admin/newsletters` - List newsletters

### Scraping Endpoints
- `POST /api/scrape/sql-content` - Scrape SQL content
- `POST /api/scrape/manual-content` - Generate manual content

## GitHub Actions

### Daily Scraping (`daily-scraping.yml`)
- Runs daily at 9 AM UTC
- Scrapes SQL content from educational sites
- Creates draft newsletters automatically

### Weekly Newsletter (`email-newsletter.yml`)  
- Runs weekly on Mondays at 10 AM UTC
- Sends latest newsletter to subscribers
- Updates analytics and metrics

## Security Features

- Rate limiting on API endpoints
- CORS protection
- Helmet security headers  
- Input validation and sanitization
- Environment variable protection
- Admin authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email admin@sqlnewsletter.com or open an issue on GitHub.

---

Built with ❤️ for SQL learners everywhere!
