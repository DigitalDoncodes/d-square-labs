# Living Surface — UI Architecture

## Concept

The Living Surface replaces traditional page-based navigation with four always-available zones. The interface is not a set of screens — it is a **surface** that adapts to what the student is doing, thinks about the user's context, and surfaces the right tools at the right time.

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────────────────┐  ┌──────────┐   │
│  │          │  │                              │  │          │   │
│  │ COMPASS  │  │         WORKSPACE            │  │  RAIL    │   │
│  │ (left)   │  │     (adaptive canvas)        │  │  (right) │   │
│  │          │  │                              │  │          │   │
│  │  radial  │  │  ┌──────┬──────┬──────┐      │  │  AI      │   │
│  │  nav     │  │  │ view │ view │ view │      │  │  tools   │   │
│  │  contexts│  │  └──────┴──────┴──────┘      │  │          │   │
│  │          │  │                              │  │  quick   │   │
│  └──────────┘  │  ┌──────────────────────┐    │  │  actions  │   │
│                │  │   floating widgets    │    │  │          │   │
│                │  └──────────────────────┘    │  └──────────┘   │
│                └──────────────────────────────┘                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  STREAM  (ambient events — bottom strip)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Zone 1: Compass

### Purpose
Radial context navigation that shows *where you are* and *where you can go*. Replaces the current sidebar nav with a space-efficient, context-aware radial menu.

### States
| State | Trigger | Behavior |
|---|---|---|
| `collapsed` | Default, inactive | Small tab on left edge showing current module icon + name |
| `expanded` | Hover/click on collapsed tab, or Cmd+B | Shows contextual radial menu |
| `full` | Click center node | Full program picker overlay |

### Component Tree
```
Compass
├── CompassTrigger        // collapsed tab — always visible on left edge
├── CompassRadial         // expanded state — radial menu
│   ├── CenterNode        // current context (module + current workspace)
│   ├── RingModule        // inner ring — program modules (MBA, Eng, Law...)
│   ├── RingWorkspace     // outer ring — workspaces (Study, Career, Community, Me)
│   └── RingActions       // outermost ring — contextual actions (New Note, Search...)
└── ProgramPicker         // full overlay — grid of all available modules
    ├── ModuleCard        // per module with enrollment status
    └── ComingSoonBadge   // locked modules
```

### Behavior
- **Center node**: Current program + active workspace. Click to return to workspace home
- **Hover on any ring item**: Previews the target (shows tooltip with description + active count)
- **Click ring item**: Navigates to that context. Compass collapses back
- **Right-click on center**: Quick-switch between recent contexts (MRU list)
- **Drag to reorder**: Customize ring order per user preference
- **Mobile**: Compass becomes a bottom-sheet overlay triggered by the DATAD mark in the top bar

### Keyboard Navigation
```
Cmd+B        Toggle Compass (expand/collapse)
Esc          Collapse Compass
Tab / Arrows Navigate ring items
Enter        Select focused item
1-9          Shortcut to ring positions (1 = center, 2-9 = ring items clockwise)
```

---

## Zone 2: Workspace

### Purpose
The adaptive main content area. Unlike the current approach of replacing the entire outlet, the Workspace manages a dynamic grid of content views.

### States
| State | Trigger | Behavior |
|---|---|---|
| `single` | Default | One content view fills the area |
| `split` | Drag a link to the edge, or Cmd+\ | Two views side by side |
| `grid` | More than 2 views, or dashboard | 2-4 views in a flexible grid |
| `focus` | Click "Focus" button on any view | One view takes full screen, others collapse to tabs |
| `present` | Cmd+Shift+P | Clean reading mode — no chrome, no Rail |

