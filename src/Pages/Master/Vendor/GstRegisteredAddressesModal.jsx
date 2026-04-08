import { Modal, Typography, Divider, Button } from "antd";

const GstRegisteredAddressesModal = ({
  open,
  onCancel,
  gstDetails,
  onUseAddress,
}) => {
  return (
    <Modal
      title="GST Registered Addresses"
      open={open}
      onOk={onCancel}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      {gstDetails && (
        <>
          <Divider style={{ margin: "8px 0 16px" }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            {gstDetails.pradr?.addr && (
              <div
                key="primary"
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                  padding: 12,
                  background: "#fafafa",
                }}
              >
                <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
                  Primary Address (pradr)
                  {gstDetails.pradr?.ntr ? ` - ${gstDetails.pradr.ntr}` : ""}
                </Typography.Text>
                <Typography.Paragraph style={{ marginBottom: 12 }}>
                  {[
                    gstDetails.pradr.addr.bnm,
                    gstDetails.pradr.addr.bno,
                    gstDetails.pradr.addr.st,
                    gstDetails.pradr.addr.loc,
                    gstDetails.pradr.addr.locality,
                    gstDetails.pradr.addr.dst,
                    gstDetails.pradr.addr.stcd,
                    gstDetails.pradr.addr.pncd,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Typography.Paragraph>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => onUseAddress(gstDetails.pradr.addr)}
                >
                  Use This Address
                </Button>
              </div>
            )}

            {Array.isArray(gstDetails.adadr) &&
              gstDetails.adadr.map((item, index) => (
                <div
                  key={`adadr-${index}`}
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 8,
                    padding: 12,
                    background: "#fafafa",
                  }}
                >
                  <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
                    {index + 1}. {item.ntr || "Additional Address"}
                  </Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 12 }}>
                    {item.addr
                      ? [
                          item.addr.bnm,
                          item.addr.bno,
                          item.addr.st,
                          item.addr.loc,
                          item.addr.locality,
                          item.addr.dst,
                          item.addr.stcd,
                          item.addr.pncd,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : ""}
                  </Typography.Paragraph>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => onUseAddress(item.addr)}
                    disabled={!item.addr}
                  >
                    Use This Address
                  </Button>
                </div>
              ))}
          </div>
        </>
      )}
    </Modal>
  );
};

export default GstRegisteredAddressesModal;
