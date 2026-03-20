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


// Remove Tawk.to branding (2026): hides footer branding, "Add Chat to your website",
  // popout icon/button, and common tawk branding containers inside the widget iframe.
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Guard: don't re-init if this component remounts.
    const w = window;
    if (w.__tawkOakterBrandingRemovalInit) return;
    w.__tawkOakterBrandingRemovalInit = true;

    var STYLE_ID = "hide-tawk-branding";

    // NOTE: Avoid `:has()`/`:contains()` because older browser support is inconsistent.
    var BRANDING_CSS = [
      "a[href*='tawk.to'] { display: none !important; }",
      "a[href*='utm_source=tawk-messenger'] { display: none !important; }",
      "a[title*='Add Chat to your website'] { display: none !important; }",
      ".tawk-branding { display: none !important; }",
      "[class*='tawk-branding'] { display: none !important; }",
        "[class*='tawk-bottom-navbar'] {  bottom: 0px !important; }",
         "[class*='tawk-toolbar-menu'] { display: none !important; }",
      ".tawk-padding-small { display: none !important; }",
    ].join("\n");

    var RETRY_DELAY_MS = 1500;

    var processedIframes = new WeakSet();
    var pendingRetries = new Map();
    var debounceTimer = null;

    function injectStyle(doc) {
      try {
        if (!doc || !doc.createElement) return false;
        if (doc.getElementById && doc.getElementById(STYLE_ID)) return true;

        var style = doc.createElement("style");
        style.id = STYLE_ID;
        style.textContent = BRANDING_CSS;

        var target = doc.head || doc.documentElement;
        if (target) {
          target.appendChild(style);
          return true;
        }
      } catch (_) {
        // Cross-origin — expected.
      }
      return false;
    }

    function hidePopoutButtons(doc) {
      try {
        if (!doc || !doc.querySelectorAll) return;
        // Primary strategy: hide by class. This also acts as a fallback
        // for any cases where CSS selectors inside BRANDING_CSS miss.
        var icons = doc.querySelectorAll(".tawk-icon-popout");
        for (var i = 0; i < icons.length; i++) {
          var btn = icons[i].closest && icons[i].closest("button");
          if (btn && btn.style) {
            btn.style.setProperty("display", "none", "important");
          }
        }
      } catch (_) {}
    }

    function injectIntoIframe(iframe) {
      try {
        var doc = iframe.contentDocument;
        if (!doc) {
          // Schedule a single retry if iframe not ready yet
          if (!pendingRetries.has(iframe)) {
            var timeout = setTimeout(function () {
              pendingRetries.delete(iframe);
              injectIntoIframe(iframe);
            }, RETRY_DELAY_MS);
            pendingRetries.set(iframe, timeout);
          }
          return;
        }

        injectStyle(doc);
        hidePopoutButtons(doc);
      } catch (_) {
        // Cross-origin — expected.
      }
    }

    function handleIframe(iframe) {
      if (processedIframes.has(iframe)) return;

      var title = ((iframe.title || "") + "").toLowerCase();
      if (title.indexOf("chat") === -1) return;

      processedIframes.add(iframe);

      // Inject immediately (may already be loaded)
      injectIntoIframe(iframe);

      // Re-inject on subsequent loads (SPA navigation, widget rebuild).
      iframe.addEventListener("load", function () {
        injectIntoIframe(iframe);
      });
    }

    function scanIframes(root) {
      try {
        var iframes = (root || document).querySelectorAll
          ? (root || document).querySelectorAll("iframe")
          : [];
        for (var i = 0; i < iframes.length; i++) {
          handleIframe(iframes[i]);
        }
      } catch (_) {}
    }

    function onMutations(mutations) {
      var foundNewIframe = false;

      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node && node.nodeName === "IFRAME") {
            handleIframe(node);
            foundNewIframe = true;
          } else if (node && node.nodeType === 1 && node.querySelectorAll) {
            var nested = node.querySelectorAll("iframe");
            if (nested.length) {
              for (var k = 0; k < nested.length; k++) {
                handleIframe(nested[k]);
              }
              foundNewIframe = true;
            }
          }
        }
      }

      // Debounced re-scan: Tawk sometimes rebuilds widget DOM entirely.
      if (foundNewIframe && !debounceTimer) {
        debounceTimer = setTimeout(function () {
          debounceTimer = null;
          scanIframes();
          hidePopoutButtons(document);
        }, 500);
      }
    }

    // Bootstrap: main document branding (outside iframes)
    injectStyle(document);
    hidePopoutButtons(document);

    // Initial iframe scan
    scanIframes();

    // Watch for dynamically added iframes
    var observer = null;
    if (typeof MutationObserver !== "undefined" && document.body) {
      observer = new MutationObserver(onMutations);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      try {
        if (observer) observer.disconnect();
      } catch (_) {}

      pendingRetries.forEach(function (t) {
        clearTimeout(t);
      });
      pendingRetries.clear();

      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    };
  }, []);




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
