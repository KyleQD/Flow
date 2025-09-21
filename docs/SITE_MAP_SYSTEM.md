# Interactive Site Map System

## Overview

The Interactive Site Map System is a comprehensive logistics management tool designed specifically for festival vendors and event organizers. It provides an intuitive, drag-and-drop interface for creating detailed site layouts, managing glamping tents, and coordinating vendor operations.

## Features

### 🗺️ Interactive Canvas
- **Drag-and-Drop Interface**: Create and modify site layouts with intuitive drag-and-drop functionality
- **Real-time Editing**: Make changes that are instantly visible to all team members
- **Multi-tool Support**: Select, pan, zone creation, tent placement, and path drawing tools
- **Zoom & Pan**: Navigate large site maps with smooth zoom and pan controls
- **Grid System**: Optional grid overlay for precise positioning

### 🏕️ Glamping Tent Management
- **Tent Types**: Support for bell tents, safari tents, yurts, tipis, domes, cabins, and custom tents
- **Capacity Management**: Track tent capacity and current occupancy
- **Guest Information**: Store guest details, check-in/out dates, and contact information
- **Amenities Tracking**: Power, WiFi, heating, cooling, and private bathroom availability
- **Status Management**: Available, occupied, reserved, and maintenance states
- **Pricing**: Base and dynamic pricing for tents

### 🏢 Zone Management
- **Zone Types**: Glamping, parking, vendor, food, restroom, utility, entrance, exit, stage, medical, security, storage
- **Capacity Planning**: Set and monitor zone capacity limits
- **Utility Tracking**: Power, water, and internet availability
- **Visual Customization**: Custom colors, borders, and opacity settings

### 👥 Vendor Management
- **Vendor Profiles**: Complete vendor information with contact details and ratings
- **Specialization Tracking**: Track vendor expertise in different tent types
- **Template System**: Pre-defined tent configurations for quick setup
- **Performance Metrics**: Rating and review system for vendors

### 📱 Mobile Responsive
- **Field Worker Access**: Mobile-optimized interface for on-site staff
- **Touch Controls**: Touch-friendly controls for mobile devices
- **Real-time Updates**: Live updates for tent status and guest information
- **Offline Capability**: Basic functionality when connectivity is limited

### 🔄 Real-time Collaboration
- **Multi-user Editing**: Multiple users can work on the same site map simultaneously
- **Live Cursors**: See where other team members are working
- **Activity Logging**: Complete audit trail of all changes
- **Permission Management**: Granular permissions for different user roles

### 📊 Analytics & Reporting
- **Occupancy Rates**: Real-time occupancy tracking across all tents
- **Revenue Tracking**: Monitor revenue from tent rentals
- **Utilization Metrics**: Track resource utilization and efficiency
- **Export Reports**: Generate detailed reports for stakeholders

### 💾 Export/Import
- **JSON Export**: Export complete site maps with all data
- **Template Sharing**: Share site map templates between events
- **Backup & Restore**: Full backup and restore capabilities
- **Version Control**: Track changes and revert if needed

## Architecture

### Database Schema

The system uses the following main tables:

- **site_maps**: Core site map information and settings
- **site_map_zones**: Zone definitions and properties
- **glamping_tents**: Tent details and guest information
- **site_map_elements**: Custom elements (paths, utilities, etc.)
- **site_map_collaborators**: User permissions and access control
- **site_map_activity_log**: Complete audit trail

### API Endpoints

#### Site Maps
- `GET /api/admin/logistics/site-maps` - List all site maps
- `POST /api/admin/logistics/site-maps` - Create new site map
- `GET /api/admin/logistics/site-maps/[id]` - Get specific site map
- `PUT /api/admin/logistics/site-maps/[id]` - Update site map
- `DELETE /api/admin/logistics/site-maps/[id]` - Delete site map

#### Zones
- `GET /api/admin/logistics/site-maps/[id]/zones` - List zones for site map
- `POST /api/admin/logistics/site-maps/[id]/zones` - Create new zone
- `PUT /api/admin/logistics/site-maps/[id]/zones/[zoneId]` - Update zone
- `DELETE /api/admin/logistics/site-maps/[id]/zones/[zoneId]` - Delete zone

#### Tents
- `GET /api/admin/logistics/site-maps/[id]/tents` - List tents for site map
- `POST /api/admin/logistics/site-maps/[id]/tents` - Create new tent
- `PUT /api/admin/logistics/site-maps/[id]/tents/[tentId]` - Update tent
- `DELETE /api/admin/logistics/site-maps/[id]/tents/[tentId]` - Delete tent

#### Export/Import
- `GET /api/admin/logistics/site-maps/[id]/export` - Export site map
- `POST /api/admin/logistics/site-maps/import` - Import site map

