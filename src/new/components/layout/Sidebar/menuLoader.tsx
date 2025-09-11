import React from 'react';
import menuConfig from './menu.json';

// Icon mapping - Only includes icons actually used in menu.json
const iconMap: { [key: string]: React.ComponentType<any> } = {
  DashboardIcon: () => <span style={{ fontSize: '20px' }}>📊</span>,
  PublicIcon: () => <span style={{ fontSize: '20px' }}>🌐</span>,
  DescriptionIcon: () => <span style={{ fontSize: '20px' }}>📄</span>,
  ListIcon: () => <span style={{ fontSize: '20px' }}>☰</span>,
  BarChartIcon: () => <span style={{ fontSize: '20px' }}>📊</span>,
  PatternIcon: () => <span style={{ fontSize: '20px' }}>🔷</span>,
  WebIcon: () => <span style={{ fontSize: '20px' }}>🌐</span>,
  InboxIcon: () => <span style={{ fontSize: '20px' }}>📥</span>,
  ErrorIcon: () => <span style={{ fontSize: '20px' }}>❌</span>,
  GroupWorkIcon: () => <span style={{ fontSize: '20px' }}>👥</span>,
};

// Function to process menu items and convert icon strings to React components
const processMenuItems = (items: any[]): any[] => {
  return items.map(item => ({
    ...item,
    icon: iconMap[item.icon] || (() => <span style={{ fontSize: '20px' }}>📄</span>), // Default icon
    children: item.children ? processMenuItems(item.children) : undefined
  }));
};

// Load and process the menu configuration
export const loadMenuConfig = () => {
  return {
    sidebar1: {
      ...menuConfig.sidebar1,
      items: processMenuItems(menuConfig.sidebar1.items)
    }
  };
};

// Export the raw config for other uses
export const rawMenuConfig = menuConfig;
