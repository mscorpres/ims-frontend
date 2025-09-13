# Sidebar Menu System

This directory contains a modern, configurable sidebar menu system that can be used with both traditional React components and JSON configuration.

## Files

- `Sidebar.tsx` - Main sidebar component
- `menu.json` - JSON configuration file with all menu items
- `menuLoader.tsx` - Loads and processes the menu configuration
- `iconMapper.tsx` - Maps icon names to React components
- `MenuExample.tsx` - Example usage component

## Features

✅ **Complete Menu Structure**: All routes from `sidebarRoutes.jsx` are included
✅ **Default Icons**: Items without specific icons get appropriate default icons
✅ **Navigation**: Clicking menu items navigates to the correct routes
✅ **Collapsible**: Sidebar can be collapsed/expanded
✅ **Multi-level**: Supports nested menu items
✅ **JSON Configuration**: Easy to modify menu structure without code changes

## Usage

### Using JSON Configuration (Recommended)

```tsx
import Sidebar from "./Sidebar";

const MyComponent = () => {
  const [showSideBar, setShowSideBar] = useState(true);

  return (
    <Sidebar
      showSideBar={showSideBar}
      setShowSideBar={setShowSideBar}
      useJsonConfig={true} // This uses menu.json
    />
  );
};
```

### Using Traditional Props

```tsx
import Sidebar from "./Sidebar";
import { items, items1 } from "../../utils/sidebarRoutes";

const MyComponent = () => {
  const [showSideBar, setShowSideBar] = useState(true);

  return (
    <Sidebar
      showSideBar={showSideBar}
      setShowSideBar={setShowSideBar}
      items={items(user)}
      items1={items1(user, setShowTickets)}
      useJsonConfig={false} // This uses the props
    />
  );
};
```

## Menu Structure

The `menu.json` file contains:

- **Finance**: All financial modules (Accounts, Taxation, Vendor Bills, etc.)
- **Dashboard**: Dashboard and SKU Costing
- **Material Management**: Master data, Procurement, Warehouse operations
- **Production**: PPC, QCA, Reports
- **MES**: QA Process, QCA
- **CPM**: Analysis and Finance
- **Analysis**: Paytm QC and Refurbishment
- **Sales & Distribution**: Invoice creation
- **Research and Development**: Products and BOM

## Adding New Menu Items

1. **Edit `menu.json`**: Add your new menu item with the required structure:

   ```json
   {
     "key": "unique-key",
     "label": "Display Name",
     "icon": "IconName",
     "path": "/route/path",
     "children": [], // Optional for sub-items
     "isHeading": false // Set to true for section headings
   }
   ```

### Menu Structure Types

- **Section Headings**: Use `"isHeading": true` for items like "PPC", "QCA", "Master", etc. These appear as bold, uppercase headings with a border separator
- **Regular Items**: Items without `isHeading` or with `"isHeading": false` appear as normal clickable menu items
- **Items with Children**: Can be either headings or regular items, but headings are recommended for better organization

2. **Add Icon**: If you need a new icon, add it to `iconMapper.tsx`:

   ```tsx
   'YourIconName': YourIconComponent,
   ```

3. **Default Icons**: Items without icons will automatically get appropriate default icons

## Icon System

The system supports:

- React Icons (BsFillHddStackFill, ImCart, etc.)
- Ant Design Icons (UserOutlined, DashboardOutlined, etc.)
- Material-UI Icons (as fallbacks)
- Default icons for items without specific icons

## Navigation

Menu items with `path` properties will automatically navigate when clicked. Items with `children` will expand to show sub-items.

## Styling

The sidebar uses inline styles and can be customized by modifying the `Sidebar.tsx` component. It's designed to be responsive and includes smooth transitions.
