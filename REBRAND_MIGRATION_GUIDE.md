# Flow Platform Rebranding - Migration Guide

## Overview
Complete rebranding from **Tourify** to **Flow** with color scheme change from purple to baby blue.

## Repository Migration
- **Old Repository**: (Current)
- **New Repository**: https://github.com/KyleQD/Flow.git

## Database Migration
- **Action Required**: Duplicate database infrastructure to new Supabase project
- **Steps**:
  1. Create new Supabase project named "Flow"
  2. Export schema from old Tourify project
  3. Import schema to new Flow project
  4. Update environment variables with new Supabase credentials

## Color Scheme Changes

### Purple → Baby Blue Mapping
- **#9333ea** (purple-500) → **#89CFF0** (baby blue)
- **#8b5cf6** (violet-500) → **#89CFF0** (baby blue)  
- **#7c3aed** (purple-600) → **#5DB3E3** (darker baby blue)
- **#6d28d9** (purple-700) → **#4A9FD9** (even darker baby blue)
- **rgba(147, 51, 234, ...)** → **rgba(137, 207, 240, ...)**

### Tailwind Classes
- `purple-*` → `blue-*` or `sky-*`
- `violet-*` → `blue-*` or `sky-*`

## Files Updated

### Core Configuration
- ✅ `package.json` - Name changed to "flow-platform"
- ✅ `app/layout.tsx` - Metadata updated, background gradient changed to baby blue/white
- ✅ `tailwind.config.ts` - Purple glow effects → Baby blue
- ✅ `app/globals.css` - All purple colors → Baby blue, primary CSS variable updated
- ✅ `lib/design-system/theme.ts` - Theme renamed to flowTheme, colors updated
- ✅ `README.md` - Title and description updated

### Components Updated
- ✅ `components/tourify-logo.tsx` - Interface and function renamed to FlowLogo
- ✅ `components/nav.tsx` - TourifyLogo → FlowLogo
- ✅ `app/signup/page.tsx` - TourifyLogo → FlowLogo
- ✅ `app/page.tsx` - Logo path updated
- ✅ `components/layout/app-layout.tsx` - tourifyTheme → flowTheme
- ✅ `components/layout/enhanced-app-layout.tsx` - Loading messages updated
- ✅ `app/admin/dashboard/tours/planner/page.tsx` - Text and colors updated
- ⚠️ Logo component file still needs rename: `tourify-logo.tsx` → `flow-logo.tsx`
- ⚠️ Logo image assets need to be created/updated

### Files Needing Bulk Text Replacement
The following files need manual review and replacement:
- All component files (93+ files reference TourifyLogo)
- All documentation files (markdown)
- Email templates
- Loading screens
- Navigation components

## Text Replacement Rules

### Case-Sensitive Replacements
1. `Tourify` → `Flow`
2. `tourify` → `flow`
3. `TOURIFY` → `FLOW`
4. `TourifyLogo` → `FlowLogo`
5. `tourify-logo` → `flow-logo`
6. `tourifyTheme` → `flowTheme`

### Asset Files
- `/tourify-logo.png` → `/flow-logo.png`
- `/tourify-logo-white.png` → `/flow-logo-white.png`

## Environment Variables
No changes needed - will be set in new Supabase project:
- `NEXT_PUBLIC_SUPABASE_URL` (new project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (new project key)
- `SUPABASE_SERVICE_ROLE_KEY` (new project key)

## Git Repository Setup
```bash
git remote set-url origin https://github.com/KyleQD/Flow.git
```

## Testing Checklist
- [ ] Build succeeds: `npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] All components render correctly
- [ ] Colors display as baby blue (not purple)
- [ ] Logo displays (after assets updated)
- [ ] Database connection works with new Supabase project
- [ ] No console errors related to missing references

## Remaining Tasks
1. Bulk replace "tourify" → "flow" in all code files
2. Update all TourifyLogo imports to FlowLogo
3. Rename logo component file: `tourify-logo.tsx` → `flow-logo.tsx`
4. Create/update logo image assets
5. Update all documentation files
6. Update email templates
7. Update git remote
8. Test thoroughly
9. Deploy to new environment

