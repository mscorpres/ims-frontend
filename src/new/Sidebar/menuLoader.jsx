
import menuConfig from "./menu.json";
import { renderIcon } from "./iconsMapper";

const processMenuItems = (items) => {
  return items.map((item) => ({
    ...item,
    icon: renderIcon(item.icon),
    children: item.children ? processMenuItems(item.children) : undefined,
  }));
};


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


export const rawMenuConfig = menuConfig;