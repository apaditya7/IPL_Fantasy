import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// Login or create a user
export async function POST(request) {
  try {
    const { username } = await request.json();
    
    if (!username || username.trim() === '') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { username },
    });
    
    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: { username },
      });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Get all users (for debugging only)
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}