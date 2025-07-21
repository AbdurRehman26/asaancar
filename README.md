# AsaanCar - Car Rental Platform

## New Feature: Car Offer Management

### Overview
A new route and page have been added to allow users to view car details and add car offers directly from the car detail page.

### New Routes

#### API Routes
- `GET /api/cars/{id}/with-offer-form` - Get car details with offer form data
  - Returns car information along with available currencies and existing offers
  - No authentication required

#### Frontend Routes
- `/car-detail/{id}/with-offer` - Car detail page with offer form
  - Displays comprehensive car information
  - Includes a form to add new car offers
  - Shows existing active offers for the car

### Features

#### Car Detail with Offer Page
- **Car Information Display**: Shows all car specifications including:
  - Car image, name, and model
  - Year, color, seats, transmission, fuel type
  - Car brand, type, and engine information
  - Rate details (with/without driver pricing)
  - Store information
  - Car description

- **Offer Form**: Positioned alongside car details for easy access:
  - Discount percentage (0-100%)
  - Currency selection (PKR, USD, EUR, GBP)
  - Start and end dates
  - Active/inactive status toggle
  - Form validation and error handling
  - Sticky positioning for better user experience

- **Existing Offers Display**: Shows current active offers for the car with:
  - Discount percentage
  - Date range
  - Active status indicator

- **Responsive Layout**: 
  - Side-by-side layout on desktop (2/3 car details, 1/3 offer form)
  - Stacked layout on mobile for better usability
  - Optimized spacing and typography for better readability

#### Navigation
- **Car Listing Page**: Each car card now includes an "Add Offer" button for authenticated users
- **Car Detail Page**: Includes a link to the offer form page
- **Dashboard Car Listings**: Each car card includes "View Offers" and "Edit" buttons for store owners
- **Filament Admin Panel**: Added "View Offers" action in the car management table
- **Responsive Design**: Works on both desktop and mobile devices

#### Dashboard Integration
- **Store Owner Dashboard**: Added "View Offers" button to each car in the dashboard car listings
- **Button Positioning**: Positioned alongside the existing "Edit" button for easy access
- **Color Coding**: Green button for offers, purple for editing to maintain visual consistency
- **Quick Access**: Store owners can now quickly view and manage offers for their cars directly from the dashboard
- **Consistent Layout**: Uses the same AppLayout structure as other dashboard pages with proper breadcrumbs
- **Navigation**: Includes back button and proper breadcrumb navigation for better user experience

### Technical Implementation

#### Backend
- **Controller**: `CarController@showWithOfferForm` - Returns car data with offer form metadata
- **Model**: Uses existing `Car` and `CarOffer` models
- **Validation**: Leverages existing `CreateCarOfferRequest` validation rules

#### Frontend
- **Component**: `CarOfferForm` - Reusable form component for creating offers
- **Page**: `CarDetailWithOffer` - Main page component
- **Routing**: Added to React Router configuration
- **Styling**: Consistent with existing design system using Tailwind CSS

### Usage

1. **From Car Listing**: Click "Add Offer" button on any car card
2. **From Car Detail**: Click "Add Car Offer" button
3. **From Dashboard**: Click "View Offers" button on any car in the dashboard car listings
4. **From Filament Admin**: Click "View Offers" action in the car management table
5. **Direct URL**: Navigate to `/car-detail/{car_id}/with-offer`

### Form Fields

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| Discount Percentage | Number | 0-100, required | Percentage discount to apply |
| Currency | Select | Required | Currency for the offer (PKR, USD, EUR, GBP) |
| Start Date | Date | Required | When the offer becomes active |
| End Date | Date | Required, after start date | When the offer expires |
| Active Status | Checkbox | Optional | Whether the offer is currently active |

### Error Handling
- Form validation with real-time error messages
- Network error handling
- Success/error notifications
- Automatic data refresh after successful offer creation

### Security
- Form validation on both frontend and backend
- CSRF protection through Laravel's built-in mechanisms
- Input sanitization and validation

### Future Enhancements
- Offer editing and deletion
- Offer templates
- Bulk offer creation
- Offer analytics and reporting
- Email notifications for offer creation 