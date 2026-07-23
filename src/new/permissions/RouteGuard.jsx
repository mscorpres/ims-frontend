import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Input, Typography, message, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { usePermissions } from "./PermissionsContext";
import { buildPathMapFromMenuItems } from "./filterMenu";
import { items, items1 } from "../../utils/sidebarRoutes.jsx";
import { imsAxios } from "../../axiosInterceptor";

const { Title, Text } = Typography;

const BRAND_LOGO = `${import.meta.env.BASE_URL}assets/images/mscorpres_auto_logo.png`;
const NEED_ACCESS_ART = `${import.meta.env.BASE_URL}need_access.svg`;

/**
 * Blocks page render when the user lacks 'view' permission on the menu code
 * mapped to the current URL. Shows a Google-style "You need access" screen:
 *  - brand logo top-left, illustration on the right
 *  - message box + "Request access" button
 *  - if a request is already pending -> only a "Ping administrator" button
 */
const buildPathMap = () => buildPathMapFromMenuItems(items({}), items1({}, () => {}));

let PATH_MAP = null;

function RequestAccess({ menuCode, menuLabel }) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);

  // Already-requested check
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await imsAxios.get("/permissions/requests/mine");
        if (alive && data?.success) {
          setPending((data.data || []).some((r) => r.menu_code === menuCode));
        }
      } catch (e) {
        /* fail open to the form */
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [menuCode]);

  const submit = async () => {
    setSending(true);
    try {
      const data = await imsAxios.post("/permissions/requests", {
        menu_code: menuCode,
        message: msg,
      });
      if (data?.success) {
        message.success(data.message);
        setPending(true);
        setMsg("");
      } else message.error(data?.message || "Request failed");
    } catch (e) {
      message.error(e?.message || "Request failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 64,
          maxWidth: 960,
          width: "100%",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Left column */}
        <div style={{ flex: "1 1 380px", maxWidth: 460 }}>
          {/* Brand logo top-left */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <img
              src={BRAND_LOGO}
              alt="MsCorpres"
              style={{ height: 36 }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>

          <Title level={1} style={{ fontWeight: 500, marginBottom: 12 }}>
            You need access
          </Title>

          {checking ? (
            <Spin />
          ) : pending ? (
            <>
              <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
                Your access request for <b>{menuLabel}</b> ({menuCode}) is already
                pending with the administrator.
              </Text>
              <Button
                type="primary"
                size="large"
                shape="round"
                icon={<BellOutlined />}
                loading={sending}
                onClick={submit}
              >
                Ping administrator
              </Button>
            </>
          ) : (
            <>
              <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                Request access, or contact your administrator for{" "}
                <b>{menuLabel}</b> ({menuCode}).
              </Text>
              <Input.TextArea
                rows={4}
                maxLength={500}
                placeholder="Message (optional)"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                style={{ margin: "16px 0 24px", borderRadius: 8 }}
              />
              <Button type="primary" size="large" shape="round" loading={sending} onClick={submit}>
                Request access
              </Button>
            </>
          )}
        </div>

        {/* Right illustration */}
        <div style={{ flex: "0 1 340px", textAlign: "center" }}>
          <img
            src={NEED_ACCESS_ART}
            alt="Need access"
            style={{ width: "100%", maxWidth: 340 }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      </div>
    </div>
  );
}

export default function RouteGuard({ children }) {
  const { pathname } = useLocation();
  const { can, permissions } = usePermissions();

  const menuEntry = useMemo(() => {
    if (!PATH_MAP) PATH_MAP = buildPathMap();
    return PATH_MAP[pathname] || null;
  }, [pathname]);

  // fail-open: permissions not loaded yet, or page not in menu.json
  if (!permissions || !menuEntry) return children;

  if (!can(menuEntry.code, "view")) {
    return <RequestAccess menuCode={menuEntry.code} menuLabel={menuEntry.label} />;
  }
  return children;
}
