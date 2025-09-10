# Recommended Project Structure for New UI

```
src/
├── new/                           # Your new UI implementation
│   ├── components/                # Reusable components
│   │   ├── common/               # Common UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Table/
│   │   │   ├── Modal/
│   │   │   └── index.ts
│   │   ├── layout/               # Layout components
│   │   │   ├── Sidebar/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── index.ts
│   │   └── forms/                # Form components
│   │       ├── FormInput/
│   │       ├── FormSelect/
│   │       └── index.ts
│   ├── pages/                    # Page components
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   ├── finance/
│   │   ├── production/
│   │   ├── warehouse/
│   │   └── index.ts
│   ├── hooks/                    # Custom hooks
│   │   ├── useApi.ts
│   │   ├── useAuth.ts
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   ├── api.ts
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── types/                    # TypeScript types
│   │   ├── common.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── theme/                    # MUI theme configuration
│   │   ├── theme.ts
│   │   ├── colors.ts
│   │   └── index.ts
│   ├── App.tsx                   # New app component
│   ├── routes.tsx                # New routing
│   └── index.tsx                 # Entry point
├── Components/                   # Keep existing (legacy)
├── Pages/                        # Keep existing (legacy)
└── App.jsx                       # Keep existing (legacy)
```

## Implementation Strategy

### 1. Start with Dashboard

- Create basic layout structure
- Implement navigation
- Add dashboard widgets
- Integrate with existing APIs

### 2. Create Reusable Components

- Button, Input, Table, Modal
- Form components
- Data display components

### 3. Module by Module Migration

- Dashboard → Master Data → Finance → Production → Warehouse → Sales → R&D

### 4. Integration Points

- Use existing API endpoints
- Share Redux store if needed
- Socket.io integration
- Authentication system
