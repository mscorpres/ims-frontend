import React, { useEffect, useState } from "react";


import "./reconciledDetails.css";
import Button from "@mui/material/Button";
import { Checkbox, Row, Col} from "antd";
import { CaretRightOutlined, CaretLeftOutlined } from "@ant-design/icons";
// import api from "../config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {CheckOutlined} from '@ant-design/icons';
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import './reconciledDetails.css';
const ReconciledDetails = () => {

  const [bookData, setBookData] = useState([]);
  const [gstData, setGstData] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedGstRowIndex, setSelectedGstRowIndex] = useState(null);
  const [getGstdata, setgstdata] = useState([]);
  const [getbookdata, setbookdata] = useState([]);
  const [getcountdata, setcountdata] = useState(1);
  const [count , setcount] = useState(0);
  const [index, setIndex] = useState(0);


  
  const handleRowSelection = (rowId) => {
    setSelectedRowIndex(rowId);
  };

  const handleGstRowSelection = (rowid) => {
    setSelectedGstRowIndex(rowid);
  };
  
  const prevSearch = async () => {
    try {
      const response = await imsAxios.get(`/search/search?index=${index-2}`);
      const initialGstData = response.data.gstData.map((item) => ({
        ...item,
        id: item.id,
        select: false,
      }));
    
      setcount(count-1)
      setIndex(index-1);

      setBookData(response.data.bookData);
      setGstData(initialGstData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const nextSearch = async () => {
    try {
      const response = await imsAxios.get(`/search/search?index=${index}`);
      const initialGstData = response.data.gstData.map((item) => ({
        ...item,
        id: item.id,
        select: false,
      }));
      setcount(count+1)
      setIndex(index+1);
      setBookData(response.data.bookData);
      setGstData(initialGstData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };
  
  const handleClick = async () => {
      try{
        const dataToSend = {
          bookData: getbookdata,
          gstData: getGstdata,
        };
        
        const response =  await imsAxios.post(`/reconciliation/reconcillation`, dataToSend)

        if(response.status === 200){
          toast.success("successfully Matched !");
             calculate()
        }
        else{
          toast.error(" Error in Matching! ");
        }
      }
      catch(error){
        toast.error(error)

      }
  };

  const handleReset =  async() => {
    try{
      const response =  await imsAxios.get(`/search/search?index=${index}`)
      if(response.status === 200){
        toast.success("Reset Successfully!");
        setcount(0)
        setIndex(0);
      }
    }
    catch(error){
      console.error("Error in reseting the  data:", error); 
    }

  };

  useEffect(() => {
    calculate();
  }, []);

  

  async function calculate() {
  try{
    const response =  await imsAxios.get(`/calculate/calculate`)
     if(response.status === 200){
      setcountdata((response.data));
       
     }else{
      toast.error('Error in fetching data')
    }
  }
  catch(error){
    console.log(error)
  }
  }


  const column1 = [
    {
      headerName: "Select",
      field: "select",
      width: 50,
      renderCell: (params) => {
        return (
          <Checkbox
            checked={params.row.id === selectedGstRowIndex}
            onChange={() => handleGstRowSelection(params.row.id)}
            
          />
        );
      },
      headerClassName: "header-background",
    },

    {
      headerName: "#",
      field: "id",
      key: "ID    ",
      fixed: "left",
      width: 20,
      heigt: 10,
      headerClassName: "header-background",
    },
    {
      headerName: "Month",
      field: "Month",
      type: "string",
      width: 75,
      heigt: 10,
      headerClassName: "header-background",
    },
    {
      headerName: "Invoice Number",
      field: "UpdatedInvNo",
      key: "UpdatedInvNo",
      width: 125,
      heigt: 10,
      headerClassName: "header-background",
    },

    {
      headerName: "GSTIN",
      field: "Gstin",
      key: "gstin",
      width: 120,
      heigt: 10,
      headerClassName: "header-background",
    },
    {
      headerName: "Supplier Name",
      field: "Suppliername",
      key: "suppliername",
      width: 140,
      heigt: 10,
      headerClassName: "header-background",
    },
    {
      headerName: "Invoice Date",
      field: "InvoiceDate",
      key: "invoicedate",
      heigt: 20,
      headerClassName: "header-background",
    },

    {
      headerName: "Invoice Value",
      field: "InvoiceValue",
      key: "invoicevalue",
      headerClassName: "header-background",
      width: 110,
      heigt: 10,
    },
    {
      headerName: "Taxable Value",
      field: "TaxableValue",
      width: 140,
      heigt: 10,
      headerClassName: "header-background",
    },
    {
      headerName: "IGST",
      field: "IGST",
      headerClassName: "header-background",
      width: 105,
    },
    {
      headerName: "CGST",
      field: "CGST",
      headerClassName: "header-background",
      width: 105,
    },
    {
      headerName: "SGST",
      field: "SGST",
      key: "sgst",
      headerClassName: "header-background",
      width: 132,
    },
  ];

  const column2 = [
    {
      headerName: "Select",
      field: "select",
      width: 50,
      renderCell: (params) => {
        return (
          <Checkbox
            checked="true"
            onChange={() => handleRowSelection(params.row.id)}
          />
        );
      },
      headerClassName: "header-background",
    },
    {
      headerName: "#",
      field: "id",
      key: "ID    ",
      fixed: "left",
      width: 5,
      headerClassName: "header-background",
    },
    {
      headerName: "Month",
      field: "Month",
      key: "month",
      width: 10,
      headerClassName: "header-background",
    },
    {
      headerName: "Invoice Number",
      field: "UpdatedInvNo",
      key: "UpdatedInvNo",
      width: 160,
      headerClassName: "header-background",
    },
    {
      headerName: "GSTIN",
      field: "GSTINUIN",
      key: "gstinuin",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Supplier Name",
      field: "SupplierName",
      width: 210,
      headerClassName: "header-background",
    },

    {
      headerName: "Invoice Date",
      field: "INVDate",
      key: "invdate",
      width: 90,
      headerClassName: "header-background",
    },

    {
      headerName: "Invoice Value",
      field: "InvoiceValue",
      key: "invoicevalue",
      width: 140,
      height: 10,
      headerClassName: "header-background",
    },

    {
      headerName: "Taxable Value",
      field: "TaxableValue",
      key: "taxable value",
      width: 100,
      height: 10,
      headerClassName: "header-background",
    },
    {
      headerName: "IGST",
      field: "IGST",
      key: "igst",
      width: 80,
      height: 10,
      headerClassName: "header-background",
    },
    {
      headerName: "CGST",
      field: "CGST",
      key: "cgst",
      width: 80,
      height: 10,
      headerClassName: "header-background",
    },
    {
      headerName: "SGST",
      field: "SGST",
      key: "sgst",
      headerClassName: "header-background",
    },

    {
      headerName: "Vch Date",
      field: "VchDate",
      key: "vchdate",
      width: 95,
      headerClassName: "header-background",
    },
  ];

 
  return (
    <>
     
         <Row  className= "main-container" style={{ width:'100%', height:'90%', padding:'1rem',marginTop:'1rem' }} >
          <Col span={4}  className="left-side-div"  style={{border:'1px solid #D3D3D3'}}>
          <h3 style={{textAlign:'center',marginTop:'1rem'}}>Reconciled Details</h3>
          <p style={{textAlign:'center',marginTop:'2rem'}}> Remaining Data: {count}/{getcountdata.data}</p>
           <Row justify='space-between' style={{marginTop:'2rem',paddingLeft:'1rem', paddingRight:'1rem'}}>
             <Col  >
              <Button
                  onClick={prevSearch}
               
                style={{ backgroundColor:'#33BBFF', color:'white' }}
              >
                {" "}
                <CaretLeftOutlined /> Prev
              </Button>
              </Col>
              
              <Col>
              <Button
                 onClick={nextSearch}
                style={{ backgroundColor:'#33BBFF', color:'white' }}
                
              >
                {" "}
                Next
                <CaretRightOutlined />
              </Button>
              </Col>
              </Row>

              <Row justify='space-around' style={{marginTop:'18rem', marginBottom:'2rem'}}>
              <Col >
            <Button
              style={{color: "#04B0A8", backgroundColor:'#FFFF',  border:'1px solid #04B0A8'}}
              onClick={handleReset}
            
            >
                  <svg
                  style={{marginRight:'0.5rem'}}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.52754 0.204726C3.65863 0.335983 3.73227 0.513906 3.73227 0.699415C3.73227 0.884924 3.65863 1.06285 3.52754 1.1941L2.38882 2.33282H8.16641C9.32018 2.33282 10.448 2.67495 11.4074 3.31596C12.3667 3.95696 13.1144 4.86804 13.5559 5.93399C13.9975 6.99994 14.113 8.17288 13.8879 9.30449C13.6628 10.4361 13.1072 11.4755 12.2914 12.2914C11.4755 13.1072 10.4361 13.6628 9.30449 13.8879C8.17288 14.113 6.99994 13.9975 5.93399 13.5559C4.86804 13.1144 3.95696 12.3667 3.31596 11.4074C2.67495 10.448 2.33282 9.32018 2.33282 8.16641C2.33282 7.98075 2.40657 7.80269 2.53785 7.67141C2.66914 7.54013 2.84719 7.46638 3.03285 7.46638C3.21851 7.46638 3.39657 7.54013 3.52785 7.67141C3.65913 7.80269 3.73288 7.98075 3.73288 8.16641C3.73288 9.04328 3.9929 9.90046 4.48007 10.6295C4.96723 11.3586 5.65965 11.9269 6.46977 12.2625C7.27989 12.598 8.17133 12.6858 9.03135 12.5147C9.89137 12.3437 10.6813 11.9214 11.3014 11.3014C11.9214 10.6813 12.3437 9.89137 12.5147 9.03135C12.6858 8.17133 12.598 7.27989 12.2625 6.46977C11.9269 5.65965 11.3586 4.96723 10.6295 4.48007C9.90046 3.9929 9.04328 3.73288 8.16641 3.73288H2.38882L3.52754 4.8716C3.65119 5.0043 3.71851 5.17982 3.71531 5.36117C3.71211 5.54253 3.63864 5.71556 3.51039 5.84382C3.38213 5.97208 3.20909 6.04555 3.02774 6.04875C2.84638 6.05195 2.67086 5.98463 2.53816 5.86097L0.204726 3.52754C0.0736335 3.39628 0 3.21836 0 3.03285C0 2.84734 0.0736335 2.66942 0.204726 2.53816L2.53816 0.204726C2.66942 0.0736335 2.84734 0 3.03285 0C3.21836 0 3.39628 0.0736335 3.52754 0.204726Z"
                      fill="#04B0A8"
                    />
                  </svg>              
                  Reset
            </Button>
            </Col>

            <Col>

           
            <Button  
             onClick={handleClick}
            style={{background:'#355958' , color:'white'}}
            >
             <CheckOutlined />  Match
            </Button>
            </Col>
            </Row>

            </Col>
            <Col className="right-side-div" style={{ marginLeft:'0.5rem'}}>
            <div style={{width:'72rem'}}>
              <Col style={{border: '1px solid #D3D3D3', height:'12rem'}}>
          <MyDataTable
            sx={{
              "& .MuiDataGrid-cell": {
                  // fontSize: "0.76rem",
                  // tfoot: "0.5rem",
              },
              "& .header-background": {
                backgroundColor: "#E6E6E6",
                color: "#1A1A1A",
              },
            }}
           rows={bookData}
           columns={column2}
           hideFooter

           onRowSelectionModelChange={(row) => {
            const index = row[0];
            const bookdata = bookData.filter(
              (item) => item.id === index
            )[0];

            setbookdata(bookdata);
          }}
          />
          </Col>
          </div>
          <div  style={{marginTop:'1rem'}}>
            <Col style={{border: '1px solid #D3D3D3', height:'20rem'}} >
         
           <MyDataTable
           sx={{
            "& .MuiDataGrid-cell": {
              // fontSize: "0.76rem",
              // tfoot: "0.5rem",
            },
            "& .header-background": {
              backgroundColor: "#E6E6E6",
              color: "#1A1A1A",
            },
          }}
           rows={gstData}
           columns={column1}
           hideFooter
           size="small"          
            onRowSelectionModelChange={(row) => {
            const index = row[0];
            const gstdata = gstData.filter((item) => item.id === index)[0];

            setgstdata(gstdata);
            
          }}
          />
          </Col>
          </div>
          </Col>
          </Row>
    </>
  );
};

export default ReconciledDetails;