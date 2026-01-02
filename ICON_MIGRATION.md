# Icon Migration to react-icons

All custom icons have been replaced with react-icons from Heroicons (hi) package.

## Installation Required

Run this command to install react-icons:
```bash
yarn add react-icons
```

## Icon Mappings

The following icons have been mapped to react-icons:

- `SearchIcon` → `HiSearch`
- `PlusIcon` → `HiPlus`
- `SettingsIcon` → `HiCog`
- `PhoneIcon` → `HiPhone`
- `VideoIcon` → `HiVideoCamera`
- `MoreIcon` → `HiDotsVertical`
- `SendIcon` → `HiPaperAirplane`
- `EmojiIcon` → `HiEmojiHappy`
- `AttachmentIcon` → `HiPaperClip`
- `MicIcon` → `HiMicrophone`
- `CheckIcon` → `HiCheck`
- `DoubleCheckIcon` → `HiCheckCircle`
- `ArrowLeftIcon` → `HiArrowLeft`
- `PinIcon` → `HiLocationMarker`
- `ArchiveIcon` → `HiArchive`

## Files Updated

All imports remain the same - they still import from `@/app/components/ui/icons`, but now that file re-exports from react-icons.

No changes needed to component files - they will work once react-icons is installed.

