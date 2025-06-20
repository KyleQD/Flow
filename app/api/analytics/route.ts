import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Event, Booking } from '@prisma/client';

interface EventWithBookings extends Event {
  bookings: Booking[];
}

interface RevenueTrendData {
  date: string;
  revenue: number;
}

interface PopularEvent {
  id: string;
  title: string;
  date: Date;
  capacity: number;
  bookings: number;
  occupancyRate: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7'; // Default to 7 days
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get events within the period
    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      include: {
        bookings: true,
      },
    }) as EventWithBookings[];

    // Calculate total revenue
    const totalRevenue = events.reduce((sum: number, event: EventWithBookings) => {
      return sum + event.bookings.reduce((bookingSum: number, booking: Booking) => {
        return bookingSum + (booking.amount || 0);
      }, 0);
    }, 0);

    // Calculate total bookings
    const totalBookings = events.reduce((sum: number, event: EventWithBookings) => sum + event.bookings.length, 0);

    // Calculate average occupancy
    const totalCapacity = events.reduce((sum: number, event: EventWithBookings) => sum + event.capacity, 0);
    const averageOccupancy = totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0;

    // Prepare revenue trend data
    const revenueTrend: RevenueTrendData[] = events.map(event => ({
      date: event.date.toISOString().split('T')[0],
      revenue: event.bookings.reduce((sum: number, booking: Booking) => sum + (booking.amount || 0), 0),
    }));

    // Calculate booking status distribution
    const bookingStatuses = events.flatMap(event => 
      event.bookings.map(booking => booking.status)
    );
    
    const statusDistribution = bookingStatuses.reduce((acc: Record<string, number>, status: string) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Get popular events
    const popularEvents: PopularEvent[] = events
      .map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        capacity: event.capacity,
        bookings: event.bookings.length,
        occupancyRate: (event.bookings.length / event.capacity) * 100,
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      totalEvents: events.length,
      totalBookings,
      averageOccupancy,
      revenueTrend,
      statusDistribution,
      popularEvents,
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 