import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { imsAxios } from "../../axiosInterceptor";

/**
 * Permission layer (RBAC + user overrides).
 *
 * Backend returns effective permissions as:
 *   { "B32": ["view","create"], "C11": ["view"], "SYS-PERM": ["view","update"] }
 *
 * NOTE: frontend visibility is UX only — real enforcement happens on the
 * backend via checkPermission middleware.
 *
 * While permissions are not yet loaded (or the endpoint is unavailable),
 * `can()` fails OPEN so the existing app keeps working during rollout.
 * Set FAIL_CLOSED = true once all users have roles seeded.
 */
const FAIL_CLOSED = false;

const PermissionsContext = createContext({
  permissions: null,
  loading: false,
  can: () => true,
  canViewMenu: () => true,
  refresh: () => {},
  clear: () => {},
});

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // NOTE: imsAxios response interceptor unwraps axios responses and
      // resolves directly to the API body: { success, status, message, data }
      const res = await imsAxios.get("/permissions/me");
      if (res?.success && res?.data?.permissions) {
        setPermissions(res.data.permissions);
      } else {
        setPermissions(null);
      }
    } catch (err) {
      // Not logged in yet, or module not deployed — fail open.
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setPermissions(null), []);

  useEffect(() => {
    // Fetch once on mount if a session already exists.
    // Call refresh() again right after a successful login.
    const hasSession = !!localStorage.getItem("loggedInUser") || !!localStorage.getItem("token");
    if (hasSession) refresh();
  }, [refresh]);

  /** can("B32", "create") -> boolean. Multiple actions = ANY-of. */
  const can = useCallback(
    (menuCode, ...actions) => {
      if (!permissions) return !FAIL_CLOSED;
      const granted = permissions[menuCode];
      if (!granted || granted.length === 0) return false;
      if (actions.length === 0) return true; // any permission on the menu
      return actions.some((a) => granted.includes(String(a).toLowerCase()));
    },
    [permissions]
  );

  /** Menu visibility: requires the 'view' action on the code. */
  const canViewMenu = useCallback(
    (menuCode) => can(menuCode, "view"),
    [can]
  );

  const value = useMemo(
    () => ({ permissions, loading, can, canViewMenu, refresh, clear }),
    [permissions, loading, can, canViewMenu, refresh, clear]
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}

/**
 * Conditionally render action buttons:
 *   <Can menu="B32" action="create"><Button>Create MIN</Button></Can>
 *   <Can menu="B32" action={["update","approve"]}>...</Can>
 */
export function Can({ menu, action, children, fallback = null }) {
  const { can } = usePermissions();
  const actions = action ? (Array.isArray(action) ? action : [action]) : [];
  return can(menu, ...actions) ? <>{children}</> : <>{fallback}</>;
}

export default PermissionsContext;
