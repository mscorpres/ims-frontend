import React,{useState, useEffect} from 'react'
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';

import DeleteIcon from '@mui/icons-material/Delete';
// import api from '../config';
import {
  QuestionCircleOutlined,
  ExclamationCircleFilled 
} from "@ant-design/icons";
import GstSideBarForm from "../GstSideBarForm/GstSideBarForm";
import MyDataTable from '../../../Components/MyDataTable';
import {  Popconfirm, Row, Col ,Button,Modal} from 'antd';
import { toast } from "react-toastify";
import { imsAxios } from '../../../axiosInterceptor';
import "react-toastify/dist/ReactToastify.css";
import { downloadCSV } from '../../../Components/exportToCSV';


const ViewGstData = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [gstData, setGstData] = useState([]);
  const [selectedGstRowData, setSelectedGstRowData] = useState(null);



  const handleEdit = (id) => {
    const rowToEdit = gstData.find((row) => row.id === id);
    setSelectedGstRowData(rowToEdit);
    setSidebarOpen(true);
  };

  const handleDelete = async (selectedGstRowData) => {
    try {
      const id = selectedGstRowData;
      const response =  await imsAxios.post(`/gst/deletegstdata/${id}`);
      if(response.status === 200){
        toast.success("Deleted successfully!");
         getgstData();

      }
      else{
        toast.error("Error in deleting data!");
      }
      
    } catch (error) {
      console.log(error)
    }
  };

  const cancel = (e) => {

  };


    const columns = [
        {
          headerName: "Sr no.",
          field: "id",
          type: "number",
          width: 60,
          headerClassName: "header-background",
        },
        {
          headerName: "Month",
          field: "Month",
          type: "string",
          width: 110,
          headerClassName: "header-background",
        },
        {
          headerName: "GSTIN",
          field: "Gstin",
          width: 160,
          headerClassName: "header-background",
        },
        {
          headerName: "Supplier Name",
          field: "Suppliername",
          width: 300,
          headerClassName: "header-background",
        },
        {
          headerName: "Invoice Number",
          field: "InvoiceNumber",
          width: 180,
          headerClassName: "header-background",
        },
        {
          headerName: "Invoice Type",
          field: "InvoiceType",
          width: 120,
          headerClassName: "header-background",
        },
        {
          headerName: "Invoice Date",
          field: "InvoiceDate",
          width: 120,
          headerClassName: "header-background",
        },
    
        {
          headerName: "Invoice Value",
          field: "InvoiceValue",
          width: 120,
         headerClassName: "header-background",
        },
        {
          headerName: "Place of Supply",
          field: "PlaceOfSupply",
          width: 120,
          headerClassName: "header-background",
        },
        {
          headerName: "Rate of Tax",
          field: "RateOfTax",
          headerClassName: "header-background",
        },
    
        {
          headerName: "Taxable Value",
          field: "TaxableValue",
          headerClassName: "header-background",
        },
        {
          headerName: "IGST",
          field: "IGST",
          headerClassName: "header-background",
        },
        {
          headerName: "CGST",
          field: "CGST",
          headerClassName: "header-background",
        },
        {
          headerName: "SGST",
          field: "SGST",
          headerClassName: "header-background",
        },
        {
          headerName: "Status",
          field: "statusValue",
          width: 300,
          headerClassName: "header-background",
        },
        {
          headerName: "Reconciled",
          field: "Reconciled",
          width: 120,
          headerClassName: "header-background",
        },
        {
          headerName: "Actions",
          field: "Actions",
          width: 100,
          headerClassName: "header-background",
          renderCell: (params) => (
            <>
              <button
                onClick={() => handleEdit(params.row.id)}
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                }}
              >
                <EditIcon
                  style={{ fontSize: "1rem", color: "green", borderRadius: "1rem" }}
                />
              </button>
    
              <Popconfirm
                title="Delete this item"
                description="Are you sure to delete this data?"
                onConfirm={() => handleDelete(params.row.id)}
                onCancel={cancel}
                icon={
                  <QuestionCircleOutlined
                    style={{
                      color: "red",
                    }}
                  />
                }
              >
                <button
                  style={{
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                  }}
                >
                  <DeleteIcon
                    style={{ fontSize: "1rem", color: "red", borderRadius: "1rem" }}
                  />
                </button>
              </Popconfirm>
            </>
          ),
        },
      ];
      
    

      const getgstData = async () => {
        try{
       const response = await imsAxios.get(`/gst/getgstdata`)
        
          if(response.data.code === 500){
            toast.error(response.data.message.msg)

          }
          else{
            setGstData(response.data.gst);


          }
        }
          catch(error){
            console.error("Error fetching data:", error);
          }
      };
    
    
      useEffect(() => {
        getgstData();
      }, []);
    
      const { confirm } = Modal;

      const showConfirm = () => {
        confirm({
          title: 'Do you Want to Validate Data?',
          icon: <ExclamationCircleFilled />,
         
          onOk() {
            ValidataData()
          },
         
        });
      };
      const ValidataData = async () =>{
        try{ 
        const response =  await imsAxios.get(`/validate/validatedata`);

        if(response.status === 200){
            toast.success('Validation Successfully!')

        }
        else{
            toast.error('Error in validating data')
        }


        } catch(error){
            toast.error(error)
        }

    }


  return (
    <> 

<Button style={{marginLeft:'2rem' ,marginTop:'0.2rem'}} onClick={showConfirm} >Validate Data</Button>
<Button style={{marginLeft:'2rem', marginLeft:'1rem'}} onClick={()=> downloadCSV(gstData,columns,'gstdata')} >Download</Button>
  <Col style={{height:"80%", paddingLeft:'2rem', paddingRight:'2rem', marginTop:'1rem'}}>    
      
      <MyDataTable 
    
       columns = {columns}
       data = {gstData}
      /> 



      
      {isSidebarOpen && (
        <GstSideBarForm
          onClose={() => {
            setSidebarOpen(false);
            selectedGstRowData(null); 
          }}
          columns={columns}
          selectedGstRowData={selectedGstRowData}
          gstData={gstData}
        />
      )}
       
       </Col>


    </>
  )
}

export default ViewGstData