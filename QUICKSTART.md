# Quick Start Guide

## Running the Application

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Start development server:**
   ```bash
   yarn dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

## Key Routes

- **`/`** - Main chat list (home page)
- **`/auth/login`** - Login screen
- **`/auth/signup`** - Signup screen
- **`/auth/otp`** - OTP verification
- **`/auth/profile-setup`** - Profile setup after signup
- **`/chat`** - Chat conversation view
- **`/contacts`** - Contact list
- **`/groups/new`** - Create new group
- **`/settings`** - Settings menu
- **`/settings/profile`** - Edit profile
- **`/examples`** - View all screens

## Design Tokens

All design tokens are defined in `app/globals.css` using CSS variables. The application automatically supports light and dark modes based on system preference.

### Key CSS Variables

```css
--primary: #0084ff
--background: #ffffff (light) / #0f1419 (dark)
--text-primary: #111827 (light) / #e5e7eb (dark)
--surface-elevated: #ffffff (light) / #24292e (dark)
```

## Component Usage

### Basic Button
```tsx
import { Button } from "@/app/components/ui/button";

<Button variant="primary" size="md">Click me</Button>
```

### Avatar
```tsx
import { Avatar } from "@/app/components/ui/avatar";

<Avatar name="John Doe" size="md" online={true} />
```

### Input
```tsx
import { Input } from "@/app/components/ui/input";

<Input label="Email" type="email" placeholder="Enter email" />
```

## Customization

To customize colors, edit the CSS variables in `app/globals.css`. The application will automatically use the new colors throughout.

## Notes

- All components use CSS variables for theming
- Dark mode is automatic based on system preference
- The UI is fully responsive
- Mock data is used for demonstration

