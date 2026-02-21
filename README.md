# Local Password Vault

Local-only password manager built with Electron + React.

## Features
- Master password setup/unlock (scrypt-based key derivation)
- Encrypted local vault storage (`vault.json` in Electron userData)
- Add/edit/delete password entries (`title`, optional `note`, `password`)
- Search by title/note
- Korean/English UI (auto locale detection + manual switch)
- Light/Dark/System theme mode

## Tech Stack
- Electron + electron-vite
- React + TypeScript
- Tailwind + shadcn-style UI components
- `es-toolkit`, `es-hangul`

## Development
```bash
yarn dev
```

## Build
```bash
yarn build
```

## Package
```bash
yarn package
```

Outputs are generated in `dist/`.

## Distribution
- macOS: share `.dmg` or `.zip` from `dist/`
- Windows: build/package on Windows to produce `.exe` installer

## Notes
- This app does not require external API/backend for vault operations.
- In development mode (`yarn dev`), Dock/app naming can differ from packaged app behavior.