### Component Tree
```
Workspace
├── WorkspaceGrid          // manages layout (single/split/grid/focus)
│   ├── ContentView        // individual content frame
│   │   ├── ViewHeader     // breadcrumb + title + view actions
│   │   ├── ViewBody       // the actual page content (renders existing pages)
│   │   └── ViewFooter     // metadata, tags, related links
│   └── [ContentViews]     // multiple views in split/grid mode
├── ViewTabs               // horizontal tab strip for open views (browser-style)
│   └── ViewTab            // individual tab with title, icon, close button
└── FloatingWidgets        // persistent widgets that float above content
    ├── AISuggestions      // context-aware AI suggestions
    ├── MiniPlayer         // audio/video floating player
    └── QuickNote          // floating note composer
```

### Behavior
- **Content adaptation**: Each page component renders inside a `ContentView`. The ViewHeader shows breadcrumbs; the ViewBody renders the existing page component unmodified
- **Split view**: Drag a link to left/right edge of the workspace to open in split. Cmd+\ toggles split with the last-viewed secondary content
- **Tab bar**: Browser-style tabs across the top of the workspace. Each view gets a tab. Tabs persist across navigation within the same workspace
- **Widgets**: Float above content. Draggable, collapsible. Position persisted in localStorage
- **URL sync**: The URL always reflects the primary (leftmost/focused) view. Split views are encoded as query params: `/study/notes?splits=note:abc123,task:xyz789`

### View Lifecycle
```
OPEN → ACTIVE → BACKGROUND → CLOSED
                (tab persists)   (tab removed)
```

- **OPEN**: Content loaded into a ContentView
- **ACTIVE**: The visible/focused view
- **BACKGROUND**: Tab exists but view is hidden behind another
- **CLOSED**: Tab closed, view unmounted, scroll position discarded

---

## Zone 3: Rail

### Purpose
Context-aware AI toolbelt on the right edge. Replaces the floating ChatBot with an integrated vertical toolbar that surfaces the right AI tools for whatever is in the active Workspace view.

### States
| State | Trigger | Behavior |
|---|---|---|
| `collapsed` | Default | Thin vertical strip showing only icons |
| `expanded` | Click any icon, or Cmd+Shift+R | Panel slides open from right |
| `full` | Click expand arrow, or Cmd+Shift+F | Full-width panel with conversation history |

### Component Tree
```
Rail
├── RailToggle            // collapsed icon strip
│   ├── ToolIcon          // per tool icon (summarize, ask, rewrite, related...)
│   └── ActiveIndicator   // pulsing dot when AI is processing
└── RailPanel             // expanded panel
    ├── PanelHeader       // tool name + close button
    ├── ContextBadge      // shows what the AI can see (e.g., "Current: Note - Marketing 101")
    ├── ToolBody          // varies by tool:
    │   ├── AIChat         // free-form chat with context awareness
    │   ├── Summarizer     // summarise current content
    │   ├── Generator      // generate (flashcards, questions, outline)
    │   ├── Analyzer       // analyze (sentiment, key concepts, gaps)
    │   └── Explorer       // graph explorer — visualise related nodes
    └── SuggestionChips   // quick action buttons ("Summarize", "Explain", "Quiz me")
```

### Tool Registry (per module)
| Tool Slug | Label | Context Requirement | Tier |
|---|---|---|---|
| `summarize` | Summarize | Any content view | trial+ |
| `explain` | Explain Like I'm 5 | Any content view | trial+ |
| `quiz` | Quiz Me | Note / Resource / Case | pro+ |
| `flashcards` | Generate Flashcards | Note / Subject | pro+ |
| `rewrite` | Rewrite | Note / Resume | max |
| `questions` | Interview Questions | Company / Resume | max |
| `compare` | Compare | Two+ views open | max |
| `graph` | Explore Graph | Any context | pro+ |

### Behavior
- **Context-aware**: The Rail reads the active ContentView's metadata to determine available tools
- **SuggestionChips**: Appear contextually — e.g., open a note → chips: "Summarize", "Quiz me", "Related notes"
- **Minimal mode**: `collapsed` by default on content pages, `expanded` on AI-specific pages (chat, AI center)
- **Mobile**: Rail slides up as a bottom sheet instead of right panel

---

## Zone 4: Stream

### Purpose
Ambient event strip at the bottom of the screen. Non-intrusive notifications, activity updates, and contextual nudges that flow horizontally.

