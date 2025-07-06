# 🎬 Pixel Pilot

**A sophisticated animation generation platform powered by Manim and modern web technologies**

## 🎥 Demo

[![Demo Video](https://img.shields.io/badge/🎬-Watch%20Demo-blue?style=for-the-badge)](https://vimeo.com/1095386478/cd09b6a164?share=copy)

## 🏗️ Architecture

![Architecture Diagram](./docs/architecture-diagram.png)

## 📖 Overview

Pixel Pilot is a cutting-edge platform that transforms text prompts into stunning mathematical animations using Manim. Built with a modern microservices architecture, it features real-time processing, and seamless user experience.

### ✨ Key Features

- **🎨 Intelligent Animation Generation**: Convert natural language prompts into mathematical animations
- **⚡ Real-time Processing**: WebSocket-powered live updates and progress tracking
- **🎭 Advanced Animations**: Framer Motion powered transitions and state management
- **🔄 Scalable Architecture**: Microservices with Redis queue management
- **📱 Responsive Design**: Beautiful UI that works across all devices
- **🎯 Smart Placeholders**: Dynamic typing animations with example prompts

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Framer Motion** - Advanced animations and transitions
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **Redis** - Queue management and caching
- **WebSocket** - Real-time communication

### Animation Engine
- **Manim** - Mathematical animation engine
- **Python** - Manim runtime
- **FFmpeg** - Video processing

### Infrastructure
- **AWS S3** - Video storage
- **PostgreSQL** - Primary database
- **Turborepo** - Monorepo management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- PostgreSQL
- Redis
- FFmpeg

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kiralightyagami/pixel-pilot.git
   cd pixel-pilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files
   cp apps/frontend/.env.example apps/frontend/.env.local
   cp apps/api/.env.example apps/api/.env
   cp packages/db/.env.example packages/db/.env
   ```

4. **Set up the database**
   ```bash
   cd packages/db
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Install Manim dependencies**
   ```bash
   cd apps/worker
   python setup_manim.py
   ```

6. **Start development servers**
   ```bash
   # Start all services
   npm run dev
   ```

## 📁 Project Structure

```
pixel-pilot/
├── apps/
│   ├── frontend/          # Next.js web application
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities and hooks
│   ├── api/              # Express.js API server
│   ├── worker/           # Manim animation worker
│   └── worker-orchestrator/ # Queue management
├── packages/
│   ├── db/               # Prisma database package
│   ├── redis/            # Redis utilities
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/ # TypeScript configurations
└── media/                # Generated animations
```

## 🎯 Features in Detail

### 🎨 Animation Generation
- Natural language to Manim code conversion
- Support for geometric shapes, graphs, and mathematical concepts
- Real-time generation progress tracking
- High-quality video output in multiple resolutions



### 🔄 Real-time Features
- WebSocket connections for live updates
- Progress tracking during animation generation
- Instant feedback and error handling
- Queue status monitoring

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start all development servers
npm run build        # Build all applications
npm run lint         # Lint all packages
npm run type-check   # Type check all packages

# Database
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio

# Individual apps
npm run dev:frontend    # Frontend only
npm run dev:api        # API only
npm run dev:worker     # Worker only
```

### Environment Variables

#### Frontend (`apps/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

#### API (`apps/api/.env`)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/pixelpilot
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=your_bucket_name
```

#### Database (`packages/db/.env`)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/pixelpilot
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Manim Community](https://www.manim.community/) for the incredible animation engine
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check our [documentation](./docs)
- Join our community discussions

---

**Built with ❤️ by the Pixel Pilot Team**
