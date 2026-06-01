import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Store } from "./Features/Store";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConfigProvider } from "antd";
import * as Sentry from "@sentry/react";

const theme = {
  token: {
    colorPrimary: "#04b0a8",
    colorInfo: "#04b0a8",
    colorSuccess: "#04b0a8",
    fontSizeHeading5: 16,
  },
  components: {
    Button: {
      // colorText: "rgba(255, 255, 255, 0.88)",
    },
    Divider: {
      verticalMarginInline: 4,
      margin: 5,
      marginLG: 8,
    },

    Form: {
      margin: 4,
      labelColonMarginInlineEnd: 4,
      labelHeight: 0,
      itemMarginBottom: 10,
      lineHeight: 1.0,
    },
    Drawer: {
      paddingLG: 15,
      padding: 10,
      paddingXS: 20,
    },
    Menu: {
      colorText: "rgba(115, 115, 115, 0.88)",
      itemColor: "rgba(115, 115, 115, 0.88)",
      collapsedIconSize: 18,
      itemHeight: 50,
      // padding: 32,
      // itemPaddingInline: 24,
    },
    Select: {
      optionFontSize: 13,
    },
    Tag: {
      marginXS: 4,
      margin: 4,
    },
    Tooltip: {
      colorBgSpotlight: "rgb(4, 176, 168)",
    },
    Card: {
      headerFontSizeSM: 16,
      headerFontSize: 18,
      colorBgContainer: "rgba(247, 249, 254,1)",
    },
  },
};
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // "development" or "production"
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance monitoring: capture 10% of transactions in production
  tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,
  // Session Replay: capture 10% of sessions, 100% on errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const googleId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;

const root = ReactDOM.createRoot(document.getElementById("root"));
// unregisterServiceWorker();
root.render(
  <GoogleOAuthProvider clientId={googleId}>
    <ConfigProvider theme={theme}>
      <Provider store={Store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  </GoogleOAuthProvider>,
);
