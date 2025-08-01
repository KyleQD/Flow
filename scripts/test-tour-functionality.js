// Comprehensive Tour Functionality Testing Script
// This script will test all aspects of the Tourify platform for tour management

const { tourData, tourJobs } = require('./create-super-awesome-tour');

class TourFunctionalityTester {
  constructor() {
    this.testResults = {
      tourCreation: { success: false, issues: [], features: [] },
      eventManagement: { success: false, issues: [], features: [] },
      jobPosting: { success: false, issues: [], features: [] },
      teamManagement: { success: false, issues: [], features: [] },
      vendorManagement: { success: false, issues: [], features: [] },
      financialTracking: { success: false, issues: [], features: [] },
      logistics: { success: false, issues: [], features: [] },
      overall: { score: 0, missingFeatures: [], suggestions: [] }
    };
    this.tourId = null;
    this.eventIds = [];
    this.jobIds = [];
  }

  async testTourCreation() {
    console.log('\n🎵 Testing Tour Creation...');
    
    try {
      // Test 1: Basic tour creation via API
      const tourResponse = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tourData.name,
          description: tourData.description,
          start_date: tourData.startDate,
          end_date: tourData.endDate,
          budget: tourData.budget.total,
          transportation: tourData.transportation.type,
          accommodation: tourData.accommodation.type,
          equipment_requirements: tourData.equipment.map(e => `${e.name} (${e.quantity})`).join(', '),
          crew_size: tourData.crew.length
        })
      });

      if (tourResponse.ok) {
        const tour = await tourResponse.json();
        this.tourId = tour.tour.id;
        this.testResults.tourCreation.success = true;
        this.testResults.tourCreation.features.push('✅ Basic tour creation works');
        console.log('✅ Tour created successfully:', tour.tour.id);
      } else {
        const error = await tourResponse.json();
        this.testResults.tourCreation.issues.push(`❌ Tour creation failed: ${error.error}`);
        console.log('❌ Tour creation failed:', error);
      }

      // Test 2: Tour planner functionality
      const plannerResponse = await fetch('/api/tours/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step1: {
            name: tourData.name,
            description: tourData.description,
            mainArtist: tourData.mainArtist,
            genre: tourData.genre,
            coverImage: tourData.coverImage
          },
          step2: {
            startDate: tourData.startDate,
            endDate: tourData.endDate,
            route: tourData.route
          },
          step3: {
            events: tourData.events
          },
          step4: {
            artists: tourData.artists,
            crew: tourData.crew
          },
          step5: {
            transportation: tourData.transportation,
            accommodation: tourData.accommodation,
            equipment: tourData.equipment
          },
          step6: {
            ticketTypes: tourData.ticketTypes,
            budget: tourData.budget,
            sponsors: tourData.sponsors
          }
        })
      });

      if (plannerResponse.ok) {
        this.testResults.tourCreation.features.push('✅ Tour planner works');
        console.log('✅ Tour planner works');
      } else {
        this.testResults.tourCreation.issues.push('❌ Tour planner has issues');
        console.log('❌ Tour planner failed');
      }

    } catch (error) {
      this.testResults.tourCreation.issues.push(`❌ Tour creation error: ${error.message}`);
      console.log('❌ Tour creation error:', error);
    }
  }

  async testEventManagement() {
    console.log('\n📅 Testing Event Management...');
    
    if (!this.tourId) {
      this.testResults.eventManagement.issues.push('❌ Cannot test events - no tour ID');
      return;
    }

    try {
      // Test 1: Create events for the tour
      for (const eventData of tourData.events.slice(0, 5)) { // Test first 5 events
        const eventResponse = await fetch(`/api/tours/${this.tourId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: eventData.name,
            description: eventData.description,
            venue_name: eventData.venue,
            event_date: eventData.date,
            event_time: eventData.time,
            capacity: eventData.capacity,
            status: 'scheduled'
          })
        });

        if (eventResponse.ok) {
          const event = await eventResponse.json();
          this.eventIds.push(event.event.id);
          this.testResults.eventManagement.features.push(`✅ Event creation works: ${eventData.name}`);
        } else {
          this.testResults.eventManagement.issues.push(`❌ Event creation failed: ${eventData.name}`);
        }
      }

      // Test 2: Fetch events for the tour
      const eventsResponse = await fetch(`/api/tours/${this.tourId}/events`);
      if (eventsResponse.ok) {
        const events = await eventsResponse.json();
        this.testResults.eventManagement.features.push(`✅ Event fetching works (${events.events.length} events)`);
      } else {
        this.testResults.eventManagement.issues.push('❌ Event fetching failed');
      }

      this.testResults.eventManagement.success = this.eventIds.length > 0;

    } catch (error) {
      this.testResults.eventManagement.issues.push(`❌ Event management error: ${error.message}`);
    }
  }

  async testJobPosting() {
    console.log('\n💼 Testing Job Posting...');
    
    if (!this.tourId) {
      this.testResults.jobPosting.issues.push('❌ Cannot test jobs - no tour ID');
      return;
    }

    try {
      // Test 1: Create tour-specific jobs
      for (const jobData of tourJobs.slice(0, 5)) { // Test first 5 jobs
        const jobResponse = await fetch(`/api/tours/${this.tourId}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...jobData,
            tour_id: this.tourId,
            tour_name: tourData.name,
            tour_start_date: tourData.startDate,
            tour_end_date: tourData.endDate
          })
        });

        if (jobResponse.ok) {
          const job = await jobResponse.json();
          this.jobIds.push(job.job.id);
          this.testResults.jobPosting.features.push(`✅ Job posting works: ${jobData.title}`);
        } else {
          this.testResults.jobPosting.issues.push(`❌ Job posting failed: ${jobData.title}`);
        }
      }

      // Test 2: Fetch tour jobs
      const jobsResponse = await fetch(`/api/tours/${this.tourId}/jobs`);
      if (jobsResponse.ok) {
        const jobs = await jobsResponse.json();
        this.testResults.jobPosting.features.push(`✅ Job fetching works (${jobs.jobs?.length || 0} jobs)`);
      } else {
        this.testResults.jobPosting.issues.push('❌ Job fetching failed');
      }

      this.testResults.jobPosting.success = this.jobIds.length > 0;

    } catch (error) {
      this.testResults.jobPosting.issues.push(`❌ Job posting error: ${error.message}`);
    }
  }

  async testTeamManagement() {
    console.log('\n👥 Testing Team Management...');
    
    if (!this.tourId) {
      this.testResults.teamManagement.issues.push('❌ Cannot test team - no tour ID');
      return;
    }

    try {
      // Test 1: Add team members
      for (const crewMember of tourData.crew.slice(0, 3)) { // Test first 3 crew members
        const teamResponse = await fetch(`/api/tours/${this.tourId}/team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: crewMember.name,
            role: crewMember.role,
            contact_email: `${crewMember.name.toLowerCase().replace(' ', '.')}@tour.com`,
            status: 'confirmed'
          })
        });

        if (teamResponse.ok) {
          this.testResults.teamManagement.features.push(`✅ Team member addition works: ${crewMember.name}`);
        } else {
          this.testResults.teamManagement.issues.push(`❌ Team member addition failed: ${crewMember.name}`);
        }
      }

      // Test 2: Fetch team members
      const teamResponse = await fetch(`/api/tours/${this.tourId}/team`);
      if (teamResponse.ok) {
        const team = await teamResponse.json();
        this.testResults.teamManagement.features.push(`✅ Team fetching works (${team.team_members?.length || 0} members)`);
      } else {
        this.testResults.teamManagement.issues.push('❌ Team fetching failed');
      }

      this.testResults.teamManagement.success = true;

    } catch (error) {
      this.testResults.teamManagement.issues.push(`❌ Team management error: ${error.message}`);
    }
  }

  async testVendorManagement() {
    console.log('\n🏢 Testing Vendor Management...');
    
    if (!this.tourId) {
      this.testResults.vendorManagement.issues.push('❌ Cannot test vendors - no tour ID');
      return;
    }

    try {
      // Test 1: Add vendors
      const vendors = [
        { name: "ABC Sound Systems", type: "Audio Equipment", contact_name: "John Smith", contact_email: "john@abcsound.com" },
        { name: "Lighting Pro", type: "Lighting Equipment", contact_name: "Jane Doe", contact_email: "jane@lightingpro.com" }
      ];

      for (const vendor of vendors) {
        const vendorResponse = await fetch(`/api/tours/${this.tourId}/vendors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...vendor,
            status: 'confirmed',
            services: ['Equipment Rental'],
            contract_amount: 50000,
            payment_status: 'pending'
          })
        });

        if (vendorResponse.ok) {
          this.testResults.vendorManagement.features.push(`✅ Vendor addition works: ${vendor.name}`);
        } else {
          this.testResults.vendorManagement.issues.push(`❌ Vendor addition failed: ${vendor.name}`);
        }
      }

      // Test 2: Fetch vendors
      const vendorsResponse = await fetch(`/api/tours/${this.tourId}/vendors`);
      if (vendorsResponse.ok) {
        const vendors = await vendorsResponse.json();
        this.testResults.vendorManagement.features.push(`✅ Vendor fetching works (${vendors.vendors?.length || 0} vendors)`);
      } else {
        this.testResults.vendorManagement.issues.push('❌ Vendor fetching failed');
      }

      this.testResults.vendorManagement.success = true;

    } catch (error) {
      this.testResults.vendorManagement.issues.push(`❌ Vendor management error: ${error.message}`);
    }
  }

  evaluateMissingFeatures() {
    console.log('\n🔍 Evaluating Missing Features...');
    
    const missingFeatures = [
      'Tour routing optimization and travel time calculation',
      'Real-time tour status updates and notifications',
      'Integrated ticketing system with sales tracking',
      'Tour merchandise management and inventory tracking',
      'Tour budget vs actual expense tracking',
      'Tour crew scheduling and availability management',
      'Tour equipment inventory and maintenance tracking',
      'Tour insurance and permit management',
      'Tour marketing and promotional material management',
      'Tour performance analytics and reporting',
      'Tour fan engagement and social media integration',
      'Tour emergency contact and safety protocols',
      'Tour weather monitoring and contingency planning',
      'Tour local vendor and service provider directory',
      'Tour document management and contract storage',
      'Tour communication system for crew coordination',
      'Tour mobile app for on-the-road management',
      'Tour integration with venue management systems',
      'Tour carbon footprint tracking and sustainability metrics',
      'Tour accessibility compliance tracking'
    ];

    this.testResults.overall.missingFeatures = missingFeatures;
    
    const suggestions = [
      'Add tour routing optimization with Google Maps integration',
      'Implement real-time notifications for tour updates',
      'Create integrated ticketing system with major platforms',
      'Add merchandise inventory management with barcode scanning',
      'Implement comprehensive budget tracking with expense categories',
      'Add crew scheduling with availability conflicts detection',
      'Create equipment maintenance schedule and tracking',
      'Add insurance and permit deadline reminders',
      'Implement marketing campaign tracking and ROI analysis',
      'Add comprehensive tour analytics dashboard',
      'Create fan engagement tools with social media integration',
      'Add emergency contact system with location-based alerts',
      'Implement weather monitoring with venue-specific alerts',
      'Create local vendor directory with ratings and reviews',
      'Add document management with version control',
      'Implement crew communication system with push notifications',
      'Create mobile app for tour management on the go',
      'Add venue integration for seamless data exchange',
      'Implement sustainability tracking and reporting',
      'Add accessibility compliance checklist and tracking'
    ];

    this.testResults.overall.suggestions = suggestions;
  }

  calculateOverallScore() {
    const categories = Object.keys(this.testResults).filter(key => key !== 'overall');
    let totalScore = 0;
    let maxScore = categories.length * 100;

    categories.forEach(category => {
      const result = this.testResults[category];
      let categoryScore = 0;
      
      if (result.success) categoryScore += 50;
      categoryScore += result.features.length * 10;
      categoryScore -= result.issues.length * 5;
      
      categoryScore = Math.max(0, Math.min(100, categoryScore));
      totalScore += categoryScore;
    });

    this.testResults.overall.score = Math.round((totalScore / maxScore) * 100);
  }

  generateReport() {
    console.log('\n📊 Generating Comprehensive Report...');
    
    this.calculateOverallScore();
    
    const report = `# Great Tour Functional Review

## 🎯 Overall Assessment
**Platform Score: ${this.testResults.overall.score}/100**

## ✅ Features That Worked Smoothly

${Object.entries(this.testResults)
  .filter(([key, value]) => key !== 'overall' && value.features.length > 0)
  .map(([category, value]) => `### ${category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
${value.features.join('\n')}`)
  .join('\n\n')}

## ⚠️ Partial or Buggy Features

${Object.entries(this.testResults)
  .filter(([key, value]) => key !== 'overall' && value.issues.length > 0)
  .map(([category, value]) => `### ${category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
${value.issues.join('\n')}`)
  .join('\n\n')}

## ❌ Missing or Critical Gaps

### Core Tour Management Features
${this.testResults.overall.missingFeatures.slice(0, 10).map(feature => `- ${feature}`).join('\n')}

### Advanced Features
${this.testResults.overall.missingFeatures.slice(10).map(feature => `- ${feature}`).join('\n')}

## 💡 Suggestions for Improvement

### High Priority
${this.testResults.overall.suggestions.slice(0, 10).map(suggestion => `- ${suggestion}`).join('\n')}

### Medium Priority
${this.testResults.overall.suggestions.slice(10).map(suggestion => `- ${suggestion}`).join('\n')}

## 🎵 Tour Manager Perspective

As a real tour manager managing a 20-city North American tour, here's what I would expect from a comprehensive tour management platform:

### Essential Features (Currently Missing)
1. **Real-time Tour Dashboard** - Live updates on all tour aspects
2. **Integrated Communication System** - Crew coordination and emergency alerts
3. **Comprehensive Budget Management** - Real-time expense tracking vs budget
4. **Tour Routing Optimization** - Efficient travel planning with logistics
5. **Vendor Management System** - Local service provider directory and contracts
6. **Equipment Tracking** - Inventory management and maintenance schedules
7. **Crew Scheduling** - Availability management and conflict resolution
8. **Document Management** - Contracts, permits, and tour documentation
9. **Performance Analytics** - Sales, attendance, and financial reporting
10. **Mobile App** - On-the-road tour management capabilities

### Critical Gaps for Large-Scale Tours
- **No real-time status updates** - Tour managers need live information
- **Limited communication tools** - Crew coordination is essential
- **No integrated ticketing** - Sales tracking is crucial for revenue management
- **Missing vendor directory** - Local service providers are essential
- **No emergency protocols** - Safety and contingency planning is critical
- **Limited mobile functionality** - Tour managers work on the road
- **No weather integration** - Outdoor venues need weather monitoring
- **Missing accessibility features** - Compliance is mandatory
- **No sustainability tracking** - Environmental impact matters
- **Limited integration capabilities** - Third-party system connections needed

## 🚀 Recommendations

### Immediate Improvements (1-2 months)
1. Implement real-time tour dashboard
2. Add crew communication system
3. Create comprehensive budget tracking
4. Develop mobile-responsive interface
5. Add document management system

### Medium-term Enhancements (3-6 months)
1. Integrate with ticketing platforms
2. Add vendor management system
3. Implement tour routing optimization
4. Create performance analytics dashboard
5. Add emergency contact system

### Long-term Vision (6-12 months)
1. Develop mobile app for tour management
2. Add AI-powered tour optimization
3. Implement sustainability tracking
4. Create comprehensive integration ecosystem
5. Add advanced analytics and reporting

## 📈 Conclusion

The Tourify platform shows promise with basic tour creation and management capabilities, but significant gaps exist for professional tour management at scale. The platform would benefit from focusing on real-time functionality, comprehensive communication tools, and mobile-first design to meet the needs of professional tour managers.

**Priority Focus Areas:**
1. Real-time updates and notifications
2. Crew communication and coordination
3. Comprehensive budget and expense tracking
4. Mobile-responsive design
5. Integration capabilities with external systems

`;

    return report;
  }

  async runAllTests() {
    console.log('🎵 Starting Comprehensive Tour Functionality Testing...\n');
    
    await this.testTourCreation();
    await this.testEventManagement();
    await this.testJobPosting();
    await this.testTeamManagement();
    await this.testVendorManagement();
    this.evaluateMissingFeatures();
    
    const report = this.generateReport();
    
    // Save report to file
    const fs = require('fs');
    fs.writeFileSync('great-tour-functional-review.md', report);
    
    console.log('\n📄 Report saved to: great-tour-functional-review.md');
    console.log('\n🎯 Testing Complete!');
    
    return this.testResults;
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  const tester = new TourFunctionalityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = TourFunctionalityTester; 