# IPL Fantasy Application

A Next.js application for managing IPL fantasy teams and matches.

## Features

- View today's IPL matches
- User account system (simple username-based authentication)
- Upload and save Excel files with team data
- Persistent storage of team data in a database
- Display team data in tabbed interfaces
- Leaderboard tracking (coming soon)
- Team management (coming soon)

## User Management

The application provides a simple username-based authentication system:

1. Enter your username to log in or create a new account
2. Your username is stored in localStorage for persistent login across sessions
3. All team data you upload is associated with your user account
4. When you log in again, your previously uploaded teams are automatically loaded

## Excel Import Feature

The application allows you to upload Excel files containing team data. Each sheet in the Excel file represents a different team, and each row represents a player. Your uploaded data is saved to the database and persists between sessions.

### Excel Format Requirements

1. **Sheets**: Create a separate sheet for each team
2. **Sheet Names**: Name each sheet with the team name (e.g., "Mumbai Indians", "Chennai Super Kings")
3. **Headers**: First row should contain column headers (e.g., "Name", "Role", "Stats")
4. **Data**: Each subsequent row should contain player information

Example Excel structure:

Sheet 1: "Mumbai Indians"
| Name | Role | Batting | Bowling |
|------|------|---------|---------|
| Rohit Sharma | Batsman | 9 | 2 |
| Jasprit Bumrah | Bowler | 3 | 9 |

Sheet 2: "Chennai Super Kings"
| Name | Role | Batting | Bowling |
|------|------|---------|---------|
| MS Dhoni | Batsman | 8 | 3 |
| Ravindra Jadeja | All-rounder | 7 | 8 |

## Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/src/app`: Next.js App Router application
- `/src/app/components`: Shared React components
- `/src/app/pages`: Application pages/routes
- `/src/app/api`: API routes for user management and data storage
- `/backend`: Server-side functionality
- `/prisma`: Database schema and migrations
- `/public`: Static assets

## Database Structure

The application uses a SQLite database (for easy local development) with the following models:

### User
- `id`: Unique identifier
- `username`: Unique username
- `createdAt`: Timestamp when created
- `updatedAt`: Timestamp when last updated

### Team
- `id`: Unique identifier
- `name`: Team name (e.g., "Mumbai Indians")
- `userId`: Owner of the team
- `createdAt`: Timestamp when created
- `updatedAt`: Timestamp when last updated

### Player
- `id`: Unique identifier
- `teamId`: Associated team
- `data`: JSON field containing all player attributes
- `createdAt`: Timestamp when created
- `updatedAt`: Timestamp when last updated

## Technologies Used

- Next.js 15
- React 19
- Tailwind CSS
- Prisma ORM
- SQLite (local development)
- xlsx (for Excel file parsing)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
