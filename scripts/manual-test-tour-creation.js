// Manual Testing Script for Tour Creation
// This script will test the tour creation functionality step by step

const BASE_URL = 'http://localhost:3000';

async function testTourCreation() {
  console.log('🎵 Starting Manual Tour Creation Testing...\n');
  
  const testResults = {
    tourCreation: { success: false, issues: [], features: [] },
    eventManagement: { success: false, issues: [], features: [] },
    jobPosting: { success: false, issues: [], features: [] },
    teamManagement: { success: false, issues: [], features: [] },
    vendorManagement: { success: false, issues: [], features: [] }
  };

  let tourId = null;

  // Test 1: Basic Tour Creation
  console.log('📝 Testing Basic Tour Creation...');
  try {
    const tourData = {
      name: "Super Awesome Tour",
      description: "A spectacular 20-city North American tour featuring an incredible lineup of DJ, supporting bands, and headlining act.",
      start_date: "2025-03-15",
      end_date: "2025-05-10",
      budget: 2500000,
      transportation: "Tour Bus + Equipment Truck",
      accommodation: "4-Star Hotels",
      equipment_requirements: "PA System (1), Lighting Rig (1), Video Screens (3), Backline Equipment (1), Merchandise Setup (1)",
      crew_size: 11
    };

    const response = await fetch(`${BASE_URL}/api/tours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tourData)
    });

    if (response.ok) {
      const result = await response.json();
      tourId = result.tour.id;
      testResults.tourCreation.success = true;
      testResults.tourCreation.features.push('✅ Basic tour creation works');
      console.log('✅ Tour created successfully:', tourId);
    } else {
      const error = await response.json();
      testResults.tourCreation.issues.push(`❌ Tour creation failed: ${error.error}`);
      console.log('❌ Tour creation failed:', error);
    }
  } catch (error) {
    testResults.tourCreation.issues.push(`❌ Tour creation error: ${error.message}`);
    console.log('❌ Tour creation error:', error);
  }

  // Test 2: Event Creation
  if (tourId) {
    console.log('\n📅 Testing Event Creation...');
    try {
      const events = [
        {
          name: "Super Awesome Tour - Los Angeles",
          description: "Opening night of the Super Awesome Tour",
          venue_name: "The Forum",
          event_date: "2025-03-15",
          event_time: "20:00",
          capacity: 17000,
          status: "scheduled"
        },
        {
          name: "Super Awesome Tour - San Diego",
          description: "San Diego stop on the Super Awesome Tour",
          venue_name: "Petco Park",
          event_date: "2025-03-18",
          event_time: "19:30",
          capacity: 42000,
          status: "scheduled"
        }
      ];

      for (const eventData of events) {
        const response = await fetch(`${BASE_URL}/api/tours/${tourId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        });

        if (response.ok) {
          const result = await response.json();
          testResults.eventManagement.features.push(`✅ Event creation works: ${eventData.name}`);
          console.log('✅ Event created:', eventData.name);
        } else {
          const error = await response.json();
          testResults.eventManagement.issues.push(`❌ Event creation failed: ${eventData.name} - ${error.error}`);
          console.log('❌ Event creation failed:', eventData.name, error);
        }
      }

      testResults.eventManagement.success = true;
    } catch (error) {
      testResults.eventManagement.issues.push(`❌ Event management error: ${error.message}`);
      console.log('❌ Event management error:', error);
    }
  }

  // Test 3: Job Posting
  if (tourId) {
    console.log('\n💼 Testing Job Posting...');
    try {
      const jobs = [
        {
          title: "Tour Manager",
          description: "Experienced tour manager needed for a major 20-city North American tour.",
          category_id: "1",
          payment_type: "paid",
          payment_amount: 8000,
          location: "Multiple Locations",
          required_skills: ["Tour Management", "Logistics", "Crew Management"],
          required_experience: "professional"
        },
        {
          title: "Lighting Tech",
          description: "Skilled lighting technician needed for high-energy electronic rock tour.",
          category_id: "5",
          payment_type: "paid",
          payment_amount: 4500,
          location: "Multiple Locations",
          required_skills: ["Lighting Design", "Console Operation", "LED Fixtures"],
          required_experience: "professional"
        }
      ];

      for (const jobData of jobs) {
        const response = await fetch(`${BASE_URL}/api/tours/${tourId}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...jobData,
            tour_id: tourId,
            tour_name: "Super Awesome Tour",
            tour_start_date: "2025-03-15",
            tour_end_date: "2025-05-10"
          })
        });

        if (response.ok) {
          const result = await response.json();
          testResults.jobPosting.features.push(`✅ Job posting works: ${jobData.title}`);
          console.log('✅ Job posted:', jobData.title);
        } else {
          const error = await response.json();
          testResults.jobPosting.issues.push(`❌ Job posting failed: ${jobData.title} - ${error.error}`);
          console.log('❌ Job posting failed:', jobData.title, error);
        }
      }

      testResults.jobPosting.success = true;
    } catch (error) {
      testResults.jobPosting.issues.push(`❌ Job posting error: ${error.message}`);
      console.log('❌ Job posting error:', error);
    }
  }

  // Test 4: Team Management
  if (tourId) {
    console.log('\n👥 Testing Team Management...');
    try {
      const teamMembers = [
        {
          name: "Sarah Johnson",
          role: "Tour Manager",
          contact_email: "sarah.johnson@tour.com",
          status: "confirmed"
        },
        {
          name: "Mike Chen",
          role: "FOH Engineer",
          contact_email: "mike.chen@tour.com",
          status: "confirmed"
        }
      ];

      for (const memberData of teamMembers) {
        const response = await fetch(`${BASE_URL}/api/tours/${tourId}/team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData)
        });

        if (response.ok) {
          const result = await response.json();
          testResults.teamManagement.features.push(`✅ Team member addition works: ${memberData.name}`);
          console.log('✅ Team member added:', memberData.name);
        } else {
          const error = await response.json();
          testResults.teamManagement.issues.push(`❌ Team member addition failed: ${memberData.name} - ${error.error}`);
          console.log('❌ Team member addition failed:', memberData.name, error);
        }
      }

      testResults.teamManagement.success = true;
    } catch (error) {
      testResults.teamManagement.issues.push(`❌ Team management error: ${error.message}`);
      console.log('❌ Team management error:', error);
    }
  }

  // Test 5: Vendor Management
  if (tourId) {
    console.log('\n🏢 Testing Vendor Management...');
    try {
      const vendors = [
        {
          name: "ABC Sound Systems",
          type: "Audio Equipment",
          contact_name: "John Smith",
          contact_email: "john@abcsound.com",
          status: "confirmed",
          services: ["Equipment Rental"],
          contract_amount: 50000,
          payment_status: "pending"
        }
      ];

      for (const vendorData of vendors) {
        const response = await fetch(`${BASE_URL}/api/tours/${tourId}/vendors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vendorData)
        });

        if (response.ok) {
          const result = await response.json();
          testResults.vendorManagement.features.push(`✅ Vendor addition works: ${vendorData.name}`);
          console.log('✅ Vendor added:', vendorData.name);
        } else {
          const error = await response.json();
          testResults.vendorManagement.issues.push(`❌ Vendor addition failed: ${vendorData.name} - ${error.error}`);
          console.log('❌ Vendor addition failed:', vendorData.name, error);
        }
      }

      testResults.vendorManagement.success = true;
    } catch (error) {
      testResults.vendorManagement.issues.push(`❌ Vendor management error: ${error.message}`);
      console.log('❌ Vendor management error:', error);
    }
  }

  return testResults;
}

// Run the test
testTourCreation().then(results => {
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([category, result]) => {
    console.log(`\n${category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}:`);
    if (result.success) {
      console.log('✅ Success');
    } else {
      console.log('❌ Failed');
    }
    
    if (result.features.length > 0) {
      console.log('Features:');
      result.features.forEach(feature => console.log(`  ${feature}`));
    }
    
    if (result.issues.length > 0) {
      console.log('Issues:');
      result.issues.forEach(issue => console.log(`  ${issue}`));
    }
  });
}).catch(error => {
  console.error('Test failed:', error);
}); 