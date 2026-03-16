import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Form, Modal } from "antd";
import MySelect from "../../../../Components/MySelect";
import { imsAxios } from "../../../../axiosInterceptor";

const EditVendorLocationModal = ({ open, onClose, vendor, onSuccess }) => {
  const [locationOptions, setLocationOptions] = useState([]);
  const [vendorLoc, setVendorLoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const fetchLocationOptions = async () => {
    try {
      const { data } = await imsAxios.get("/vendor/getAllLocation");
      if (data?.code === 200 && Array.isArray(data?.data)) {
        const arr = data.data.map((row) => ({
          text: row.loc_name,
          value: row.location_key,
        }));
        setLocationOptions(arr);
      } else {
        setLocationOptions([]);
      }
    } catch (e) {
      setLocationOptions([]);
    }
  };

  const fetchCurrentVendorLoc = async () => {
    if (!vendor?.vendor_code) return;
    setFetchLoading(true);
    try {
      const { data: vendorData } = await imsAxios.post("/vendor/getVendor", {
        vendor_id: vendor.vendor_code,
      });
      const vendorRes = Array.isArray(vendorData?.data)
        ? vendorData?.data?.[0]
        : vendorData?.data;
      if (vendorRes?.vendor_loc) {
        setVendorLoc(vendorRes.vendor_loc);
      } else {
        setVendorLoc("");
      }
    } catch (e) {
      setVendorLoc("");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (open && vendor) {
      fetchLocationOptions();
      fetchCurrentVendorLoc();
    } else if (!open) {
      setVendorLoc("");
    }
  }, [open, vendor]);

  const handleUpdate = async () => {
    if (!vendor?.vendor_code) {
      toast.error("Vendor not selected");
      return;
    }
    if (!vendorLoc) {
      toast.error("Please select a vendor location");
      return;
    }
    setLoading(true);
    try {
      const data = await imsAxios.put("/vendor/updateVendorLocation", {
        vendorcode: vendor.vendor_code,
        vendor_loc: vendorLoc,
      });
      if (data?.success) {
        toast.success(data?.message ?? "Vendor location updated");
        onSuccess?.();
        onClose();
      } else {
        toast.error(data?.message ?? "Failed to update vendor location");
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.message ?? e?.message ?? "Failed to update vendor location"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Vendor Location"
      open={!!open}
      onCancel={onClose}
      width={480}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleUpdate}
        >
          Update location
        </Button>,
      ]}
    >
      {vendor && (
        <Form layout="vertical" size="small">
          <Form.Item label="Vendor">
            <span>
              {vendor.vendor_name} ({vendor.vendor_code})
            </span>
          </Form.Item>
          <Form.Item
            label="Vendor Location (company location)"
            required
          >
            <MySelect
              placeholder="Select location"
              value={vendorLoc || undefined}
              options={locationOptions}
              onChange={(val) => setVendorLoc(val || "")}
              style={{ width: "100%" }}
              disabled={fetchLoading}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditVendorLocationModal;
