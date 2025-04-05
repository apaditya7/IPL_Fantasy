import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// Upload teams for a user
export async function POST(request) {
  try {
    const { userId, teams } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (!teams || !Object.keys(teams).length) {
      return NextResponse.json(
        { error: 'No teams provided' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Start a transaction to handle all database operations
    const result = await prisma.$transaction(async (tx) => {
      // Delete all existing teams and players for this user
      // This is a simple approach - in production you might want to be more selective
      await tx.team.deleteMany({
        where: { userId }
      });
      
      // Create each team with its players
      const createdTeams = [];
      
      for (const [teamName, playersData] of Object.entries(teams)) {
        // Create the team
        const team = await tx.team.create({
          data: {
            name: teamName,
            userId,
          },
        });
        
        // Create the players for this team
        const players = await Promise.all(
          playersData.map(playerData => 
            tx.player.create({
              data: {
                teamId: team.id,
                data: playerData,
              },
            })
          )
        );
        
        createdTeams.push({
          ...team,
          players,
        });
      }
      
      return createdTeams;
    });
    
    return NextResponse.json({ teams: result });
  } catch (error) {
    console.error('Error in teams API:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Get teams for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch all teams for the user with their players
    const teams = await prisma.team.findMany({
      where: { userId },
      include: {
        players: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    // Format the data to match the expected structure in the frontend
    const formattedTeams = {};
    
    teams.forEach(team => {
      formattedTeams[team.name] = team.players.map(player => player.data);
    });
    
    return NextResponse.json({ teams: formattedTeams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}