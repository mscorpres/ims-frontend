"use client";

import { useEffect, useMemo } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
const TAWK_PROPERTY_ID = "69bd1624cfaccd1c35824b8c";
const TAWK_WIDGET_ID = "1jk59t0ik";
const TAWK_DEPARTMENT = "Oakter";
const HIDE_TAWK_PATHS = [
  "/login",
  "/forgot-password",
  "/verify-otp",
  "/password-recovery",
];

const LOGGED_IN_USER_KEY = "loggedInUser";

function getVisitorFromLocalStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOGGED_IN_USER_KEY);

    if (!raw) return null;

    const data = JSON.parse(raw);

    if (!data) return null;

    const name = data.userName ?? "";
    const email = data.email ?? "";
    const id = data.id ?? "";
    const mobile = data.phone ?? "";

    if (!name && !email && !id && !mobile) return null;

    return {
      name: name || undefined,
      email: email || undefined,
      id: id || undefined,
      mobile: mobile || undefined,
    };
  } catch {
    return null;
  }
}

function setTawkVisitorAttributes(visitor) {
  if (!visitor) return;
  const attrs = {};
  const MAX_INT = 2147483647;

  if (visitor.name != null && visitor.name !== "") attrs.name = visitor.name;
  if (visitor.email != null && visitor.email !== "")
    attrs.email = visitor.email;
  if (visitor.id != null && visitor.id !== "") attrs.id = String(visitor.id);

  if (
    visitor.mobile != null &&
    visitor.mobile !== "" &&
    String(visitor.mobile) !== String(MAX_INT)
  ) {
    attrs.mobile = visitor.mobile;
  }

  if (Object.keys(attrs).length === 0) return;

  if (typeof window.Tawk_API?.setAttributes === "function") {
    window.Tawk_API.setAttributes(attrs, (error) => {
      if (error) console.warn("Tawk setAttributes error:", error);
    });
  }
}

function usePathnameForTawk() {
  const [pathname, setPathname] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.location.pathname;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window;
    const eventName = "tawk-location-change";

    if (!w.__tawkHistoryPatched) {
      w.__tawkHistoryPatched = true;

      const notify = () => window.dispatchEvent(new Event(eventName));

      const pushState = history.pushState;
      history.pushState = function (...args) {
        const ret = pushState.apply(this, args);
        notify();
        return ret;
      };

      const replaceState = history.replaceState;
      history.replaceState = function (...args) {
        const ret = replaceState.apply(this, args);
        notify();
        return ret;
      };
    }

    const onChange = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", onChange);
    window.addEventListener(eventName, onChange);

    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener(eventName, onChange);
    };
  }, []);

  return pathname;
}

export default function TawkToChatOakter() {
  const { user } = useSelector((state) => state.login);
  const pathname = usePathnameForTawk();

  const shouldHideTawk = useMemo(() => {
    const showOtpPage =
      typeof window !== "undefined" &&
      localStorage.getItem("showOtpPage") === "Y";
    return !user || HIDE_TAWK_PATHS.includes(pathname) || showOtpPage;
  }, [pathname, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window;
    const scriptId = `tawk-embed-${TAWK_PROPERTY_ID}-${TAWK_WIDGET_ID}`;
    const scriptSrc = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    w.__tawkOakterShouldHide = shouldHideTawk;
    if (!w.__tawkOakterOnLoadSet) {
      w.__tawkOakterOnLoadSet = true;

      window.Tawk_API = window.Tawk_API || {};

      window.Tawk_API.onLoad = function () {
        setTawkVisitorAttributes(getVisitorFromLocalStorage());

        // ── Auto-route to Oakter department ──────────────────────

        if (typeof window.Tawk_API?.setDepartment === "function") {
          window.Tawk_API.setDepartment(TAWK_DEPARTMENT);
        }

        // Hide or show based on auth state

        if (w.__tawkOakterShouldHide) {
          window.Tawk_API.hideWidget?.();
        } else {
          window.Tawk_API.showWidget?.();
        }
      };
    }

    if (w.Tawk_API) {
      if (shouldHideTawk) {
        w.Tawk_API.hideWidget?.();
      } else {
        w.Tawk_API.showWidget?.();

        if (typeof w.Tawk_API?.setDepartment === "function") {
          w.Tawk_API.setDepartment(TAWK_DEPARTMENT);
        }
      }
    }
    if (!shouldHideTawk) {
      const existing = document.getElementById(scriptId);
      if (!existing && !w.__tawkOakterScriptRequested) {
        w.__tawkOakterScriptRequested = true;
        const script = document.createElement("script");
        script.id = scriptId;
        script.async = true;
        script.src = scriptSrc;
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");
        document.head.appendChild(script);
      }
    }
  }, [shouldHideTawk]);

  return null;
}
