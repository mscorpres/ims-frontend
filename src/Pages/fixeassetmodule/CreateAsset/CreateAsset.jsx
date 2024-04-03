import React, { useState } from "react";
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
import { Row, Col, Card, Form, Input, Select, Upload, Button } from "antd";
import FormTable from "../../../Components/FormTable";
import NavFooter from "../../../Components/NavFooter";
import axios from "axios";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const api = "http://localhost:8070";


const CreateAsset = () => {
  const [form] = Form.useForm();
  const [salvage , setsavalage] = useState(0)
  // const [uploading, setUploading] = useState(false);
  const [assetrow, setassetrow] = useState([
    {
      id: v4(),
      type_of_asset: "",
      asset_categories: "",
      asset_id: "", 
      asset_name: "",
      use_date:"",
      cost_of_acquisition: "",
      warranty: "",
      warranty_info: "",
      salvage_value: "",
      usefull_life: "",
      asset_status:"",
      manufacturer: "",
      serial_number: "",
      technical_contact: "",
      location:"",
      responsible_department:"",
      contact_person:"",
      contact_number:"",
    },
  ]);
  const [billingdata, setBillingData] = useState({
    invoice_number: "",
    invoice_date: "",
    cost_of_acquisition: "",
    purchase_platform: "",
  });

  // const [loading, setLoading] = useState(false);
  // const [selectLoading, setSelectLoading] = useState(false);

  const addRows = () => {
    let dummy = [...assetrow]; // Use spread operator to create a new array
    dummy = [
      {
        id: v4(),
        type_of_asset: "",
        asset_categories: "",
        asset_id: "",
        asset_name: "",
        use_date:"",
        cost_of_acquisition: "",
        warranty: "",
        warranty_info: "",
        salvage_value: "",
        usefull_life: "",
        asset_status: "",
        manufacturer: "",
        serial_number: "",
        technical_contact: "",
        location: "",
        responsible_department: "",
        contact_person: "",
        contact_number: "",
      },
      ...dummy,
    ];
  
  
    setassetrow(dummy);
  };
  

  const removeRow = (rowId) => {
    let arr = assetrow;
    arr = assetrow;
    arr = arr.filter((row) => row.id != rowId);
    setassetrow(arr);
  };

  const handleBillingChange = (name, value) => {
 
  
    // Handle other billing fields
    setBillingData((prevData) => {
      const newData = {
        ...prevData,
        [name]: value,
      };
  
  
      return newData;
    });
  };
  

  const inputHandler = (name, value, id) => {
    console.log(name, value, id);
    let arr = [];
    arr = assetrow.map((row) => {
      if (row.id === id) {
        let obj = { ...row };
  
        if (name === "cost_of_acquisition") {
          const salvage_value = (parseFloat(value) * 5) / 100;
  
          obj = {
            ...obj,
            [name]: value,
            salvage_value: salvage_value,
          };
        } else {
          obj = {
            ...obj,
            [name]: value,
          };
        }
        return obj;
      } else {
        return row;
      }
    });
  
    console.log(arr);
    setassetrow(arr);
  };
  
  // toast.error("Error in submitted Form!")

  const handleSubmit = async () => {
    const data = [
      {
        billing_data: billingdata,
        assetdata: assetrow,
      },
    ];
    console.log(data)

    try {
      const response = await axios.post(`${api}/createAsset`, data);
      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        setassetrow([]);
        setBillingData({});
      } else {
        toast.error(response.data, "Error in submitted Form!");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  const columns = [
    {
      headerName: (
        <span onClick={addRows}>
          <AiOutlinePlusSquare
            style={{
              cursor: "pointer",
              fontSize: "1.7rem",
              opacity: "0.7",
            }}
          />
        </span>
      ),
      width: 80,
      type: "actions",
      field: "add",
      sortable: false,
      renderCell: ({ row }) => [
        <GridActionsCellItem
          icon={
            <AiOutlineMinusSquare
              style={{
                fontSize: "1.7rem",
                cursor: "pointer",
                pointerEvents:
                  assetrow.length === 1 || row.total ? "none" : "all",
                opacity: assetrow.length === 1 || row.total ? 0.5 : 1,
              }}
            />
          }
          onClick={() => {
            assetrow.length > 1 && removeRow(row.id);
            console.log(assetrow.assets);
          }}
          label="Delete"
        />,
      ],
    },
    {
      headerName: "Type of Asset",
      field: "type_of_asset",
      width: 200,
      sortable: false,
      renderCell: ({ row }) => (
        <Select
          style={{ width: "12rem" }}
          onChange={(value) => {
            console.log("Selected value:", value);
            inputHandler("type_of_asset", value, row.id);
          }}
        >
          <Select.Option value="Tangible">Tangible</Select.Option>
          <Select.Option value="In-Tangible">In-Tangible</Select.Option>
        </Select>
      ),
    },
    {
      headerName: "Asset Categories",
      field: "asset_categories",
      width: "210",
      sortable: false,
      renderCell: ({ row }) => (
        <Select
          style={{ width: "12rem" }}
          onChange={(value) => inputHandler("asset_categories", value, row.id)}
        >
          <Select.Option value="Computer and Printers">
            Computer and Printers
          </Select.Option>
          <Select.Option value="Computer and Software">
            Computer and Software
          </Select.Option>
          <Select.Option value="Furniture and Fixtures">
            Furniture and Fixtures
          </Select.Option>
          <Select.Option value="Motor Vehicles ">Motor Vehicles </Select.Option>
          <Select.Option value="Office Equipments">
            Office Equipments
          </Select.Option>
          <Select.Option value="Plant & Machinery">
            Plant & Machinery
          </Select.Option>
          <Select.Option value="Temporary Construction">
            Temporary Construction
          </Select.Option>
        </Select>
      ),
    },

    {
      headerName: "Asset Id",
      field: "asset_id",
      width: "150",
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          type="text"
          placeholder="Asset Id"
          onChange={(e) => inputHandler("asset_id", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Asset Name",
      field: "asset_name",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("asset_name", e.target.value, row.id)}
          type="text"
          placeholder="Asset Name"
        />
      ),
    },
    {
      headerName: "Use Date",
      field: "use_date",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("use_date", e.target.value, row.id)}
          type="date"
          placeholder="Date of Use"
        />
      ),
    },

    {

      headerName: "Cost Of Acquisition",
      field: "cost_of_acquisition",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        placeholder="Enter Total bill amount"
        onChange={(e) =>
          inputHandler("cost_of_acquisition", e.target.value,row.id)
        }
      />
      ),
    },
    {
      headerName: "Warranty ",
      field: "warranty",
      sortable: false,
      width: "120",
      renderCell: ({ row }) => (
        <Select
          style={{ width: "6rem" }}
          onChange={(value) => inputHandler("warranty", value, row.id)}
        >
          <Select.Option value="Yes">Yes</Select.Option>
          <Select.Option value="No">No</Select.Option>
        </Select>
      ),
    },
    {
      headerName: "Warranty Information",
      field: "warranty_info",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        suffix="Year"
        type="text"
          placeholder="Warranty Information"
          onChange={(e) =>
            inputHandler("warranty_info", e.target.value, row.id)
          }
        />
      ),
    },
    {
      headerName: "Salvage value",
      field: "salvage_value",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        type="text"
          placeholder="Salvage value"
         disabled='true'
          value={row.salvage_value}
          onChange={(e) => {
            inputHandler("salvage_value", e.target.value, row.id);
          }}
          
        />
      ),
    },
    {      
      headerName: "UseFull Life",
      field: "usefull_life",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        type="text"
          placeholder="UseFull Life"
          suffix="Year"
          onChange={(e) => inputHandler("usefull_life", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Asset Status",
      field: "asset_status",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Select
          style={{ width: "12rem" }}
          onChange={(value) => inputHandler("asset_status", value, row.id)}
        >
          <Select.Option value="Active">Active</Select.Option>
          <Select.Option value="InActive">In Active</Select.Option>
        </Select>
      ),
    },
    {
      headerName: "Manufacturer Name",
      field: "manufacturer",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        type="text"
          placeholder="Manufacturer Name"
          onChange={(e) => inputHandler("manufacturer", e.target.value, row.id)}
        />
      ),
    },

    {
      headerName: "Serial Number",
      field: "serial_number",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        type="text"
          placeholder="Serial Number"
          onChange={(e) =>
            inputHandler("serial_number", e.target.value, row.id)
          }
        />
      ),
    },
    {
      headerName: "Technical Contact",
      field: "technical_contact",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        type="text"
          placeholder="Technical Contact"
          prefix="+91"
          onChange={(e) =>
            inputHandler("technical_contact", e.target.value, row.id)
          }
        />
      ),
    },

    {
      headerName: "Location",
      field: "location",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        type="text"
          placeholder="Location"
          onChange={(e) => inputHandler("location", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Responsible Department",
      field: "responsible_department",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Select
          style={{ width: "12rem" }}
          onChange={(value) =>
            inputHandler("responsible_department", value, row.id)
          }
        >
          <Select.Option value="Hr">HR</Select.Option>
          <Select.Option value="Finance">Finance</Select.Option>
          <Select.Option value="IT">IT</Select.Option>
          <Select.Option value="Accounts">Accounts</Select.Option>
          <Select.Option value="Legal">Legal</Select.Option>
          <Select.Option value="Production">Production</Select.Option>
          <Select.Option value="R&D">R&D</Select.Option>
          <Select.Option value="Quality">Quality</Select.Option>
          <Select.Option value="Maintenance">Maintenance</Select.Option>
          <Select.Option value="Admin">Admin</Select.Option>
        </Select>
      ),
    },
    {
      headerName: "Contact Person",
      field: "contact_person",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        type="text"
          placeholder="Contact Person"
          onChange={(e) =>
            inputHandler("contact_person", e.target.value, row.id)
          }
        />
      ),
    },
    {
      headerName: "Contact Number",
      field: "contact_number",
      sortable: false,
      width: "200",
      renderCell: ({ row }) => (
        <Input
        type="text"
          placeholder="Contact Number"
          prefix="+91"
          onChange={(e) =>
            inputHandler("contact_number", e.target.value, row.id)
          }
        />
      ),
    },
  ];
  const resetHandler = () => {
    setassetrow([{
      id: v4(),
    type_of_asset:"",
    asset_categories: "",
    asset_id: "",
    asset_name: "",
    warranty: "",
    warranty_info: "",
    salvage_value: "",
    usefull_life: "",
    asset_status:"",
    manufacturer: "",
    serial_number: "",
    cost_of_acquisition: "",
    technical_contact: "",
    location:"",
    responsible_department:"",
    contact_person:"",
    contact_number:"",
  }]);
  setBillingData({
    invoice_number: "",
    invoice_date: "",
    purchase_platform: "",
  });

  form.resetFields();
    
  }

 
  return (
    <>
      <Row style={{padding:'1rem'}}>
        <Col span={6} >
          <Card title="Billing information" size="small">
            <Row>
              <Form form={form}>
                
                <Form.Item
                  name="invoice_number"
                  label="Invoice Number"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                  style={{width:'15rem'}}
                    placeholder="Enter Invoice Number"
                    onChange={(e) =>
                      handleBillingChange("invoice_number", e.target.value)
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="invoice_date"
                  label="Invoice Date"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="date"
                    onChange={(e) =>
                      handleBillingChange("invoice_date",e.target.value)
                    }
                  />
                </Form.Item>

              

                <Form.Item
                  label="Purchase Platform"
                  name="purchase_platform"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select
                    onChange={(value) =>
                      handleBillingChange("purchase_platform", value)
                    }
                     >
                    <Select.Option  value="Online">Online</Select.Option>
                    <Select.Option value="Offline">Offline </Select.Option>
                  </Select>
                </Form.Item>

                </Form>
            
            </Row>
          </Card>
        </Col>
        <Col style={{ height: "100%", padding: 0 }} span={18}>
          <Row style={{ height: "100%", padding: 0 }}>
            <Col style={{ height: "100%", padding: 0 }} span={24}>
              <Card
                style={{ height: "90%", padding: 0 , width:"98%", marginLeft:'0.3rem'}}
                bodyStyle={{ height: "100%", padding: 0 }}
                size="small"
                title="Add Asset"
              >
                <Col style={{ height: "33rem" }}>
                  <FormTable data={assetrow} columns={columns} />
                </Col>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <NavFooter
        // loading={loading}
        submitFunction={handleSubmit}
        resetFunction={resetHandler}
        nextLabel="SUBMIT"
      />

      {/* <Button htmlType="reset">Reset</Button> */}
      {/* <Button onClick={handleSubmit}>Submit</Button> */}
    </>
  );
};

export default CreateAsset;
