/**
 * Filters the menu.json tree by effective permissions.
 *
 * Rules:
 * - `permissions == null`  -> no filtering (fail-open during rollout).
 * - A leaf item (has `path`) is kept only if its `key` has at least one
 *   granted action (usually "view").
 * - A parent / heading is kept only if at least one descendant survives.
 * - Items without a real menu code but with a path (rare) are kept.
 */
export function filterMenuByPermissions(items, permissions) {
  if (!permissions) return items;
  if (!Array.isArray(items)) return [];

  const walk = (list) =>
    list
      .map((item) => {
        if (!item) return null;

        const children = item.children ? walk(item.children) : undefined;
        const hasChildren = children && children.length > 0;

        if (item.children) {
          // group / heading node: keep only if something survived below
          return hasChildren ? { ...item, children } : null;
        }

        // leaf node: menu is visible only with 'view' permission
        const granted = permissions[item.key];
        if (granted && granted.includes("view")) return item;
        return null;
      })
      .filter(Boolean);

  return walk(items);
}

/**
 * Filters an AntD `items(user)`-style menu tree (as built by
 * src/utils/sidebarRoutes.jsx) using `canView(menuCode)`.
 *
 * Shape differs from menu.json: leaves are identified by the absence of
 * `children` (not a `path` field), and the permission code is the item's
 * AntD `key`.
 */
export function filterAntdMenuByPermissions(items, canView) {
  if (!Array.isArray(items)) return [];

  const walk = (list) =>
    list
      .map((item) => {
        if (!item) return null;

        if (item.children) {
          const children = walk(item.children);
          return children.length > 0 ? { ...item, children } : null;
        }

        return canView(item.key) ? item : null;
      })
      .filter(Boolean);

  return walk(items);
}

/**
 * Builds a `path -> { code, label }` map from one or more AntD menu trees,
 * used by RouteGuard to know which permission code guards a given URL.
 * Leaf item paths are recovered from their `<Link to="...">` label element.
 */
export function buildPathMapFromMenuItems(...trees) {
  const map = {};

  const walk = (list) => {
    for (const item of list || []) {
      if (!item) continue;
      if (item.children) {
        walk(item.children);
        continue;
      }
      const to = item.label?.props?.to;
      if (typeof to === "string" && item.key) {
        const labelText =
          typeof item.label?.props?.children === "string"
            ? item.label.props.children
            : String(item.key);
        map[to] = { code: String(item.key), label: labelText };
      }
    }
  };

  trees.forEach(walk);
  return map;
}
