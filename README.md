# vCard Creator Tool

A beautiful, modern vCard creation tool for DonorElevate clients.

![vCard Creator](./preview.png)

## Features

- 📸 **Photo Upload** - Add a profile photo with live preview
- 📝 **Complete Contact Info** - Name, title, organization, phones, emails
- 🌐 **Social Links** - Website, LinkedIn, Twitter/X
- 📍 **Address Support** - Full address with optional fields
- 👀 **Live Preview** - See your vCard update as you type
- 📥 **Download .vcf** - Generate downloadable vCard file
- 📱 **QR Code** - Scan to instantly add contact
- 📋 **Copy to Clipboard** - Quick share vCard data
- 🎨 **Beautiful UI** - Purple/teal gradients, smooth animations
- 📱 **Mobile-First** - Fully responsive design

## Tech Stack

- ⚡ Vite
- ⚛️ React 19
- 📘 TypeScript
- 🎨 Tailwind CSS 4
- 📦 qrcode.react
- 🎯 lucide-react icons

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Deploy to Vercel, Netlify, or any static hosting:

```bash
npm run build
# Deploy the `dist` folder
```

### Recommended: Deploy to Vercel

1. Connect repo to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy to: `vcard.donorelevate.com`

## vCard Format

Generates standard vCard 3.0 format compatible with:
- iOS Contacts
- Android Contacts
- Outlook
- Gmail
- macOS Contacts

## License

MIT © DonorElevate
