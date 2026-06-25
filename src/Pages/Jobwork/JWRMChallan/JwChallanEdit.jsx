import { useEffect, useState } from "react";
import { Button, Result } from "antd";
import { useSearchParams } from "react-router-dom";
import JWRMChallanEditAll from "./JWRMChallanEditAll";
import JWRMChallanEditMaterials from "./JWRMChallanEditMaterials";

// Standalone page for /jw-issue-challan edit actions, opened in a new tab.
// It reuses the existing drawer components as-is (full width they behave
// like a page), so all challan logic lives in one place.
function JwChallanEdit() {
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("mode"); // "create" | "edit"
  const challanId = searchParams.get("challanId");
  const sku = searchParams.get("sku");
  const fetchTransactionId = searchParams.get("fetchId");
  const saveTransactionId = searchParams.get("saveId");

  const [editiJWAll, setEditJWAll] = useState(
    mode === "create"
      ? { sku, fetchTransactionId, saveTransactionId }
      : false
  );
  const [editingJWMaterials, setEditingJWMaterials] = useState(
    mode === "edit" ? challanId : false
  );

  // The drawers call getRows() after a successful save — here that means
  // signalling the challan list page (other tab) to refresh its rows.
  const notifyListPage = () => {
    localStorage.setItem("jwChallanUpdated", String(Date.now()));
  };

  // Both drawers close themselves (set their state to false) on save or
  // cancel — at that point this tab is done, so close it.
  const closed = !editiJWAll && !editingJWMaterials;
  useEffect(() => {
    if (closed) {
      const timer = setTimeout(() => window.close(), 1000);
      return () => clearTimeout(timer);
    }
  }, [closed]);

  if (closed) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="info"
          title="Challan editor closed"
          subTitle="This tab will close automatically. If it doesn't, use the button below."
          extra={
            <Button type="primary" onClick={() => window.close()}>
              Close Tab
            </Button>
          }
        />
      </div>
    );
  }

  return mode === "create" ? (
    <JWRMChallanEditAll
      editiJWAll={editiJWAll}
      setEditJWAll={setEditJWAll}
      getRows={notifyListPage}
    />
  ) : (
    <JWRMChallanEditMaterials
      editingJWMaterials={editingJWMaterials}
      setEditingJWMaterials={setEditingJWMaterials}
      getRows={notifyListPage}
    />
  );
}

export default JwChallanEdit;
