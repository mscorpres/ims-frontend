import React, { useEffect, useState } from "react";
import MyDataTable from "../../Components/MyDataTable";
import axios from "axios";
import { Col ,Row} from "antd";
import { toast } from "react-toastify";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { AiFillEdit } from "react-icons/ai";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import AssetUpdateForm from '../../Pages/fixeassetmodule/CreateAsset/AssetUpdateForm'
import "react-toastify/dist/ReactToastify.css";
import printFunction, {
    downloadFunction,
  } from "../../Components/printFunction";
  import { downloadCSV } from '../../Components/exportToCSV';
const api = "http://localhost:8070";



const ViewAsset = () => {
  const [getAsset, setAssetData] = useState([]);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const handleEdit = (id) => {
    const rowToEdit = getAsset.find(row => row.id === id);  
    setSelectedRowData(rowToEdit);
    setSidebarOpen(true);
  };
   console.log(selectedRowData)

   const actioncolumn =[
    {
        headerName: "Action",
        type: "actions",
        field: "Action",
        headerClassName: "header-background",
        width: 65,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<AiFillEdit />}
            onClick={() => handleEdit(params.id)}
        
          />,
        ],
      },
   ];

  const columns = [

    {
      headerName: "Invoice Number",
      field: "invoice_number",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Invoice Date",
      field: "invoice_date",
      width: 150,
      headerClassName: "header-background",
    },
    
    {
      headerName: "Cost of Acquisition",
      field: "cost_of_acquisition",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Purchase Platform",
      field: "purchase_platform",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Type of Asset",
      field: "type_of_asset",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Asset Categories",
      field: "asset_categories",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Asset Id",
      field: "asset_id",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Asset Name",
      field: "asset_name",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Warranty",
      field: "warranty",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Warranty Information",
      field: "warranty_info",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Salvage Value",
      field: "salvage_value",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Useful Life",
      field: "usefull_life",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Asset Status",
      field: "asset_status",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Manufacturer",
      field: "manufacturer",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Serial Number",
      field: "serial_number",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Technical Contact",
      field: "technical_contact",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Location",
      field: "location",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Responsible Department",
      field: "responsible_department",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Contact Person",
      field: "contact_person",
      width: 150,
      headerClassName: "header-background", 
    },
    {
      headerName: "Contact Number",
      field: "contact_number",
      width: 150,
      headerClassName: "header-background",
    },
  ];

  const getAsstData = async () => {
    try {
      const response = await axios.get(`${api}/getAsset`);
      console.log(response)

      if (response.data.code === 500) {
        toast.error(response.data.message.msg);
      } else {
        setAssetData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 

  useEffect(() => {
    getAsstData();
  }, []);

 

  return (
    <>
   
      <Col style={{height:"85%", paddingLeft:'1.5rem', paddingRight:'1.5rem'}}>
        <Col style={{marginBottom:'0.5rem' }} push={23}>
       <CommonIcons
          action="downloadButton"
          type="primary"
          
          onClick={() => {
            downloadCSV(getAsset, columns, 'Asset Data');
          }}
        />
        </Col>
       <MyDataTable data = {getAsset} columns={[...actioncolumn, ...columns]} />
       </Col>

      {isSidebarOpen && (
      <AssetUpdateForm
        onClose={() => {
          setSidebarOpen(false);
          setSelectedRowData(null); 
        }}
        columns={columns}
        selectedRowData={selectedRowData}
        getAssetdata={getAsset}
      />
    )}
    
    </>
  );
};

export default ViewAsset;
