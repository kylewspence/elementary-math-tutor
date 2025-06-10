# Long Division Tutor

An interactive web application that helps students learn long division through step-by-step guidance with keyboard-first navigation.

## 🎯 Project Overview

This is an educational tool designed to make learning long division intuitive and engaging. Students can practice with randomly generated problems or create their own, working through each step with immediate feedback and hints.

## ✨ Features

### Current (Phase 1 - Foundation)
- ✅ **Modern Tech Stack**: React + TypeScript + Vite + Tailwind CSS
- ✅ **Keyboard-First Design**: Optimized for numpad navigation
- ✅ **Editable Problems**: Students can input custom divisor/dividend
- ✅ **Clean Architecture**: Well-structured components and utilities
- ✅ **Type Safety**: Comprehensive TypeScript definitions

### Planned (Phase 2-5)
- 🔄 **Step-by-Step Interface**: Visual long division layout
- 🔄 **Real-Time Validation**: Immediate feedback on each step
- 🔄 **Smart Hints**: Context-aware help system
- 🔄 **Problem Generation**: Multiple difficulty levels
- 🔄 **Progress Tracking**: Track completion and accuracy

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd long-division-tutor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Project Structure
```
src/
├── components/
│   ├── DivisionProblem/     # Core division functionality
│   ├── UI/                  # Reusable UI components
│   └── Layout/              # Layout components
├── hooks/                   # Custom React hooks
├── utils/                   # Pure utility functions
├── types/                   # TypeScript definitions
└── assets/                  # Static assets
```

### Key Technologies
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite 6
- **State Management**: React hooks
- **Deployment**: Vercel-ready

## 🎮 Usage

1. **Enter Problem**: Input divisor and dividend in the setup area
2. **Start Division**: Click "Start Problem" to begin step-by-step process
3. **Navigate with Keyboard**: Use numpad and Tab/Enter for seamless navigation
4. **Get Feedback**: Receive immediate validation and helpful hints
5. **Complete Problem**: Work through all steps to finish the division

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Standards
- TypeScript strict mode enabled
- Comprehensive error handling
- Accessibility-first approach
- Clean, documented code

## 📋 Development Roadmap

See [PROJECT_SPECIFICATION.md](./PROJECT_SPECIFICATION.md) for detailed requirements and [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for progress tracking.

## 🎯 Educational Goals

- **Reduce Cognitive Load**: Focus on math, not navigation
- **Build Confidence**: Step-by-step validation prevents frustration
- **Reinforce Learning**: Visual representation matches traditional methods
- **Encourage Practice**: Quick problem generation for repeated practice

## 🚀 Deployment

This project is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect the Vite configuration
3. Deploy with zero additional configuration

## 🤝 Contributing

This is a bootcamp final project focused on learning and portfolio development. The codebase emphasizes:
- Clean architecture and best practices
- Educational value and user experience
- Performance and accessibility
- Thoughtful design decisions

## 📄 License

MIT License - feel free to use this for educational purposes.
