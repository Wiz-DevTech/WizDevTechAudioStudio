# 🎙️ WizDevTech Audio Studio

<div align="center">

**Professional AI-powered voice synthesis and cloning platform**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://img.shields.io/badge/License-MIT-blue.svg)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://img.shields.io/badge/Next.js-15-black)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2DE.svg)](https://img.shields.io/badge/Tailwind%20CSS-38B2DE.svg)

</div>

---

## 📖 About

WizDevTech Audio Studio is a modern, full-featured web application for AI-powered text-to-speech (TTS), voice cloning, and multi-speaker conversation generation. Built with cutting-edge technologies and designed for both casual users and professional content creators.

### ✨ Key Features

- **🎤 Text-to-Speech Generation** - Convert text to natural speech with 7 built-in voices
- **🎭 Custom Voice Profiles** - Create and manage personalized voice profiles with detailed descriptions
- **💬 Multi-Speaker Conversations** - Build realistic dialogues with multiple speakers and context
- **📚 Audio Library** - Browse, play, download, and manage all generated audio files
- **🧑 Custom Voice System** - Add your own voices with long descriptions (perfect for AI model guides)
- **⭐ Primary Voice Setting** - Mark any voice as your default for quick access
- **⚡ Advanced Controls** - Adjustable speed (0.5x-2.0x) and volume (0.1-10.0)
- **💾 Persistent Storage** - Custom voices and preferences saved in browser localStorage
- **🎨 Beautiful UI** - Modern, responsive interface built with shadcn/ui components
- **🌙 Dark Mode Ready** - Seamlessly supports light and dark themes

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript development
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - High-quality, accessible components
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful & consistent icon library
- **State Management**: React Hooks (`useState`, `useEffect`, `useRef`)
- **Database**: [Prisma](https://www.prisma.io/) - Modern TypeScript ORM with SQLite
- **Speech SDK**: [z-ai-web-dev-sdk](https://z.ai/) - Professional voice synthesis
- **Form Validation**: Native HTML5 validation
- **Storage**: Browser `localStorage` for custom voices persistence

## 📦 Installation

### Prerequisites

- **Node.js** 18.x or higher
- **Bun**, **npm**, or **yarn** package manager
- **Browser** supporting modern ES6+ features

### Setup Instructions

```bash
# 1. Clone the repository
git clone <repository-url>
cd wizdevtech-audio-studio

# 2. Install dependencies
bun install

# 3. Set up environment variables (if needed)
cp .env.example .env

# 4. Initialize the database
bun run db:push

# 5. Start development server
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🚀 Usage

### Getting Started

1. **Open the application** in your web browser
2. **Navigate to the Text to Speech tab** to start generating speech
3. **Add your custom voice** by clicking "Add Custom Voice" and following the prompts
4. **Paste your AI model guide** (e.g., Sesame CSM 1B installation instructions) in the description field
5. **Generate speech** with your selected voice and settings

### Voice System

The app includes two types of voices:

**Built-in Voices** (7 options):
- TongTong - Warm and friendly
- ChuiChui - Lively and cute
- XiaoChen - Professional and calm
- Jam - British gentleman
- Kazi - Clear and standard
- Douji - Natural and fluent
- LuoDo - Expressive and engaging

**Custom Voices** (Unlimited):
- Click "Add Custom Voice" to create your own
- Choose a base voice engine
- Add detailed name and description
- Set as primary with ⭐ icon
- Delete with × button when no longer needed

### Audio Controls

- **Speed Control**: Adjust playback speed from 0.5x (slow) to 2.0x (fast)
- **Volume Control**: Adjust volume from 0.1 (very quiet) to 10.0 (maximum)
- **Format**: WAV audio files at 24kHz sample rate

## 📁 Project Structure

```
wizdevtech-audio-studio/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── audio/                   # Generated audio files storage
│   └── logo.svg               # Application logo
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── audio-studio/
│   │   │       ├── tts/
│   │   │       │   └── route.ts      # TTS generation API
│   │   │       ├── audio/
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts  # Audio file operations
│   │   │       └── audio-files/
│   │   │       │   └── route.ts  # Audio library API
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main page (Audio Studio)
│   ├── components/
│   │   ├── audio-studio/
│   │   │   ├── tts-generator.tsx       # Text to Speech component
│   │   │   ├── voice-cloning.tsx       # Voice Cloning component
│   │   │   ├── conversation-builder.tsx # Multi-Speaker Conversations component
│   │   │   └── audio-library.tsx        # Audio Library component
│   │   └── ui/                     # shadcn/ui components
│   ├── hooks/
│   │   └── use-toast.ts          # Toast notification hook
│   └── lib/
│       ├── db.ts                 # Prisma client
│       └── utils.ts             # Utility functions
├── .env                        # Environment variables
├── .gitignore                   # Git ignore rules
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                   # This file
```

## 🗄️ Database Schema

The application uses Prisma with SQLite, featuring the following models:

### VoiceProfile
- Custom voice configurations for personalization
- Links to generated audio and conversation segments

### GeneratedAudio
- Stores all generated audio files
- Includes metadata (speed, volume, voice, format, duration)
- Links to voice profiles

### Conversation
- Multi-speaker dialogue configurations
- Contains title, description, and total duration

### ConversationSegment
- Individual dialogue lines
- Links to speaker voice profiles
- Includes transcript and sequence order

## 📚 API Documentation

### `POST /api/audio-studio/tts`

Generate speech from text.

**Request Body:**
```json
{
  "text": "Hello world",
  "voice": "tongtong",
  "speed": 1.0,
  "volume": 1.0
}
```

**Response:** Audio file (WAV format)

### `GET /api/audio-studio/audio-files`

Retrieve list of all generated audio files.

**Query Parameters:**
- `limit` (optional): Number of items to return (default: 50)
- `offset` (optional): Number of items to skip (default: 0)

**Response:** Array of audio file objects

### `GET /api/audio-studio/audio/[id]`

Retrieve a specific audio file.

**Response:** Audio file (WAV format)

### `DELETE /api/audio-studio/audio/[id]`

Delete a specific audio file.

**Response:** `{ "success": true }`

## 🎨 UI Components

The application utilizes shadcn/ui components for a consistent, beautiful interface:

- **Tabs** - Navigation between different features
- **Card** - Content containers with headers and footers
- **Dialog** - Modal dialogs for adding custom voices
- **Textarea** - Multi-line text input with character limits
- **Select** - Voice and setting selection dropdowns
- **Slider** - Continuous value controls for speed and volume
- **Button** - Action buttons with loading states
- **Input** - Text input for names, descriptions, and titles
- **Label** - Form field labels with character counts
- **Badge** - Status indicators and metadata tags
- **ScrollArea** - Scrollable containers for lists
- **Toast** - Non-intrusive notification system
- **Separator** - Visual dividers between content sections

## 🎨 Themes & Styling

The application supports:
- **Light Mode** - Default light color scheme
- **Dark Mode** - Automatic dark mode based on system preferences
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Accessible** - WCAG 2.1 AA compliant with proper contrast ratios

### Color Scheme

- **Primary**: Main action buttons and interactive elements
- **Secondary**: Background elements and cards
- **Muted**: Supporting text and descriptions
- **Destructive**: Error states and delete actions
- **Accent**: Highlights and emphasis

## 🔒 Security

- **Input Validation**: All text inputs are validated for length and content
- **XSS Prevention**: All user-generated content is properly escaped
- **SQL Injection Protection**: Parameterized database queries with Prisma
- **CSRF Protection**: Built-in Next.js API route protections
- **File Upload Limits**: Character limits on all text inputs (1024 characters)

## 🚀 Deployment

### Build for Production

```bash
# Create production build
bun run build

# Start production server
bun start
```

### Environment Variables

Configure the following variables in `.env`:

```env
DATABASE_URL="file:./dev.db"
```

### Deployment Platforms

Compatible with:
- **Vercel** - Recommended for Next.js applications
- **Netlify** - Alternative hosting platform
- **Railway** - Full-stack application deployment
- **Render** - Docker-based deployment
- **Self-hosted** - Any VPS or dedicated server

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create your feature branch
2. **Make your changes** with clear, descriptive commit messages
3. **Test thoroughly** across different browsers and devices
4. **Follow the code style** consistent with existing patterns
5. **Update documentation** as needed for any new features

## 📝 Roadmap

### Planned Features

- [ ] Audio waveform visualization
- [ ] Batch audio generation
- [ ] Voice cloning from audio files (true AI cloning)
- [ ] Export to additional formats (MP3, OGG)
- [ ] User authentication and saved voices cloud sync
- [ ] Audio editing capabilities (trim, merge)
- [ ] Real-time streaming for longer texts
- [ ] Voice comparison tool
- [ ] Integration with AI chat assistants

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [z-ai-web-dev-sdk](https://z.ai/) - For the powerful speech synthesis capabilities
- [Next.js](https://nextjs.org/) - For the excellent React framework
- [shadcn/ui](https://ui.shadcn.com/) - For the beautiful component library
- [Lucide](https://lucide.dev/) - For the amazing icon set
- [Vercel](https://vercel.com/) - For the deployment platform

## 📧 Support

- **Documentation**: [https://z.ai/docs](https://z.ai/docs)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

<div align="center">

**Built with ❤️ by [Teri Massey-Roland](https://github.com/terimasseyroland)** for [WizDevTech](https://wizdevtech.com)**

**Powered by [Z.ai](https://z.ai/) - Your AI Assistant for Development** 🚀

</div>
