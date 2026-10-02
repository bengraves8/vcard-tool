# vCard Creator Tool

A beautiful, modern vCard creation tool for DonorElevate clients.

![vCard Creator](./preview.png)

## Features

- 📸 **Photo Upload** - Add a profile photo with live preview
- 📝 **Complete Contact Info** - Name, title, organization, phones, emails
- 🌐 **Social Links** - Add, remove, and rename links (Website, LinkedIn, Twitter/X, booking pages, and more)
- 📍 **Address Support** - Full address with an optional second line for apartments, suites, or buildings
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

## Named links and second address line

Before deploying this version, apply `supabase/migrations/20261002143612_address_line_two_and_named_links.sql` to the database. It adds `links` and `address_line2` without changing existing cards. Older cards use their existing website/social fields until edited; an empty links array preserves an intentional removal of all links.

The editor, shared contact pages, and vCard downloads use these fields. Custom vCard link labels use the `X-ABLabel` extension; some contact apps may display a generic URL label instead.

Run export and backward-compatibility checks with `node --test tests/vcard.test.mjs`.
