import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: {
        startDate: true,
        endDate: true,
        location: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    if (!event.location) {
      return NextResponse.json(
        { error: "Event location not set" },
        { status: 400 }
      )
    }

    // In a real implementation, you would call a weather API here
    // For example, using OpenWeatherMap API:
    // const weatherApiKey = process.env.WEATHER_API_KEY
    // const response = await fetch(
    //   `https://api.openweathermap.org/data/2.5/forecast?q=${event.location}&appid=${weatherApiKey}&units=metric`
    // )
    // const weatherData = await response.json()

    // For now, we'll return mock data
    const mockWeatherData = {
      location: event.location,
      forecast: [
        {
          date: event.startDate,
          temperature: 22,
          condition: "Sunny",
          icon: "☀️",
          windSpeed: 5,
          humidity: 60,
        },
        {
          date: event.endDate,
          temperature: 20,
          condition: "Partly Cloudy",
          icon: "⛅",
          windSpeed: 4,
          humidity: 65,
        },
      ],
    }

    return NextResponse.json(mockWeatherData)
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    )
  }
} 