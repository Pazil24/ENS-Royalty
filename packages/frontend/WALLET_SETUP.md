# Wallet Connect Setup

## Getting Your Project ID

1. Go to [Reown Dashboard](https://dashboard.reown.com/)
2. Create a new project or select an existing one
3. Copy your Project ID
4. Open `packages/frontend/.env.local`
5. Replace `your_project_id_here` with your actual Project ID

## Features Implemented

✅ **Wallet Connection**: Fully functional wallet connect button using Reown AppKit  
✅ **ENS Name Display**: Automatically fetches and displays ENS names when available  
✅ **Multi-Network Support**: Configured for both Mainnet and Sepolia  
✅ **SSR Support**: Proper server-side rendering with cookie storage  
✅ **Structured Implementation**: All configs in `lib/` folder following your existing structure

## File Structure

```
packages/frontend/
├── lib/
│   ├── config/
│   │   └── wagmi.ts          # Wagmi configuration
│   └── context/
│       └── appkit-provider.tsx # AppKit context provider
├── components/
│   └── app/
│       └── header.tsx         # Updated with real wallet connection
├── app/
│   └── layout.tsx            # Wrapped with AppKit provider
└── .env.local                # Your project ID goes here
```

## How It Works

1. **AppKit Provider** wraps your entire app in `app/layout.tsx`
2. **Wagmi Config** is set up in `lib/config/wagmi.ts` with Mainnet and Sepolia
3. **AppHeader Component** uses:
   - `useAccount()` - Get connected wallet address
   - `useEnsName()` - Fetch ENS name from Mainnet
   - `useAppKit()` - Open wallet connection modal
4. **ENS Name Priority**: Shows ENS name if available, otherwise shows shortened address

## Running the App

```bash
cd packages/frontend
pnpm dev
```

Make sure to add your Project ID to `.env.local` before running!
