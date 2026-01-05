# Source1 Solutions - Property Management Platform

A comprehensive property management platform that connects property owners with trusted vendors for maintenance services.

## Features

- **User Authentication**: Email/password and social login (Google, Microsoft, Apple)
- **Role-based Access**: Separate dashboards for Clients, Vendors, and Managers
- **Work Order Management**: Create, track, and manage maintenance requests
- **Vendor Applications**: Vendors can apply for work orders with proposals
- **Payment Processing**: Secure payment handling with service fees
- **Real-time Updates**: Live status updates and notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project
- (Optional) OAuth provider accounts for social login

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your Supabase project:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to `.env.local`
   - Run the database schema from `database-schema.sql` in your Supabase SQL editor

5. (Optional) Configure OAuth providers in Supabase:
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable and configure Google, Microsoft, and/or Apple OAuth
   - Add your redirect URLs: `http://localhost:3000/auth/callback`

6. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

The platform uses the following main tables:
- `users` - User profiles and authentication
- `work_orders` - Maintenance requests and job details
- `vendor_applications` - Vendor proposals for work orders
- `payments` - Payment tracking and processing

Run the SQL schema in `database-schema.sql` to set up all required tables and policies.

### OAuth Configuration

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. Add credentials to Supabase dashboard

#### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com)
2. Register a new application
3. Configure redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add credentials to Supabase dashboard

#### Apple OAuth
1. Go to [Apple Developer](https://developer.apple.com)
2. Create a new App ID and Service ID
3. Configure return URLs
4. Add credentials to Supabase dashboard

## User Roles

### Client (Property Owner)
- Submit work orders with photos and descriptions
- Review vendor proposals
- Select vendors for jobs
- Track work progress
- Approve completed work
- Process payments

### Vendor (Service Provider)
- Browse available work orders
- Submit proposals with pricing and timelines
- Upload completion photos and notes
- Receive payments automatically
- Build reputation through completed jobs

### Manager (Platform Administrator)
- Oversee all platform operations
- Manage user accounts and permissions
- Process payments and handle disputes
- Set service fee percentages
- Generate reports and analytics

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, Shadcn/ui
- **Authentication**: Supabase Auth with OAuth
- **Database**: PostgreSQL (Supabase)
- **Icons**: Lucide React

## Development

### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run kill-port` - Kill process on port 3000

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── auth/           # Authentication callbacks
│   └── page.tsx        # Main landing page
├── components/         # React components
│   ├── ui/            # UI components (Shadcn)
│   ├── ClientDashboard.tsx
│   ├── VendorDashboard.tsx
│   └── ManagerDashboard.tsx
├── contexts/          # React contexts
│   └── AuthContext.tsx
└── lib/               # Utilities and configurations
    └── supabase.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software owned by Source1 Solutions.

## Support

For support, email contact@source1.pro or visit our website.