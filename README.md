# ROAI - Return on AI

**Process Mining & Workflow Analytics Platform**

An enterprise-grade process mining and workflow analytics platform built with React, TypeScript, and modern web technologies. ROAI helps organizations understand their processes, identify inefficiencies, and measure the return on their AI investments through automated process discovery, conformance analysis, user behavior segmentation, and AI-assisted deviation investigation.

## Features

### 🔍 Process Discovery
- Automatically discovers process models from event logs using Directly-Follows Graph (DFG) algorithm
- Identifies activity sequences, frequencies, and durations
- Detects process variants and common paths

### 📊 Visual Analytics
- Interactive process map visualization with React Flow
- Automatic graph layout using Dagre
- Frequency-based edge styling
- Ideal path highlighting
- Deviation indicators

### 👥 User Behavior Analysis
- Automatic user segmentation into 4 categories:
  - **Conformists**: Follow standard processes consistently
  - **Fast Trackers**: Complete cases significantly faster
  - **Deviators**: Frequently deviate from standard paths
  - **Thorough Reviewers**: Take extra verification steps
- Performance metrics and conformance scoring
- Interactive user tables with filtering

### 🤖 AI-Powered Interviews
- Simulated interview system for investigating deviations
- Pattern-based question generation
- Automated insight extraction from responses
- Priority-based recommendations
- Identifies:
  - Undocumented rules
  - Process gaps
  - Tool issues
  - Workload problems
  - Training opportunities

### 📁 File Upload Support
- **XES Format**: Industry-standard XML-based event log format
- **CSV Format**: Automatic column detection and mapping
- Drag-and-drop interface
- Real-time parsing and validation
- Comprehensive error messages

### 🎨 Design System
- Clean, professional light mode design
- White, gray, and light blue color scheme
- Dark mode toggle available
- Glassmorphism effects
- Smooth animations and transitions
- Responsive layout

## Tech Stack

- **React 18.2** - UI framework
- **TypeScript 5.3** - Type safety
- **Tailwind CSS 3.4** - Styling
- **React Router 6** - Navigation
- **React Flow 11** - Process visualization
- **Dagre** - Graph layout
- **Recharts 2.10** - Charts (ready for use)
- **Lucide React** - Icons
- **Vite 5** - Build tool

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

The application will be available at `http://localhost:5173/`

## Usage Guide

### 1. Load Data

Navigate to **Event Logs** page and choose one of two options:

**Option A: Upload Your Own Data**
- Click the upload area or drag and drop a file
- Supports `.xes` or `.csv` formats
- System automatically detects columns and parses data
- Full validation with error messages

**Option B: Generate Sample Data**
- Click **"Generate Sample Data"** for a realistic loan application process
- 500 cases, 8 activities, 20 users
- Realistic deviations (skips, reorders, loops)

The system will automatically:
- Parse and validate the event log
- Discover the process model
- Calculate conformance metrics
- Analyze user behavior

### 2. Explore Dashboard

The dashboard provides an overview of:
- Total cases and conformance rate
- Process variants
- Active users
- Top deviations
- Process overview
- Recent activity

### 3. View Process Map

The interactive process map shows:
- All activities as nodes
- Transitions between activities as edges
- Frequency-based edge thickness
- Start/end activity indicators
- Conformance-based coloring
- Deviation highlighting

**Controls:**
- Toggle ideal path highlighting
- Filter by frequency threshold
- Zoom and pan
- Export visualization

### 4. Analyze Users

The user segments page displays:
- Segment distribution
- User performance metrics
- Conformance scores
- Deviation counts
- Sortable/filterable table

Click on segment cards to filter users by behavior type.

### 5. Conduct AI Interviews

Select users with deviations to start automated interviews:
1. System generates questions based on deviation patterns
2. Click "Simulate Response" to get realistic answers
3. System extracts insights automatically
4. Review recommendations and priorities

## Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Badge, etc.)
│   ├── MetricCard.tsx  # Dashboard metric cards
│   └── Sidebar.tsx     # Navigation sidebar
├── contexts/           # React contexts
│   ├── AppContext.tsx  # Global app state
│   └── ThemeContext.tsx # Dark/light mode
├── data/               # Data generation
│   └── generator.ts    # Sample data generator
├── lib/                # Core logic
│   ├── process-mining.ts # DFG algorithm, conformance checking
│   ├── interview.ts    # Interview question/response generation
│   └── utils.ts        # Utility functions
├── pages/              # Main application pages
│   ├── Dashboard.tsx
│   ├── EventLogs.tsx
│   ├── ProcessMap.tsx
│   ├── UserSegments.tsx
│   └── Interviews.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Algorithms & Techniques

### Process Discovery (DFG)
1. Group events by case ID
2. Sort events by timestamp
3. Count activity frequencies
4. Build directly-follows relationships
5. Identify start/end activities
6. Extract process variants

### Conformance Checking
1. Compare actual paths to ideal path
2. Detect skipped activities
3. Identify inserted (extra) activities
4. Find reordered sequences
5. Calculate fitness score (0-1)

### User Segmentation
1. Calculate global statistics (mean, std dev)
2. Compute per-user metrics
3. Apply segmentation criteria using percentiles
4. Assign segments by priority

### Interview System
1. Analyze user deviation patterns
2. Generate context-specific questions
3. Match responses to pattern library
4. Extract insights using regex patterns
5. Prioritize by impact

## Design Tokens

The application uses a carefully crafted design system:

```css
--background: 240 10% 4%        /* Deep space background */
--surface-1: 240 10% 8%         /* Card backgrounds */
--accent-blue: 217 91% 60%      /* Primary actions */
--accent-emerald: 160 84% 39%   /* Success/conformance */
--accent-amber: 38 92% 50%      /* Warnings */
--accent-rose: 347 77% 50%      /* Errors/deviations */
```

## Performance

- Tree-shaking enabled
- Code splitting by route
- Optimized bundle size (~475KB JS, ~25KB CSS gzipped)
- Lazy loading for heavy components
- Memoized calculations

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Future Enhancements

Potential additions:
- Real backend integration with database
- Export process maps to PDF/PNG
- Advanced filtering and search
- Time-based analysis and trends
- Multi-tenancy support
- Real AI integration (OpenAI, Claude, etc.)
- Custom process templates
- Collaboration features

## License

This is a demonstration project built for educational purposes.

## About ROAI

**ROAI** (Return on AI) is a process mining platform designed to help organizations measure and maximize the value of their AI investments. By analyzing real process execution data, ROAI identifies inefficiencies, automates improvement recommendations, and quantifies the impact of process changes.

Built with enterprise software design principles and modern best practices.
