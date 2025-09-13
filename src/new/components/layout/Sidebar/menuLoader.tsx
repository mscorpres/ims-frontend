import React from "react";
import menuConfig from "./menu.json";
import { renderIcon } from "./iconMapper";

// Function to process menu items and convert icon strings to React components
const processMenuItems = (items: any[]): any[] => {
  return items.map((item) => ({
    ...item,
    icon: renderIcon(item.icon),
    children: item.children ? processMenuItems(item.children) : undefined,
  }));
};

// Load and process the menu configuration
export const loadMenuConfig = () => {
  return {
    sidebar1: {
      ...menuConfig.sidebar1,
      items: processMenuItems(menuConfig.sidebar1.items),
    },
    sidebar2: {
      ...menuConfig.sidebar2,
      items: processMenuItems(menuConfig.sidebar2.items),
    },
  };
};

// Export the raw config for other uses
export const rawMenuConfig = menuConfig;