### States
| State | Trigger | Behavior |
|---|---|---|
| `idle` | Default | Thin strip showing the most recent event as a ticker |
| `expanded` | Click/tap on strip | Slides up to show event history list |
| `focus` | Click on an event | Opens detail in Workspace (as a new ContentView) |

### Component Tree
```
Stream
├── StreamStrip           // thin bottom bar
│   ├── EventTicker       // scrolling text for latest event
│   ├── EventCount        // badge showing unread event count
│   └── ExpandButton      // arrow to expand
└── StreamPanel           // expanded overlay
    ├── StreamHeader      // "Stream" title + filter dropdown
    ├── EventList         // vertical list of events
    │   └── StreamEvent   // individual event
    │       ├── EventIcon    // type icon
    │       ├── EventBody    // title + description
    │       ├── EventTime    // relative time
    │       └── EventAction  // "View", "Dismiss", "Snooze"
    └── StreamSettings    // filter preferences
```

### Event Types
| Event Type | Source | Example |
|---|---|---|
| `deadline` | Task / Assignment | "Marketing case study due tomorrow" |
| `reminder` | Planner / Cron | "Time for your daily case" |
| `activity` | Feed / Community | "Riya commented on your post" |
| `system` | Platform | "New briefing available" |
| `ai_suggestion` | AI / Rail | "You've been studying for 2h — take a break?" |
| `placement` | Company / Drive | "Google applications close in 3 days" |
| `wellness` | Wellbeing | "Log your mood for today" |

### Behavior
- **Non-blocking**: Events appear in the strip without interrupting anything
- **Smart batching**: Similar events collapse ("3 new comments on your post")
- **Priority ordering**: deadlines > placement > activity > system > ai_suggestion
- **Swipe to dismiss**: On mobile, swipe left on an event to dismiss
- **Do Not Disturb**: Toggle in StreamSettings to suppress non-critical events

---

## State Management

### Global Surface State
```javascript
const surfaceStore = {
  compass: 'collapsed' | 'expanded' | 'full',
  workspace: {
    views: [
      { id: string, type: string, params: object, scrollPos: number }
    ],
    layout: 'single' | 'split' | 'grid' | 'focus',
    activeViewId: string,
  },
  rail: 'collapsed' | 'expanded' | 'full',
  railTool: 'summarize' | 'explain' | 'quiz' | ... | null,
  stream: 'idle' | 'expanded',
  streamEvents: StreamEvent[],
  unreadCount: number,
};
```

### Context Providers
```
SurfaceProvider          // top-level surface state
├── CompassProvider      // compass state + navigation methods
├── WorkspaceProvider    // view management + layout state
├── RailProvider         // rail state + tool registry + AI session
└── StreamProvider       // event queue + stream state + WebSocket connection
```

### Data Flow
```
User Action (click Compass ring item)
  → CompassProvider.dispatch('NAVIGATE', target)
    → WorkspaceProvider opens new ContentView (or navigates in-place)
    → RailProvider reads new context and updates SuggestionChips
    → StreamProvider may add "navigated to X" event
```

```
AI Event (stream receives new briefing)
  → StreamProvider adds event
  → StreamStrip shows ticker
  → RailProvider may show "New briefing available" chip
  → WorkspaceProvider does nothing (ambient)
```

---

## Responsive Behavior

| Breakpoint | Compass | Workspace | Rail | Stream |
|---|---|---|---|---|
| `lg+` (1024+) | Left edge radial | Full center | Right edge panel | Bottom strip |
| `md` (768-1023) | Collapsed pill, expands as overlay | Full width | Bottom sheet | Bottom strip |
| `sm` (<768) | Bottom sheet trigger | Full width | Bottom sheet, full height | Bottom strip (compact) |

Mobile layout:
```
┌──────────────────────────┐
│  Top bar (module + notif)│
├──────────────────────────┤
│                          │
│      WORKSPACE           │
│      (full width)        │
│                          │
├──────────────────────────┤
│  STREAM (ambient strip)  │
├──────────────────────────┤
│  Bottom nav (mobile)     │
└──────────────────────────┘
```

