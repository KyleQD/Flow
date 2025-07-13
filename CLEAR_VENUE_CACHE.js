// =============================================================================
// CLEAR VENUE CACHE SCRIPT
// Run this in your browser console after cleaning up orphaned venues
// =============================================================================

console.log('🧹 Clearing venue cache and refreshing account data...');

// Clear venue service cache
if (window.venueService) {
  window.venueService.clearCache();
  window.venueService.clearActiveVenueId();
  console.log('✅ Venue service cache cleared');
}

// Clear session storage
sessionStorage.removeItem('active_venue_id');
console.log('✅ Session storage cleared');

// Clear local storage related to venues
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('venue') || key.includes('account'))) {
    keysToRemove.push(key);
  }
}
keysToRemove.forEach(key => localStorage.removeItem(key));
console.log('✅ Local storage cleared');

// Refresh the page to get fresh data
console.log('🔄 Refreshing page to load fresh data...');
setTimeout(() => {
  window.location.reload();
}, 1000);

console.log('✅ Cache clearing complete! Page will refresh in 1 second...'); 