### Components

#### Core Components
- **SiteMapCanvas**: Main interactive canvas component
- **SiteMapManager**: Complete site map management interface
- **MobileSiteMapViewer**: Mobile-optimized viewing interface
- **VendorManagement**: Vendor and tent management interface

#### Hooks
- **useSiteMaps**: Hook for managing multiple site maps
- **useSiteMap**: Hook for managing individual site map data

## Usage Guide

### Creating a Site Map

1. Navigate to the Logistics section in the admin dashboard
2. Click on the "Site Maps" tab
3. Click "New Site Map" to create a new site map
4. Fill in the basic information:
   - Name and description
   - Dimensions (width and height in pixels)
   - Scale (meters per pixel)
   - Background color or image
   - Grid settings

### Adding Zones

1. Select the "Zone" tool from the toolbar
2. Click and drag on the canvas to create a zone
3. Configure zone properties:
   - Name and type
   - Capacity and amenities
   - Visual styling (color, border, opacity)

### Managing Tents

1. Select the "Tent" tool from the toolbar
2. Click on the canvas to place a tent
3. Configure tent properties:
   - Tent number and type
   - Capacity and amenities
   - Pricing information
   - Guest details (if occupied)

### Vendor Management

1. Navigate to the "Vendors" tab in the site map manager
2. Add new vendors with contact information
3. Create tent templates for quick setup
4. Track vendor performance and ratings

### Mobile Access

1. Access the site map from any mobile device
2. Use touch controls to navigate and view details
3. Update tent status in real-time
4. View guest information and contact details

## Integration

### With Existing Logistics System

The site map system integrates seamlessly with the existing Tourify logistics platform:

- **Event Integration**: Link site maps to specific events
- **Tour Integration**: Manage site maps across tour dates
- **Permission System**: Uses existing user permission framework
- **Activity Logging**: Integrates with existing audit systems

### With External Systems

The system supports integration with:

- **Booking Systems**: Import guest information from booking platforms
- **Payment Systems**: Track revenue and pricing
- **Communication Tools**: Send notifications and updates
- **Reporting Systems**: Export data for external analysis

## Security

### Access Control

- **Row Level Security**: Database-level security policies
- **Permission-based Access**: Granular permissions for different operations
- **Audit Logging**: Complete activity tracking
- **Data Encryption**: Sensitive data encrypted at rest and in transit

### User Roles

- **Owner**: Full access to site map and all operations
- **Editor**: Can modify site map layout and content
- **Manager**: Can manage tents and zones
- **Viewer**: Read-only access to site map
- **Field Worker**: Mobile access for status updates

## Performance

### Optimization Features

- **Lazy Loading**: Load data only when needed
- **Efficient Rendering**: Canvas-based rendering for smooth performance
- **Caching**: Smart caching of frequently accessed data
- **Real-time Updates**: Efficient WebSocket connections for live updates

### Scalability

- **Large Site Maps**: Support for maps up to 10,000 x 10,000 pixels
- **Many Tents**: Handle thousands of tents efficiently
- **Concurrent Users**: Support multiple simultaneous users
- **Mobile Performance**: Optimized for mobile devices

## Best Practices

### Site Map Design

1. **Start with Zones**: Define major zones before adding tents
2. **Use Consistent Sizing**: Standardize tent sizes for easier management
3. **Plan Utilities**: Consider power, water, and internet placement
4. **Access Routes**: Ensure clear paths for emergency access

### Tent Management

1. **Numbering System**: Use consistent tent numbering (e.g., A1, A2, B1, B2)
2. **Status Updates**: Keep tent status current for accurate reporting
3. **Guest Information**: Maintain up-to-date guest details
4. **Maintenance Tracking**: Log maintenance issues and resolutions

### Team Collaboration

1. **Clear Permissions**: Assign appropriate permissions to team members
2. **Communication**: Use the activity log to track changes
3. **Backup Regularly**: Export site maps as backups
4. **Training**: Ensure team members understand the system

## Troubleshooting

### Common Issues

#### Canvas Not Loading
- Check browser compatibility (requires modern browser)
- Clear browser cache and refresh
- Verify user permissions

#### Performance Issues
- Reduce zoom level for large site maps
- Close unused browser tabs
- Check network connectivity

#### Mobile Issues
- Ensure responsive design is enabled
- Check touch event handling
- Verify mobile browser compatibility

### Support

For technical support or feature requests:

1. Check the activity log for error details
2. Review the browser console for JavaScript errors
3. Contact the development team with specific error messages
4. Include screenshots and steps to reproduce issues

## Future Enhancements

### Planned Features

