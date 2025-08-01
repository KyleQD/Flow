"use client"

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function TicketCancelPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order_number')

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-white text-2xl">Purchase Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-slate-400">
                Your ticket purchase was cancelled. No charges have been made to your account.
              </p>
              {orderNumber && (
                <p className="text-slate-500 text-sm">
                  Order: <span className="font-mono">{orderNumber}</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-semibold">What happened?</h3>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• You cancelled the payment process</li>
                <li>• Your payment information was not processed</li>
                <li>• No tickets were reserved</li>
                <li>• You can try again at any time</li>
              </ul>
            </div>

            <div className="space-y-3 pt-4">
              <Link href="/">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-700"
                onClick={() => window.history.back()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-sm">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@tourify.com" className="text-purple-400 hover:underline">
                  support@tourify.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 