# Rahasya - Zero Trust Password Manager

A completely offline, browser-based password manager that prioritizes security and privacy. रहस्य (Rahasya) means "secret" or "mystery" in Sanskrit.

🔗 **Try it now**: [https://rahasya.vyoma.workers.dev/](https://rahasya.vyoma.workers.dev/)

## Key Principles

### 🔒 Zero Trust & Zero Storage

- **No Storage Service**: Rahasya doesn't store your data anywhere - it only encrypts and gives you the file
- **Storage Freedom**: Store your encrypted files wherever you want (cloud, local drive, USB)
- **Complete Control**: You own your data and decide where it lives
- **Zero Trust**: Works completely offline, no server communication ever

### 🔐 Core Security Features

- Client-side encryption using AES-GCM
- Two-level key derivation for enhanced security
- Optional Additional Authenticated Data (AAD) support
- No data persistence - everything stays in memory

## Features

### 🛠️ Key Tools

1. **Password Manager**

   - Encrypt and store passwords/credentials
   - Secure file format for credential storage
   - Password strength analysis
   - Two-way file encryption support

2. **Password Generator**

   - Configurable password generation
   - Support for various character sets
   - Real-time password strength feedback
   - Copy to clipboard functionality

3. **Utility Tools**
   - Base64 encoder/decoder
   - SHA hash generator
   - File encryption/decryption

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/Amit-karn/rahasya.git

# Navigate to project directory
cd rahasya

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## How It Works

1. **Encryption**

   - Enter your secrets
   - Set a master key
   - Add your secrets
   - Generate & Download encrypted file
   - Store the file wherever you want (Dropbox, Google Drive, USB, etc.)

2. **Decryption**
   - Upload your file, generated while encryption
   - Enter master key
   - View your secrets
   - File never leaves your browser

### Storage Options

You can store your encrypted files:

- On cloud services (Dropbox, Google Drive, iCloud)
- On local hard drives
- On USB drives
- On network storage
- Any storage medium of your choice

## How to Use

### Password Manager

1. **Setting Up**

   - Add a master key (16-32 characters)
   - Select iteration count (higher = more secure but slower)
   - Generate new file or upload existing

2. **Adding Secrets**

   - Click "Add Secret" button
   - Enter secret details
   - Optionally add AAD for extra security
   - Save and download encrypted file

3. **Accessing Secrets**
   - Open decryption mode
   - Upload encrypted file
   - Enter master key
   - View or copy individual secrets

### File Encryption

1. Select file to encrypt
2. Enter encryption key
3. Download encrypted file
4. Use same key to decrypt later

## Security Best Practices

1. **Master Key**

   - Use strong, unique password
   - Don't reuse master keys
   - Consider higher iteration counts

2. **File Management**

   - Keep secure backups of encrypted files
   - Don't share master keys
   - Use AAD when possible

3. **General**
   - Use HTTPS in production
   - Clear clipboard after copying secrets
   - Close browser after use

## Technical Stack

- React + Vite
- Material-UI
- Web Crypto API
- PWA Support

## Development Notes

### Directory Structure

```
src/
  ├── components/    # UI components
  ├── containers/    # Page containers
  ├── utils/        # Cryptographic utilities
  ├── config/       # Configuration files
  └── assets/       # Static assets
```

### Build Configuration

- Uses Vite for fast builds
- PWA support included
- ESLint configured
- Development and production modes

## Security Considerations

- Uses Web Crypto API for cryptographic operations
- Implements secure PBKDF2 key derivation
- Memory cleanup after operations
- Non-extractable keys for encryption
- Client-side only, no server communication
- No built-in storage - you control where your data lives

## License

MIT

---

For technical documentation and API details, see Rahasya_Encryption_Process_Documentation.md