- **3D Visualization**: Three-dimensional site map views
- **Weather Integration**: Weather-based tent management
- **IoT Integration**: Smart tent monitoring and control
- **Advanced Analytics**: Machine learning for optimization
- **AR Support**: Augmented reality for field workers

### Integration Opportunities

- **Booking Platforms**: Direct integration with booking systems
- **Payment Processing**: Integrated payment and billing
- **Communication Tools**: Built-in messaging and notifications
- **Reporting Dashboards**: Advanced analytics and reporting

## 🎉 Enhanced Equipment Management System

The Interactive Site Map System has been significantly enhanced with comprehensive equipment management capabilities, making it the ultimate solution for festival vendors managing large amounts of equipment and rentals.

### ✅ New Equipment Management Features

1. **Comprehensive Equipment Catalog** - 25+ pre-defined equipment types with visual symbols
2. **Drag-and-Drop Equipment Placement** - Select equipment from catalog and drag onto site maps
3. **Visual Equipment Symbols** - Each equipment type has unique, recognizable symbols
4. **Equipment Properties Tracking** - Power requirements, setup time, weather resistance
5. **Rental Management** - Daily/weekly rates, security deposits, availability tracking
6. **Power Distribution Planning** - Calculate power consumption and plan generator placement
7. **Setup Workflow Management** - Create step-by-step equipment installation procedures
8. **Task Assignment System** - Assign setup tasks to team members with dependencies
9. **Real-time Equipment Status** - Track equipment availability, maintenance, and usage
10. **Mobile Equipment Management** - Field workers can update equipment status on mobile

### 🚀 Equipment Categories Available

- **Sound Equipment**: Speakers, amplifiers, mixers, microphones with power requirements
- **Lighting Equipment**: Spotlights, stage lights, LED bars, fog machines
- **Stage Equipment**: Stages, risers, backdrops with dimensional specifications
- **Power Equipment**: Generators, power distribution, UPS systems with capacity tracking
- **Tent Equipment**: Bell tents, canopies, dome tents with setup requirements
- **Furniture**: Tables, chairs, benches with capacity and positioning data
- **Catering**: Food trucks, grills, coolers with utility requirements
- **Security**: Security posts, barriers with coverage area planning
- **Transportation**: Trucks, trailers with loading capacity and access routes
- **Decor**: Banners, decorations with installation and weather considerations

### 🛠️ Advanced Equipment Features

- **Visual Symbol Library**: Each equipment type has a unique, color-coded symbol
- **Equipment Specifications**: Track dimensions, weight, power consumption, voltage requirements
- **Setup Requirements**: Document setup time, required tools, and skills needed
- **Utility Dependencies**: Track power, water, internet, and other utility requirements
- **Weather Considerations**: Mark equipment as weather-resistant or requiring protection
- **Rental Economics**: Manage daily/weekly rates, security deposits, and availability
- **Maintenance Tracking**: Schedule inspections, track maintenance history
- **Power Planning**: Calculate total power consumption and plan generator capacity
- **Setup Workflows**: Create detailed installation procedures with task dependencies
- **Team Assignment**: Assign equipment setup tasks to specific team members

### 🎯 How Vendors Can Use the Enhanced System

1. **Equipment Planning**: 
   - Browse the comprehensive equipment catalog
   - Select equipment types needed for the event
   - Drag and drop equipment onto the site map canvas

2. **Power Management**:
   - Plan generator placement and capacity
   - Calculate total power requirements
   - Ensure proper power distribution across the site

3. **Setup Workflows**:
   - Create detailed installation procedures
   - Assign tasks to team members
   - Track progress and dependencies

4. **Rental Management**:
   - Track equipment availability and reservations
   - Manage rental rates and deposits
   - Monitor equipment status and maintenance

5. **Field Operations**:
   - Use mobile interface for real-time updates
   - Track equipment setup progress
   - Report issues and maintenance needs

### 🔧 Technical Enhancements

- **Database Schema**: 12+ new tables for comprehensive equipment management
- **API Endpoints**: RESTful APIs for all equipment operations
- **TypeScript Types**: Full type safety with comprehensive interfaces
- **Real-time Updates**: Live collaboration on equipment placement and status
- **Mobile Optimization**: Touch-friendly interface for field workers
- **Export/Import**: Save and share equipment configurations

## Conclusion

The Enhanced Interactive Site Map System with comprehensive equipment management provides the ultimate solution for festival vendors managing large amounts of equipment and rentals. With its intuitive drag-and-drop interface, visual equipment symbols, power planning tools, and setup workflow management, it streamlines operations and improves efficiency for event organizers and vendors alike.

The system is designed to handle complex equipment setups from small local events to large multi-day festivals, providing the tools and insights necessary for successful equipment management and event execution.
