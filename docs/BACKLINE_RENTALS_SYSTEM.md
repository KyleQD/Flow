# 🎸 Backline & Rentals System

## 📋 Overview

The Backline & Rentals System is a comprehensive solution for managing music equipment inventory, rental agreements, and client relationships. This system extends the existing logistics management platform with specialized functionality for the music industry.

## 🏗️ Architecture

### **Database Schema**

The system consists of 6 new tables and 2 views:

#### **Core Tables**
1. **`rental_clients`** - Client management and contact information
2. **`rental_agreements`** - Main rental contracts and terms
3. **`rental_agreement_items`** - Individual equipment items in each rental
4. **`rental_payments`** - Payment tracking and processing
5. **`equipment_damage_reports`** - Damage assessment and repair tracking
6. **`rental_insurance_policies`** - Insurance coverage management

#### **Enhanced Equipment Table**
- Added rental-specific columns to existing `equipment` table:
  - `rental_rate` - Daily rental price
  - `is_rentable` - Whether equipment can be rented
  - `rental_category` - Equipment category for rentals
  - `brand`, `model`, `year_manufactured` - Equipment details
  - `insurance_value`, `replacement_cost` - Financial tracking
  - `rental_terms`, `rental_history` - JSON fields for flexible data

#### **Analytics Views**
1. **`rental_analytics`** - Monthly/quarterly/yearly rental metrics
2. **`equipment_utilization`** - Equipment usage and revenue statistics

### **API Endpoints**

#### **Main Rental API** (`/api/admin/rentals`)
- **GET** - Fetch rental data (clients, agreements, analytics, utilization)
- **POST** - Create new clients and rental agreements
- **PUT** - Update existing clients and agreements
- **DELETE** - Remove clients and agreements

#### **Parameters**
- `type` - Data type: `clients`, `agreements`, `analytics`, `utilization`
- `status` - Filter by status
- `client_id` - Filter by specific client
- `limit`/`offset` - Pagination

### **React Hooks**

#### **Main Hook** (`useRentals`)
```typescript
const {
  clients, agreements, analytics, utilization,
  loading, error,
  createClient, updateClient, deleteClient,
  createAgreement, updateAgreement, deleteAgreement
} = useRentals({
  type: 'agreements',
  status: 'active',
  autoRefresh: true
})
```

#### **Specialized Hooks**
- `useRentalClients()` - Client management
- `useRentalAgreements()` - Agreement management
- `useRentalAnalytics()` - Analytics data
- `useEquipmentUtilization()` - Equipment utilization

## 🚀 Features

### **1. Client Management**
- **Contact Information** - Name, email, phone, company
- **Address Details** - Full address with city, state, postal code
- **Financial Settings** - Credit limits, payment terms
- **Status Tracking** - Active, inactive, suspended
- **Notes & History** - Client-specific notes and interactions

### **2. Rental Agreements**
- **Agreement Numbers** - Auto-generated unique identifiers
- **Date Management** - Start/end dates, pickup/return times
- **Financial Tracking** - Subtotal, tax, deposit, total amounts
- **Status Workflow** - Draft → Confirmed → Active → Completed
- **Payment Status** - Pending → Partial → Paid → Overdue
- **Terms & Conditions** - Customizable rental terms
- **Insurance Requirements** - Optional insurance coverage
- **Delivery/Pickup** - Address and instruction management

### **3. Equipment Management**
- **Rental Categories** - Guitar, Drums, Piano, Microphone, etc.
- **Condition Tracking** - Excellent, Good, Fair, Poor, Damaged
- **Availability Status** - Available, Currently Rented, Maintenance
- **Financial Tracking** - Purchase price, current value, rental rates
- **Maintenance Schedule** - Last/next maintenance dates
- **Insurance Values** - Coverage amounts and replacement costs

### **4. Payment Processing**
- **Payment Types** - Deposit, Partial, Final, Refund, Damage Deposit
- **Payment Methods** - Cash, Check, Credit Card, Bank Transfer, PayPal
- **Transaction Tracking** - Payment dates, transaction IDs
- **Status Management** - Pending, Completed, Failed, Refunded

### **5. Damage Reports**
- **Damage Assessment** - Minor, Moderate, Severe, Total Loss
- **Cost Tracking** - Estimated vs actual repair costs
- **Insurance Claims** - Claim filing and processing
- **Responsibility** - Client, Company, Insurance, Shared liability
- **Photo Documentation** - Damage photos and evidence

### **6. Analytics & Reporting**
- **Revenue Tracking** - Monthly, quarterly, yearly revenue
- **Utilization Rates** - Equipment usage percentages
- **Client Metrics** - Unique clients, repeat business
- **Damage Statistics** - Damage frequency and costs
- **Payment Analytics** - Payment trends and overdue amounts

## 🎯 UI Components

### **Logistics Dashboard Integration**
The backline and rentals system is fully integrated into the logistics management dashboard with:

#### **Overview Tab**
- **Rentals Status Card** - Shows active rentals, revenue, and utilization
- **Real-time Metrics** - Live data from the database
- **Quick Actions** - Add new rentals, manage clients

#### **Backline & Rentals Tab**
- **Backline Inventory Table** - Equipment list with rental status
- **Active Rentals Section** - Current rental agreements
- **Analytics Cards** - Revenue, active rentals, utilization rate

