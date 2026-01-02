// Color utility classes that map to Tailwind classes
// Use these in className strings for consistent theming

export const colors = {
  background: "bg-background",
  foreground: "bg-foreground",
  surface: "bg-surface",
  surfaceElevated: "bg-surface-elevated",
  border: "border-border",
  borderLight: "border-border-light",
  primary: "bg-primary",
  primaryHover: "bg-primary-hover",
  primaryLight: "bg-primary-light",
  textPrimary: "text-primary",
  textSecondary: "text-secondary",
  textTertiary: "text-tertiary",
  textInverse: "text-inverse",
  online: "bg-online",
  offline: "bg-offline",
  error: "bg-error",
  success: "bg-success",
  messageSent: "bg-message-sent",
  messageReceived: "bg-message-received",
  messageSentText: "text-message-sent-text",
  messageReceivedText: "text-message-received-text",
} as const;

