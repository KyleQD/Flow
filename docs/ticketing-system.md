# 🎫 Tourify Ticketing System Documentation

## Overview

The Tourify ticketing system provides a comprehensive solution for event ticket management, sales, and distribution. It supports both platform-hosted ticketing and integration with external ticketing platforms.

## 🏗️ Architecture

### Core Components

1. **Database Schema**
   - `ticket_types` - Ticket categories and pricing
   - `ticket_sales` - Purchase records and payment tracking
   - `events` - Event information and capacity

2. **API Endpoints**
   - `/api/ticketing` - Public ticketing operations
   - `/api/admin/ticketing` - Admin management
   - `/api/ticketing/webhook` - Payment webhooks
   - `/api/ticketing/verify` - Purchase verification

3. **Payment Integration**
   - Stripe (Primary)
   - PayPal (Secondary)
   - Webhook handling for real-time updates

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Required environment variables
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Migration

```sql
-- Run the sample data migration
\i supabase/migrations/20250127000000_sample_ticketing_data.sql
```

### 3. Test the System

```bash
# Start the development server
npm run dev

# Visit the admin dashboard
http://localhost:3000/admin/dashboard/ticketing
```

## 📊 API Reference

### Public Ticketing API

#### Get Event Tickets
```http
GET /api/ticketing?action=event_tickets&event_id={event_id}
```

**Response:**
```json
{
  "ticket_types": [
    {
      "id": "uuid",
      "name": "General Admission",
      "description": "Standard access",
      "price": 75.00,
      "quantity_available": 3000,
      "quantity_sold": 2100,
      "available": 900,
      "is_available": true,
      "max_per_customer": 4
    }
  ]
}
```

#### Check Availability
```http
POST /api/ticketing
Content-Type: application/json

{
  "action": "check_availability",
  "ticket_type_id": "uuid",
  "quantity": 2
}
```

#### Purchase Tickets
```http
POST /api/ticketing
Content-Type: application/json

{
  "action": "purchase",
  "ticket_type_id": "uuid",
  "event_id": "uuid",
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "quantity": 2,
  "payment_method": "stripe"
}
```

### Admin Ticketing API

#### Get Analytics
```http
GET /api/admin/ticketing?type=analytics
```

#### Get Ticket Types
```http
GET /api/admin/ticketing?type=ticket_types&event_id={event_id}
```

#### Create Ticket Type
```http
POST /api/admin/ticketing
Content-Type: application/json

{
  "action": "create_ticket_type",
  "event_id": "uuid",
  "name": "VIP Access",
  "description": "Premium seating",
  "price": 150.00,
  "quantity_available": 500,
  "max_per_customer": 2,
  "sale_start": "2024-01-01T00:00:00Z",
  "sale_end": "2024-07-14T23:59:59Z"
}
```

## 🎨 UI Components

### Ticket Purchase Form
```tsx
import { TicketPurchaseForm } from '@/components/ticketing/ticket-purchase-form'

<TicketPurchaseForm
  eventId="event-uuid"
  event={{
    id: "event-uuid",
    title: "Summer Music Festival",
    date: "2024-07-15",
    location: "Central Park"
  }}
  onSuccess={(orderNumber) => console.log('Purchase successful:', orderNumber)}
/>
```

### Admin Dashboard
The admin dashboard provides:
- Real-time sales analytics
- Ticket type management
- Transaction history
- Revenue tracking

## 🔧 Configuration

### Stripe Setup

1. **Create Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Get API keys from dashboard

2. **Configure Webhooks**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/ticketing/webhook
   ```

3. **Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### PayPal Integration

1. **PayPal Business Account**
   - Create account at [paypal.com](https://paypal.com)
   - Get API credentials

2. **Configuration**
   ```env
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=sandbox  # or live
   ```

## 🔌 External Platform Integration

### Eventbrite Integration

```typescript
// Example Eventbrite API integration
const eventbriteAPI = {
  baseURL: 'https://www.eventbriteapi.com/v3',
  token: process.env.EVENTBRITE_TOKEN,
  
  async importEvent(eventbriteEventId: string) {
    const response = await fetch(
      `${this.baseURL}/events/${eventbriteEventId}/`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    )
    return response.json()
  },
  
  async syncTickets(eventbriteEventId: string) {
    const response = await fetch(
      `${this.baseURL}/events/${eventbriteEventId}/ticket_classes/`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    )
    return response.json()
  }
}
```

### Ticketmaster Integration

```typescript
// Example Ticketmaster API integration
const ticketmasterAPI = {
  baseURL: 'https://app.ticketmaster.com/discovery/v2',
  apiKey: process.env.TICKETMASTER_API_KEY,
  
  async searchEvents(keyword: string) {
    const response = await fetch(
      `${this.baseURL}/events.json?keyword=${keyword}&apikey=${this.apiKey}`
    )
    return response.json()
  },
  
  async getEventDetails(eventId: string) {
    const response = await fetch(
      `${this.baseURL}/events/${eventId}?apikey=${this.apiKey}`
    )
    return response.json()
  }
}
```

## 📈 Analytics & Reporting

### Key Metrics

- **Total Tickets Sold**: Real-time count of sold tickets
- **Revenue Generated**: Total revenue from ticket sales
- **Average Ticket Price**: Mean ticket price across all types
- **Conversion Rate**: Percentage of visitors who purchase tickets
- **Refund Rate**: Percentage of tickets refunded

### Custom Reports

```typescript
// Example analytics query
const getSalesAnalytics = async (startDate: string, endDate: string) => {
  const response = await fetch('/api/admin/ticketing?type=analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate })
  })
  return response.json()
}
```

## 🔒 Security & Compliance

### Data Protection

- **PCI Compliance**: Stripe handles all payment data
- **GDPR Compliance**: Customer data encryption and right to deletion
- **Row Level Security**: Database-level access control

### Fraud Prevention

- **Rate Limiting**: API request throttling
- **Duplicate Detection**: Prevent multiple purchases
- **Payment Verification**: Webhook-based confirmation

## 🚨 Troubleshooting

### Common Issues

1. **Payment Processing Fails**
   ```bash
   # Check Stripe webhook logs
   stripe logs tail
   
   # Verify webhook endpoint
   curl -X POST http://localhost:3000/api/ticketing/webhook
   ```

2. **Database Connection Issues**
   ```bash
   # Check Supabase connection
   npx supabase status
   
   # Run migrations
   npx supabase db reset
   ```

3. **Ticket Availability Issues**
   ```sql
   -- Check ticket counts
   SELECT 
     name,
     quantity_available,
     quantity_sold,
     (quantity_available - quantity_sold) as available
   FROM ticket_types
   WHERE event_id = 'your-event-id';
   ```

### Debug Mode

```env
# Enable debug logging
DEBUG=ticketing:*
NODE_ENV=development
```

## 📞 Support

For technical support:
- **Email**: support@tourify.com
- **Documentation**: [docs.tourify.com](https://docs.tourify.com)
- **GitHub Issues**: [github.com/tourify/issues](https://github.com/tourify/issues)

## 🔄 Version History

- **v1.0.0** - Initial release with Stripe integration
- **v1.1.0** - Added PayPal support
- **v1.2.0** - External platform integrations
- **v1.3.0** - Advanced analytics and reporting

---

**Last Updated**: January 27, 2024
**Version**: 1.3.0 