### **Component Library**
- `BacklineRow` - Equipment inventory row component
- `RentalCard` - Rental agreement display card
- `LogisticsStatusCard` - Status overview card (enhanced for rentals)

## 🔧 Setup Instructions

### **1. Database Migration**
```sql
-- Run the migration in Supabase SQL Editor
-- File: supabase/migrations/20250131000000_backline_rentals_system.sql
```

### **2. API Integration**
The rental API endpoints are automatically available at:
- `GET /api/admin/rentals` - Fetch rental data
- `POST /api/admin/rentals` - Create rentals/clients
- `PUT /api/admin/rentals` - Update rentals/clients
- `DELETE /api/admin/rentals` - Delete rentals/clients

### **3. Frontend Integration**
```typescript
// Import the rental hooks
import { useRentals, useRentalAgreements } from '@/hooks/use-rentals'

// Use in components
const { agreements, loading, createAgreement } = useRentalAgreements({
  status: 'active'
})
```

### **4. Sample Data**
The migration includes sample data for testing:
- 4 sample rental clients
- 3 sample rental agreements
- Equipment marked as rentable with rates

## 🛡️ Security Features

### **Row Level Security (RLS)**
All rental tables have comprehensive RLS policies:
- **View Access** - All authenticated users can view rental data
- **Admin Management** - Only admin users can create/update/delete
- **Client Isolation** - Users can only access their own data

### **Authentication**
- **API Protection** - All endpoints require authentication
- **Admin Permissions** - CRUD operations require admin access
- **Session Validation** - Proper session handling and validation

## 📊 Analytics & Insights

### **Key Metrics**
- **Total Revenue** - Monthly rental income
- **Active Rentals** - Currently rented equipment count
- **Utilization Rate** - Percentage of equipment in use
- **Client Retention** - Repeat client percentage
- **Damage Frequency** - Equipment damage incidents

### **Reports Available**
- **Monthly Revenue Reports** - Financial performance
- **Equipment Utilization** - Usage patterns and efficiency
- **Client Activity** - Client engagement and history
- **Damage Analysis** - Risk assessment and prevention

## 🔄 Workflow Examples

### **New Rental Process**
1. **Create Client** - Add new client information
2. **Create Agreement** - Set up rental terms and dates
3. **Add Equipment** - Select equipment items and quantities
4. **Process Payment** - Handle deposit and payment
5. **Track Status** - Monitor pickup, usage, and return
6. **Complete Rental** - Process return and final payment

### **Damage Handling**
1. **Report Damage** - Document damage upon return
2. **Assess Cost** - Estimate repair or replacement cost
3. **Determine Liability** - Assign responsibility (client/company/insurance)
4. **Process Claim** - File insurance claim if applicable
5. **Track Resolution** - Monitor repair/replacement progress

## 🚀 Future Enhancements

### **Planned Features**
- **Online Booking Portal** - Client self-service rental booking
- **Inventory Management** - Advanced stock tracking and alerts
- **Automated Billing** - Recurring payment processing
- **Mobile App** - Field management and check-in/out
- **Integration APIs** - Connect with accounting and CRM systems

### **Advanced Analytics**
- **Predictive Analytics** - Equipment demand forecasting
- **Revenue Optimization** - Dynamic pricing recommendations
- **Risk Assessment** - Client credit and damage risk scoring
- **Performance Dashboards** - Executive-level reporting

## 📝 API Reference

### **Create Rental Agreement**
```typescript
POST /api/admin/rentals
{
  "action": "create_agreement",
  "client_id": "uuid",
  "start_date": "2024-08-10T00:00:00Z",
  "end_date": "2024-08-17T00:00:00Z",
  "items": [
    {
      "equipment_id": "uuid",
      "quantity": 1,
      "daily_rate": 75,
      "notes": "Optional notes"
    }
  ]
}
```

### **Fetch Rental Analytics**
```typescript
GET /api/admin/rentals?type=analytics
```

### **Update Rental Status**
```typescript
PUT /api/admin/rentals
{
  "id": "uuid",
  "type": "agreement",
  "status": "active",
  "payment_status": "paid"
}
```

## 🎯 Best Practices

### **Data Management**
- **Regular Backups** - Schedule automated database backups
- **Data Validation** - Use Zod schemas for all API inputs
- **Error Handling** - Comprehensive error logging and user feedback
- **Performance** - Index optimization for large datasets

### **User Experience**
- **Loading States** - Show loading indicators for all async operations
- **Error Messages** - Clear, actionable error messages
- **Real-time Updates** - Auto-refresh data for live status
- **Responsive Design** - Mobile-friendly interface

### **Security**
- **Input Validation** - Validate all user inputs
- **Access Control** - Proper permission checking
- **Audit Logging** - Track all rental operations
- **Data Encryption** - Secure sensitive client information

---

## 🎉 System Status

✅ **Database Schema** - Complete and migrated  
✅ **API Endpoints** - Fully functional  
✅ **React Hooks** - Integrated and tested  
✅ **UI Components** - Integrated into logistics dashboard  
✅ **Security** - RLS policies and authentication  
✅ **Documentation** - Comprehensive guides and examples  

The Backline & Rentals System is now fully operational and integrated with the logistics management platform! 