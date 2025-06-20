# Profile Separation and Data Consistency Fix

## Issue Resolved

The artist dashboard was showing "K" (from Kyle's email) instead of the updated stage name because:

1. **Field Name Inconsistency**: Database used `artist_name` but UI components looked for `stage_name`
2. **Data Mixing**: Profile data wasn't properly separated between account types
3. **Missing Data Validation**: No enforcement of proper field access per account type

## Changes Made

### 1. UI Field Mapping Fix

**Before**: UI components accessed undefined `profile?.stage_name`
```tsx
// ❌ Wrong - this field doesn't exist
{profile?.stage_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
Welcome back, {profile?.stage_name || 'Artist'}!
```

**After**: UI components now correctly access `profile?.artist_name`
```tsx
// ✅ Correct - matches database field
{profile?.artist_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
Welcome back, {profile?.artist_name || 'Artist'}!
```

### 2. Files Updated

- `app/artist/page.tsx` - Main dashboard avatar and welcome message
- `app/artist/dashboard-optimized.tsx` - Optimized dashboard
- `app/artist/profile/page.tsx` - Profile editing (already correct)

### 3. Profile Data Separation

Created `supabase/profile-separation-fix.sql` with:

#### New Functions:
- `get_profile_data(user_id, account_type)` - Returns only relevant profile data
- `update_profile_data(user_id, account_type, data)` - Updates with field validation
- `ensure_profile_exists(user_id, account_type, initial_data)` - Creates profiles as needed

#### Data Separation Rules:
- **Artist profiles**: Only `artist_name`, `bio`, `genres`, `social_links`, etc.
- **Venue profiles**: Only `venue_name`, `description`, `venue_type`, `capacity`, etc.
- **General profiles**: Only `full_name`, `bio`, `location`, etc.

### 4. Database Schema Consistency

**Artist Profile Fields** (correct mapping):
```sql
artist_profiles:
  - artist_name (not stage_name)
  - bio
  - genres (array, not singular genre)
  - social_links (jsonb)
  - verification_status
  - account_tier
```

**UI Form Mapping**:
```tsx
// Form field -> Database field
stage_name -> artist_name
genre -> genres[0] (first genre from array)
```

## Security Improvements

### Row Level Security (RLS)
- Users can only access their own profile data
- Proper INSERT/UPDATE/SELECT policies per table
- Account type validation in update functions

### Field Validation
- Artist updates only affect artist_profiles table
- Venue updates only affect venue_profiles table  
- No cross-contamination of profile data

## Benefits

1. **Consistent Display**: Avatar and names now show correctly across all artist pages
2. **Data Integrity**: Profile types are properly separated and validated
3. **Security**: RLS ensures users only access their own data
4. **Maintainability**: Clear field mapping and validation rules

## Usage

### Frontend (React/TypeScript)
```tsx
// Artist context automatically handles field mapping
const { profile } = useArtist()
console.log(profile?.artist_name) // ✅ Correct
```

### Backend (SQL Functions)
```sql
-- Get artist-specific data only
SELECT get_profile_data('user-id', 'artist');

-- Update with validation
SELECT update_profile_data('user-id', 'artist', '{"artist_name": "New Name"}');
```

## Testing

1. Update your stage name in `/artist/profile`
2. Navigate to `/artist` dashboard
3. Verify avatar shows first letter of your stage name
4. Verify welcome message shows your stage name
5. Check that only artist-specific fields are displayed/editable

## Migration Notes

- Existing artist profiles are preserved
- No data loss during the fix
- Automatic profile creation for new users
- Backward compatible with existing UI components 