---

## Integration with Existing Code

### Co-existence Strategy
The Living Surface wraps the existing layout incrementally:

1. **Phase A**: Add `SurfaceProvider` to `App.jsx`. Existing `AppShell` continues to render unchanged. Surface state is collected but not yet rendered
2. **Phase B**: `Compass` replaces the sidebar nav in `AppShell`. The radial nav calls the same `WORKSPACES` config under the hood. All existing link/navigation logic remains unchanged
3. **Phase C**: `Rail` replaces the floating `ChatBot` component. RailPanel wraps the existing AI chat components
4. **Phase D**: `Stream` strip is added below the main content area. Event sources wire into existing notification + cron infrastructure
5. **Phase E**: `WorkspaceGrid` replaces the simple `<Outlet>` in `AppShell`. Existing pages render inside `ContentView` wrappers with no changes to the pages themselves

### Key Wrapper Components
```jsx
// WorkspaceGrid wraps the existing <Outlet>
function WorkspaceGrid() {
  const { views, layout, activeViewId } = useWorkspace();
  return (
    <div className={`workspace-layout-${layout}`}>
      {views.map(view => (
        <ContentView key={view.id} view={view}>
          <Outlet />  {/* existing page component renders here */}
        </ContentView>
      ))}
    </div>
  );
}

// RailPanel reuses existing ChatMessage model and AI pipeline
function RailPanel() {
  const { tool } = useRail();
  return (
    <aside className="rail-panel">
      {tool === 'chat' && <AIChat />}      {/* wraps existing ChatBot */}
      {tool === 'summarize' && <Summarizer />}
      {tool === 'explore' && <GraphExplorer />}
    </aside>
  );
}
```

### File Structure
```
client/src/
└── surfaces/
    ├── SurfaceProvider.jsx     // top-level context
    ├── compass/
    │   ├── Compass.jsx
    │   ├── CompassRadial.jsx
    │   ├── CenterNode.jsx
    │   ├── RingModule.jsx
    │   ├── RingWorkspace.jsx
    │   ├── RingActions.jsx
    │   └── ProgramPicker.jsx
    ├── workspace/
    │   ├── WorkspaceGrid.jsx
    │   ├── ContentView.jsx
    │   ├── ViewTabs.jsx
    │   └── FloatingWidgets.jsx
    ├── rail/
    │   ├── Rail.jsx
    │   ├── RailToggle.jsx
    │   ├── RailPanel.jsx
    │   ├── tools/
    │   │   ├── AIChat.jsx
    │   │   ├── Summarizer.jsx
    │   │   ├── Generator.jsx
    │   │   ├── Analyzer.jsx
    │   │   └── GraphExplorer.jsx
    │   └── SuggestionChips.jsx
    └── stream/
        ├── Stream.jsx
        ├── StreamStrip.jsx
        ├── StreamPanel.jsx
        └── StreamEvent.jsx
```

### Current Code That Stays Unchanged
- All existing page components (`DashboardPage`, `NotesListPage`, etc.)
- Existing API routes and controllers
- Existing AI pipeline (`runPipeline`, providers, router)
- Existing notification models and cron jobs (become Stream event sources)
- Existing `AuthContext`, `ThemeContext`, `SubscriptionContext`

### Current Code That Gets Wrapped or Replaced
| Existing Component | Living Surface Replacement | Co-existence |
|---|---|---|
| `AppShell` sidebar nav | `Compass` | Compass reads WORKSPACES config, renders same links as radial |
| `WorkspaceLayout` tab row | `Workspace` ViewTabs | WorkspaceLayout becomes a thin pass-through to WorkspaceGrid |
| `ChatBot` floating button | `Rail` RailPanel | RailPanel wraps ChatBot components internally |
| `<Outlet>` in AppShell | `WorkspaceGrid` | WorkspaceGrid wraps Outlet in ContentView |
| NotificationBell | `Stream` | Stream events include notification data |
