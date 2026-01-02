# Chert - Modern Chat Application UI

A full-featured, modern chat application UI built with Next.js, React, and Tailwind CSS. Inspired by WhatsApp, Telegram, Discord, and iMessage.

## 🎨 Features

### Visual Design
- ✅ Clean, minimal, and modern aesthetic
- ✅ Light and dark mode support (automatic based on system preference)
- ✅ Rounded corners, soft shadows, subtle gradients
- ✅ Smooth micro-interactions and animations
- ✅ Inter font family for a polished look
- ✅ Fully responsive design (mobile, tablet, desktop)

### Screens Implemented

#### 1. Authentication
- ✅ **Login Screen** (`/auth/login`) - Email/phone + password, social login
- ✅ **Signup Screen** (`/auth/signup`) - User registration
- ✅ **OTP Verification** (`/auth/otp`) - 6-digit code input
- ✅ **Profile Setup** (`/auth/profile-setup`) - Avatar, username, status

#### 2. Chat Interface
- ✅ **Chat List** (`/`) - List of conversations with search, pinned chats
- ✅ **Conversation** (`/chat`) - Message bubbles, read receipts, reactions
- ✅ **Message Input** - Text, emoji, attachments, voice notes

#### 3. Calls
- ✅ **Incoming Call** - Accept/decline interface
- ✅ **Ongoing Call** - Voice and video call UI with controls

#### 4. Contacts & Groups
- ✅ **Contact List** (`/contacts`) - Alphabetical contact list with search
- ✅ **New Group** (`/groups/new`) - Group creation with member selection

#### 5. Settings
- ✅ **Settings List** (`/settings`) - All settings categories
- ✅ **Profile Settings** (`/settings/profile`) - Edit profile information

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Yarn or npm

### Installation

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
app/
├── auth/                    # Authentication screens
│   ├── login/
│   ├── signup/
│   ├── otp/
│   └── profile-setup/
├── components/
│   ├── chat/                # Chat components
│   │   ├── chat-list.tsx
│   │   ├── conversation.tsx
│   │   ├── message-bubble.tsx
│   │   └── message-input.tsx
│   ├── calls/               # Call components
│   │   ├── incoming-call.tsx
│   │   └── ongoing-call.tsx
│   ├── contacts/            # Contact components
│   │   └── contact-list.tsx
│   ├── groups/              # Group components
│   │   ├── group-chat.tsx
│   │   └── new-group.tsx
│   ├── settings/            # Settings components
│   │   ├── profile.tsx
│   │   └── settings-list.tsx
│   └── ui/                  # Reusable UI components
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── icon-button.tsx
│       ├── input.tsx
│       ├── icons.tsx
│       ├── skeleton.tsx
│       └── theme-toggle.tsx
├── lib/                     # Utilities
│   ├── utils.ts
│   └── colors.ts
├── globals.css              # Global styles and design tokens
└── layout.tsx               # Root layout

```

## 🎨 Design System

### Color Tokens

The application uses CSS variables for theming, defined in `globals.css`:

- **Background**: `--background`, `--surface`, `--surface-elevated`
- **Primary**: `--primary`, `--primary-hover`, `--primary-light`
- **Text**: `--text-primary`, `--text-secondary`, `--text-tertiary`
- **Status**: `--online`, `--offline`, `--typing`
- **Messages**: `--message-sent`, `--message-received`

### Typography

- **Font Family**: Inter (loaded from Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Spacing & Radius

- Consistent spacing scale using Tailwind's default
- Rounded corners: `--radius-sm` to `--radius-full`

## 📱 Responsive Design

The application is fully responsive:

- **Mobile**: Single column layout, chat list hidden when conversation is open
- **Tablet**: Side-by-side layout with adjustable widths
- **Desktop**: Full two-panel layout with chat list and conversation

## 🌙 Dark Mode

Dark mode is automatically enabled based on system preference. The theme can be toggled using the `ThemeToggle` component.

## 🧩 Components

### UI Components

- **Avatar** - User avatars with online status
- **Button** - Primary, secondary, ghost, danger variants
- **Input** - Text inputs with labels and error states
- **Badge** - Notification badges and labels
- **IconButton** - Icon-only buttons
- **Skeleton** - Loading placeholders

### Chat Components

- **ChatList** - List of conversations with search
- **Conversation** - Chat interface with messages
- **MessageBubble** - Individual message display
- **MessageInput** - Message composition area

## 🎯 Usage Examples

### View All Screens

Visit `/examples` to see a list of all available screens.

### Navigation

- Home/Chat List: `/`
- Login: `/auth/login`
- Signup: `/auth/signup`
- OTP: `/auth/otp`
- Profile Setup: `/auth/profile-setup`
- Chat: `/chat`
- Contacts: `/contacts`
- New Group: `/groups/new`
- Settings: `/settings`
- Profile: `/settings/profile`

## 🔧 Customization

### Changing Colors

Edit the CSS variables in `app/globals.css`:

```css
:root {
  --primary: #0084ff;
  --primary-hover: #0066cc;
  /* ... */
}
```

### Adding New Components

1. Create component in `app/components/`
2. Use existing UI components from `app/components/ui/`
3. Follow the design system tokens

## 📝 Notes

- This is a UI-only implementation. Backend integration would be needed for full functionality.
- Mock data is used throughout for demonstration purposes.
- All components are client-side rendered for interactivity.

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Formik + Yup** - Form handling and validation

## 📄 License

This project is open source and available for use.

---

Built with ❤️ for modern chat applications
