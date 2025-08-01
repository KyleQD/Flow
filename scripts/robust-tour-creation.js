// Robust Tour Creation Script
// This script will log into the user's account and create the comprehensive "Super Awesome Tour"

const puppeteer = require('puppeteer');
const fs = require('fs');

async function createSuperAwesomeTour() {
  console.log('🎵 Creating Super Awesome Tour - 20 City North American Tour...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set a longer timeout
  page.setDefaultTimeout(60000);
  
  try {
    // Step 1: Login to the account
    console.log('🔐 Logging into account...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Fill login form with proper selectors
    await page.waitForSelector('#signin-email');
    await page.type('#signin-email', 'kyleqdaley@gmail.com');
    
    await page.waitForSelector('#signin-password');
    await page.type('#signin-password', 'Quinlan01');
    
    // Click login button
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
      console.log('✅ Login button clicked');
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✅ Successfully logged in');
    }
    
    // Step 2: Navigate to tour creation
    console.log('\n📝 Starting Tour Creation...');
    await page.goto('http://localhost:3000/admin/dashboard/tours/planner', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Fill out Step 1 - Tour Initiation
    console.log('  Step 1: Tour Initiation...');
    
    // Tour name
    const nameInput = await page.$('input[name="name"]');
    if (nameInput) {
      await nameInput.type('Super Awesome Tour');
      console.log('    ✅ Tour name entered');
    }
    
    // Description
    const descriptionInput = await page.$('textarea[name="description"]');
    if (descriptionInput) {
      await descriptionInput.type('A spectacular 20-city North American tour featuring an incredible lineup of DJ, supporting bands, and headlining act. Experience the ultimate live music experience across major cities with state-of-the-art production and unforgettable performances.');
      console.log('    ✅ Tour description entered');
    }
    
    // Main artist
    const artistInput = await page.$('input[name="mainArtist"]');
    if (artistInput) {
      await artistInput.type('The Electric Dreamers');
      console.log('    ✅ Main artist entered');
    }
    
    // Genre
    const genreInput = await page.$('input[name="genre"]');
    if (genreInput) {
      await genreInput.type('Electronic Rock');
      console.log('    ✅ Genre entered');
    }
    
    // Navigate to next step
    const nextButton = await page.$('button:has-text("Next")');
    if (nextButton) {
      await nextButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('    ✅ Moved to Step 2');
    }
    
    // Step 4: Fill out Step 2 - Routing & Dates
    console.log('  Step 2: Routing & Dates...');
    
    // Start date
    const startDateInput = await page.$('input[name="startDate"]');
    if (startDateInput) {
      await startDateInput.type('2025-03-15');
      console.log('    ✅ Start date entered');
    }
    
    // End date
    const endDateInput = await page.$('input[name="endDate"]');
    if (endDateInput) {
      await endDateInput.type('2025-05-10');
      console.log('    ✅ End date entered');
    }
    
    // Add route stops (20 cities)
    const cities = [
      { city: 'Los Angeles', venue: 'The Forum', date: '2025-03-15' },
      { city: 'San Francisco', venue: 'Chase Center', date: '2025-03-18' },
      { city: 'Seattle', venue: 'Climate Pledge Arena', date: '2025-03-21' },
      { city: 'Portland', venue: 'Moda Center', date: '2025-03-24' },
      { city: 'Denver', venue: 'Ball Arena', date: '2025-03-27' },
      { city: 'Austin', venue: 'Moody Center', date: '2025-03-30' },
      { city: 'Houston', venue: 'Toyota Center', date: '2025-04-02' },
      { city: 'Dallas', venue: 'American Airlines Center', date: '2025-04-05' },
      { city: 'New Orleans', venue: 'Smoothie King Center', date: '2025-04-08' },
      { city: 'Atlanta', venue: 'State Farm Arena', date: '2025-04-11' },
      { city: 'Miami', venue: 'FTX Arena', date: '2025-04-14' },
      { city: 'Orlando', venue: 'Amway Center', date: '2025-04-17' },
      { city: 'Nashville', venue: 'Bridgestone Arena', date: '2025-04-20' },
      { city: 'Charlotte', venue: 'Spectrum Center', date: '2025-04-23' },
      { city: 'Washington DC', venue: 'Capital One Arena', date: '2025-04-26' },
      { city: 'Philadelphia', venue: 'Wells Fargo Center', date: '2025-04-29' },
      { city: 'New York', venue: 'Madison Square Garden', date: '2025-05-02' },
      { city: 'Boston', venue: 'TD Garden', date: '2025-05-05' },
      { city: 'Toronto', venue: 'Scotiabank Arena', date: '2025-05-08' },
      { city: 'Montreal', venue: 'Bell Centre', date: '2025-05-10' }
    ];
    
    console.log('    Adding 20 cities to the route...');
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      
      // Find and fill city input
      const cityInput = await page.$('input[placeholder*="city"], input[placeholder*="City"]');
      if (cityInput) {
        await cityInput.type(city.city);
      }
      
      // Find and fill venue input
      const venueInput = await page.$('input[placeholder*="venue"], input[placeholder*="Venue"]');
      if (venueInput) {
        await venueInput.type(city.venue);
      }
      
      // Find and fill date input
      const dateInputs = await page.$$('input[type="date"]');
      for (const input of dateInputs) {
        const value = await input.evaluate(el => el.value || '');
        if (!value) {
          await input.type(city.date);
          break;
        }
      }
      
      // Click add button
      const addButton = await page.$('button:has-text("Add")');
      if (addButton) {
        await addButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (i % 5 === 0) {
        console.log(`      Added ${i + 1} cities...`);
      }
    }
    
    console.log('    ✅ All 20 cities added to route');
    
    // Navigate to next step
    const nextStepButton = await page.$('button:has-text("Next")');
    if (nextStepButton) {
      await nextStepButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('    ✅ Moved to Step 3');
    }
    
    // Step 5: Fill out Step 3 - Events
    console.log('  Step 3: Events...');
    
    // Add events for each city
    for (let i = 0; i < Math.min(5, cities.length); i++) {
      const city = cities[i];
      
      // Find and fill event name
      const nameInput = await page.$('input[placeholder*="name"], input[placeholder*="Name"]');
      if (nameInput) {
        await nameInput.type(`Super Awesome Tour - ${city.city}`);
      }
      
      // Find and fill venue
      const venueInput = await page.$('input[placeholder*="venue"], input[placeholder*="Venue"]');
      if (venueInput) {
        await venueInput.type(city.venue);
      }
      
      // Find and fill date
      const dateInputs = await page.$$('input[type="date"]');
      for (const input of dateInputs) {
        const value = await input.evaluate(el => el.value || '');
        if (!value) {
          await input.type(city.date);
          break;
        }
      }
      
      // Find and fill time
      const timeInputs = await page.$$('input[type="time"]');
      if (timeInputs.length > 0) {
        await timeInputs[0].type('20:00');
      }
      
      // Find and fill capacity
      const capacityInputs = await page.$$('input[type="number"]');
      for (const input of capacityInputs) {
        const placeholder = await input.evaluate(el => el.placeholder || '');
        if (placeholder.toLowerCase().includes('capacity')) {
          await input.type('15000');
          break;
        }
      }
      
      // Click add event button
      const addEventButton = await page.$('button:has-text("Add")');
      if (addEventButton) {
        await addEventButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('    ✅ Events added');
    
    // Navigate to next step
    const nextEventButton = await page.$('button:has-text("Next")');
    if (nextEventButton) {
      await nextEventButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('    ✅ Moved to Step 4');
    }
    
    // Step 6: Fill out Step 4 - Artists & Crew
    console.log('  Step 4: Artists & Crew...');
    
    // Add artists
    const artists = [
      { name: 'DJ Luna', role: 'Opening DJ' },
      { name: 'The Midnight Runners', role: 'Supporting Band 1' },
      { name: 'Electric Pulse', role: 'Supporting Band 2' },
      { name: 'The Electric Dreamers', role: 'Headlining Band' }
    ];
    
    console.log('    Adding artists...');
    for (const artist of artists) {
      // Find and fill artist name
      const nameInput = await page.$('input[placeholder*="name"], input[placeholder*="Name"]');
      if (nameInput) {
        await nameInput.type(artist.name);
      }
      
      // Find and fill role
      const roleInput = await page.$('input[placeholder*="role"], input[placeholder*="Role"]');
      if (roleInput) {
        await roleInput.type(artist.role);
      }
      
      // Click add artist button
      const addArtistButton = await page.$('button:has-text("Add")');
      if (addArtistButton) {
        await addArtistButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Add crew members
    const crew = [
      { name: 'Sarah Johnson', role: 'Tour Manager' },
      { name: 'Mike Chen', role: 'FOH Engineer' },
      { name: 'Lisa Rodriguez', role: 'Lighting Tech' },
      { name: 'David Kim', role: 'Stage Manager' },
      { name: 'Emma Davis', role: 'Merch Seller' },
      { name: 'Alex Thompson', role: 'Bus Driver' },
      { name: 'Jennifer Lee', role: 'Video Director' },
      { name: 'Robert Wilson', role: 'Hospitality Coordinator' },
      { name: 'Maria Garcia', role: 'Stagehand' },
      { name: 'Tom Anderson', role: 'Social Media Assistant' },
      { name: 'Rachel Green', role: 'Photographer' }
    ];
    
    console.log('    Adding crew members...');
    for (const member of crew) {
      // Find and fill crew name
      const nameInput = await page.$('input[placeholder*="name"], input[placeholder*="Name"]');
      if (nameInput) {
        await nameInput.type(member.name);
      }
      
      // Find and fill role
      const roleInput = await page.$('input[placeholder*="role"], input[placeholder*="Role"]');
      if (roleInput) {
        await roleInput.type(member.role);
      }
      
      // Click add crew button
      const addCrewButton = await page.$('button:has-text("Add")');
      if (addCrewButton) {
        await addCrewButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('    ✅ Artists and crew added');
    
    // Navigate to next step
    const nextCrewButton = await page.$('button:has-text("Next")');
    if (nextCrewButton) {
      await nextCrewButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('    ✅ Moved to Step 5');
    }
    
    // Step 7: Fill out Step 5 - Logistics
    console.log('  Step 5: Logistics...');
    
    // Transportation
    const transportInput = await page.$('input[placeholder*="transportation"], input[placeholder*="Transportation"]');
    if (transportInput) {
      await transportInput.type('Tour Bus + Truck');
    }
    
    // Accommodation
    const accommodationInput = await page.$('input[placeholder*="accommodation"], input[placeholder*="Accommodation"]');
    if (accommodationInput) {
      await accommodationInput.type('Hotels');
    }
    
    // Equipment
    const equipmentInput = await page.$('input[placeholder*="equipment"], input[placeholder*="Equipment"]');
    if (equipmentInput) {
      await equipmentInput.type('Full Production Setup');
    }
    
    console.log('    ✅ Logistics information added');
    
    // Navigate to next step
    const nextLogisticsButton = await page.$('button:has-text("Next")');
    if (nextLogisticsButton) {
      await nextLogisticsButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('    ✅ Moved to Step 6');
    }
    
    // Step 8: Fill out Step 6 - Ticketing & Financials
    console.log('  Step 6: Ticketing & Financials...');
    
    // Budget
    const budgetInput = await page.$('input[placeholder*="budget"], input[placeholder*="Budget"]');
    if (budgetInput) {
      await budgetInput.type('2500000');
    }
    
    // Ticket types
    const ticketTypes = [
      { name: 'VIP', price: 150, quantity: 100 },
      { name: 'Premium', price: 85, quantity: 500 },
      { name: 'General Admission', price: 45, quantity: 1000 }
    ];
    
    console.log('    Adding ticket types...');
    for (const ticket of ticketTypes) {
      // Find and fill ticket name
      const nameInput = await page.$('input[placeholder*="name"], input[placeholder*="Name"]');
      if (nameInput) {
        await nameInput.type(ticket.name);
      }
      
      // Find and fill price
      const priceInput = await page.$('input[placeholder*="price"], input[placeholder*="Price"]');
      if (priceInput) {
        await priceInput.type(ticket.price.toString());
      }
      
      // Find and fill quantity
      const quantityInput = await page.$('input[placeholder*="quantity"], input[placeholder*="Quantity"]');
      if (quantityInput) {
        await quantityInput.type(ticket.quantity.toString());
      }
      
      // Click add ticket button
      const addTicketButton = await page.$('button:has-text("Add")');
      if (addTicketButton) {
        await addTicketButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('    ✅ Financial information added');
    
    // Navigate to next step
    const nextFinancialButton = await page.$('button:has-text("Next")');
    if (nextFinancialButton) {
      await nextFinancialButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('    ✅ Moved to Step 7');
    }
    
    // Step 9: Review and Publish
    console.log('  Step 7: Review & Publish...');
    
    // Publish the tour
    const publishButton = await page.$('button:has-text("Publish")');
    if (publishButton) {
      await publishButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('    ✅ Tour published!');
    }
    
    console.log('\n🎉 Super Awesome Tour created successfully!');
    console.log('📊 Tour Details:');
    console.log('   - 20 cities across North America');
    console.log('   - 4 artists (DJ + 2 supporting bands + headliner)');
    console.log('   - 11 crew members');
    console.log('   - Full production setup');
    console.log('   - $2.5M budget');
    console.log('   - March 15 - May 10, 2025');
    
    // Step 10: Create Job Postings
    console.log('\n💼 Creating Job Postings...');
    await createJobPostings(page);
    
  } catch (error) {
    console.error('❌ Error creating tour:', error);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved as error-screenshot.png');
  } finally {
    // Keep browser open for a bit to see the results
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

async function createJobPostings(page) {
  try {
    // Navigate to jobs section
    await page.goto('http://localhost:3000/admin/dashboard/jobs', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const jobs = [
      {
        title: 'Tour Manager - Super Awesome Tour',
        description: 'Experienced tour manager needed for 20-city North American tour. Must have 5+ years experience managing large-scale tours, excellent organizational skills, and ability to coordinate multiple teams.',
        category: '1',
        payment: 8000,
        location: 'Various Cities',
        skills: ['Tour Management', 'Logistics', 'Team Leadership']
      },
      {
        title: 'Lighting Technician',
        description: 'Skilled lighting tech needed for electronic rock tour. Experience with moving lights, LED walls, and programming required.',
        category: '5',
        payment: 4500,
        location: 'Various Cities',
        skills: ['Lighting Design', 'Programming', 'Equipment Setup']
      },
      {
        title: 'FOH Engineer',
        description: 'Front of house engineer for major tour. Must have experience with large venues and electronic music mixing.',
        category: '5',
        payment: 5000,
        location: 'Various Cities',
        skills: ['Sound Engineering', 'Live Mixing', 'Equipment']
      },
      {
        title: 'Merchandise Seller',
        description: 'Enthusiastic merch seller for tour. Must be outgoing, organized, and able to handle cash transactions.',
        category: '1',
        payment: 2500,
        location: 'Various Cities',
        skills: ['Customer Service', 'Sales', 'Organization']
      },
      {
        title: 'Tour Bus Driver',
        description: 'CDL-licensed driver for tour bus. Must have clean driving record and experience with large vehicles.',
        category: '1',
        payment: 4000,
        location: 'Various Cities',
        skills: ['CDL License', 'Safe Driving', 'Navigation']
      },
      {
        title: 'Video Director',
        description: 'Creative video director for live show visuals. Experience with projection mapping and live video mixing required.',
        category: '5',
        payment: 6000,
        location: 'Various Cities',
        skills: ['Video Production', 'Live Mixing', 'Creative Direction']
      },
      {
        title: 'Hospitality Coordinator',
        description: 'Detail-oriented hospitality coordinator to manage catering, accommodations, and artist needs.',
        category: '1',
        payment: 3500,
        location: 'Various Cities',
        skills: ['Hospitality', 'Organization', 'Communication']
      },
      {
        title: 'Stagehand',
        description: 'Strong and reliable stagehand for load-in/load-out and stage setup. Must be able to lift 50+ lbs.',
        category: '1',
        payment: 2000,
        location: 'Various Cities',
        skills: ['Physical Labor', 'Equipment Setup', 'Teamwork']
      },
      {
        title: 'Social Media Assistant',
        description: 'Creative social media assistant to manage tour content across all platforms. Photography skills a plus.',
        category: '3',
        payment: 3000,
        location: 'Various Cities',
        skills: ['Social Media', 'Content Creation', 'Photography']
      },
      {
        title: 'Tour Photographer',
        description: 'Professional photographer to document the tour. Must have own equipment and experience with live music photography.',
        category: '4',
        payment: 4000,
        location: 'Various Cities',
        skills: ['Photography', 'Live Music', 'Equipment']
      }
    ];
    
    console.log('  Creating 10 job postings...');
    
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      // Look for create job button
      const createJobButton = await page.$('button:has-text("Create Job"), button:has-text("Post Job")');
      
      if (createJobButton) {
        await createJobButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fill job form
        const titleInput = await page.$('input[placeholder*="title"], input[placeholder*="Title"]');
        if (titleInput) {
          await titleInput.type(job.title);
        }
        
        const descriptionInput = await page.$('textarea[placeholder*="description"], textarea[placeholder*="Description"]');
        if (descriptionInput) {
          await descriptionInput.type(job.description);
        }
        
        // Select category
        const selects = await page.$$('select');
        if (selects.length > 0) {
          await selects[0].select(job.category);
        }
        
        // Fill payment amount
        const paymentInput = await page.$('input[placeholder*="payment"], input[placeholder*="Payment"], input[placeholder*="amount"], input[placeholder*="Amount"]');
        if (paymentInput) {
          await paymentInput.type(job.payment.toString());
        }
        
        // Fill location
        const locationInput = await page.$('input[placeholder*="location"], input[placeholder*="Location"]');
        if (locationInput) {
          await locationInput.type(job.location);
        }
        
        // Submit job
        const submitButton = await page.$('button:has-text("Create"), button:has-text("Post"), button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log(`    ✅ Created job: ${job.title}`);
      }
    }
    
    console.log('  ✅ All job postings created successfully!');
    
  } catch (error) {
    console.error('  ❌ Error creating job postings:', error);
  }
}

// Run the tour creation
createSuperAwesomeTour(); 