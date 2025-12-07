# Shared Wishlist Application - Design Guidelines

## Design Approach
**Reference-Based:** Inspired by modern romantic web applications like Pinterest and mood board platforms, with a unique illustrated aesthetic. Dark theme interface with vibrant pink accents creating an intimate, dreamy atmosphere.

## Color System
- **Background:** Deep charcoal/near-black (#1a1a1a to #0f0f0f)
- **Surface:** Slightly lighter dark gray (#252525 to #2a2a2a) for cards
- **Primary Accent:** Vibrant pink (#FF1E8C) for buttons, badges, active states
- **Secondary Accent:** Magenta/purple tones for secondary actions
- **Text Primary:** White/off-white (#ffffff to #f5f5f5)
- **Text Secondary:** Light gray (#9ca3af to #d1d5db)
- **Success:** Soft green for completed items
- **Borders:** Subtle dark borders (#333333 to #404040)

## Typography
- **Hero Title:** Large, bold sans-serif (4xl to 6xl), white, centered below animated icon
- **Section Headings:** Bold, 2xl to 3xl weight
- **Wish Card Titles:** Semibold, lg to xl
- **Body Text:** Regular weight, base to sm
- **Font Stack:** System fonts (Inter, SF Pro, Segoe UI) for modern, clean appearance

## Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16, 24 for consistent rhythm

**Container Structure:**
- Max width: 7xl (1280px) with horizontal padding
- Hero section: Full-width with centered content
- Main content: Grid layout with responsive columns

## Hero Section
**Illustrated Cherry Blossom Forest:**
- Full-width illustrated header featuring stylized pink cherry blossom trees against deep purple/dark gradient sky
- Centered animated icon above title (pink sparkle/heart with gentle pulse/float animation)
- White title text: "Shared Wishlist" or custom title
- Subtitle with user names and progress indicator ("Draven & Clairine • X wishes fulfilled")
- Ethereal, romantic atmosphere with soft lighting

## Component Library

### Filter Pills
- Horizontal scrollable row of rounded pill buttons
- Active state: Pink background with white text
- Inactive: Dark background with gray text, subtle border
- Include category icons and user avatars within pills
- Smooth hover transitions

### Wish Cards
- Grid layout: 1 column mobile, 2-3 columns tablet, 3-4 columns desktop
- Dark background with subtle border and rounded corners (lg)
- Card image at top with aspect ratio 16:9 or 4:3, rounded top corners
- Overlay badges in top corners: category badge (left), owner badge (right)
- Card content padding (p-4 to p-6): title, description preview, priority indicator
- Bottom action buttons: "Complete" (pink) and delete/edit icons
- Completed state: Semi-transparent overlay, checkmark, "Restore" button
- Subtle hover elevation effect

### Modal Dialogs
- Centered overlay with backdrop blur/darken
- Dark surface with rounded corners (xl)
- Pink header bar with close button
- Form fields with dark inputs, pink focus rings
- Image upload area with preview
- Dropdown selects for category, priority, owner
- Pink submit button, gray cancel button

### Progress Indicator
- Displayed in hero section below title
- "X of Y wishes fulfilled" with optional progress bar
- Pink accent color for completed portion

### Search Bar
- Prominent placement below filters
- Dark background with subtle border
- Search icon prefix, clear button suffix
- Pink focus state

## Badges & Labels
- **Category Badges:** Small, rounded, colored background with icon
- **Priority Indicators:** Color-coded (High: red, Medium: yellow, Low: green)
- **Owner Badges:** Small avatar circles with name or initials

## Animations
- **Hero Icon:** Continuous gentle pulse (scale 1 to 1.1) and float (translate Y -4px to 4px), 3-4 second duration, ease-in-out
- **Card Hover:** Subtle lift (translateY -2px) with shadow increase
- **Button Interactions:** Standard smooth transitions
- **Modal Entry:** Fade in with scale from 0.95 to 1

## Accessibility
- Maintain WCAG AA contrast ratios (white text on dark backgrounds meets this)
- Focus indicators on all interactive elements (pink ring)
- Keyboard navigation support
- Alt text for all wish images

## Images
**Hero Section:** Large illustrated header image featuring cherry blossom forest scene with pink trees, deep purple/dark gradient sky, ethereal lighting. This sets the romantic, dreamy tone.

**Wish Card Images:** User-uploaded images for each wish item (products, travel destinations, movie posters, etc.). Each card features a prominent image at the top.

## Responsive Behavior
- **Mobile (< 768px):** Single column grid, stacked filters with horizontal scroll
- **Tablet (768px - 1024px):** 2-column grid, compact filter layout
- **Desktop (> 1024px):** 3-4 column grid, full filter row display