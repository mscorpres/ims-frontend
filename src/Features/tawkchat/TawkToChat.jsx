"use client";

import { useEffect, useMemo } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const TAWK_PROPERTY_ID = "69b4f160ffafbe1c36c96d79/1jk5910ed";
const TAWK_WIDGET_ID = "1jk5910ed";

// This must match EXACTLY the department name in tawk.to dashboard
const TAWK_DEPARTMENT = "Oakter";

/** Paths where Tawk chat must be hidden */
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

    const name = data.username ?? "";
    const email = data.crn_email ?? "";
    const id = data.crn_id ?? "";
    const mobile = data.crn_mobile ?? "";

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

  // @ts-ignore
  if (typeof window.Tawk_API?.setAttributes === "function") {
    // @ts-ignore
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

    // Keep the latest hide/show intent accessible to the one-time onLoad handler.
    w.__tawkOakterShouldHide = shouldHideTawk;

    // Setup the onLoad callback once
    if (!w.__tawkOakterOnLoadSet) {
      w.__tawkOakterOnLoadSet = true;

      // @ts-ignore
      window.Tawk_API = window.Tawk_API || {};
      // @ts-ignore
      window.Tawk_API.onLoad = function () {
        setTawkVisitorAttributes(getVisitorFromLocalStorage());

        // ── Auto-route to Oakter department ──────────────────────
        // @ts-ignore
        if (typeof window.Tawk_API?.setDepartment === "function") {
          // @ts-ignore
          window.Tawk_API.setDepartment(TAWK_DEPARTMENT);
        }

        // Hide or show based on auth state
        // @ts-ignore
        if (w.__tawkOakterShouldHide) {
          // @ts-ignore
          window.Tawk_API.hideWidget?.();
        } else {
          // @ts-ignore
          window.Tawk_API.showWidget?.();
        }
      };
    }

    // If the widget API is already ready, update hide/show immediately on route change
    if (w.Tawk_API) {
      // @ts-ignore
      if (shouldHideTawk) {
        // @ts-ignore
        w.Tawk_API.hideWidget?.();
      } else {
        // @ts-ignore
        w.Tawk_API.showWidget?.();
        // Re-apply department on route change in case it was reset
        // @ts-ignore
        if (typeof w.Tawk_API?.setDepartment === "function") {
          // @ts-ignore
          w.Tawk_API.setDepartment(TAWK_DEPARTMENT);
        }
      }
    }

    // Load the widget script only when we should show it
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
