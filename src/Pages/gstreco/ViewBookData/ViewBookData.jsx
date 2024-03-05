import React,{useState, useEffect} from 'react'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// import api from '../config';
import {
  QuestionCircleOutlined,
  ExclamationCircleFilled
} from "@ant-design/icons";
import SideForm from "../SideForm/SideForm";
import 'react-toastify/dist/ReactToastify.css';
import {  toast } from 'react-toastify';
import MyDataTable from '../../../Components/MyDataTable';
import {  Popconfirm, Row, Col ,Button,Modal} from 'antd';
import { imsAxios } from '../../../axiosInterceptor';
import { downloadCSV } from '../../../Components/exportToCSV';



const ViewBookData = () => {

  const [getbookdata, setBookData] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const handleEdit = (id) => {
   const rowToEdit = getbookdata.find(row => row.id === id);  
   setSelectedRowData(rowToEdit);
   setSidebarOpen(true);
  
 }; 


  
 const handleDelete = async (selectedRowData) => {
  const id = selectedRowData;

  try {
   const response =  await imsAxios.post(`/book/deletebook/${id}`);
   if(response.status===200){
    toast.success('Deleted successfully!');
    getData()
   }
   else{
    toast.error('Error in deleting data!');
   }
    
  } catch (error) {
    console.log(error);
  }
};





  const cancel = (e) => {
  };


    const columns = [
        
        {
            field: "id",
            headerName: "Sr no.",
             fixed: "left",
            width: 60,
            headerClassName: 'header-background',
          },
          {
            headerName: "Month",
            field: "Month",
            width: 120,
            headerClassName: 'header-background',
          },
          {
            headerName: "GST No.",
            field: "GSTINUIN",
            width: 140,
            headerClassName: 'header-background',
          },
          {
            headerName: "Supplier Name",
            field: "SupplierName",
            width: 200,
            headerClassName: 'header-background',
          },
      
          {
            headerName: "Vch No.",
            field: "VchNo",
            width: 120,
            headerClassName: 'header-background',
          },
          {
            headerName: "Vch Date",
            field: "VchDate",
            width: 120,
            headerClassName: 'header-background',
          },
          {
            headerName: "Vch Type",
            field: "VchType",
            width: 120,            
            headerClassName: 'header-background',
          },
      
          {
            headerName: "Invoice No.",
            field: "InvoiceNo",
            width: 120,            
            headerClassName: 'header-background',
          },
      
          {
            headerName: "Invoice Date",
            field: "INVDate",
            width: 120,
            headerClassName: 'header-background',
          },
      
          {
            headerName: "Invoice Value",
            field: "InvoiceValue",
            width: 120,
            headerClassName: 'header-background',
          },
      
          {
            headerName: "POS",
            field: "POS",
            width: 120,
            headerClassName: 'header-background',
          },
      
          {
            headerName: "Type",
            field: "Type",
            width: 90,
            headerClassName: 'header-background',
          },
      
          {
            headerName: "RCM",
            field: "RCM",
            width: 90,
            headerClassName: 'header-background',
          },
      
          {
            headerName: "Supply Type",
            field: "SupplyType",
            width: 90,
            headerClassName: 'header-background',
          },
      
          {
            headerName: "Taxable Value",
            field: "TaxableValue",
            width: 100,
            headerClassName: 'header-background',
          },
          {
            headerName: "IGST",
            field: "IGST",
            width: 90,
            headerClassName: 'header-background',
          },
          {
            headerName: "CGST",
            field: "CGST",
            width: 90,
            headerClassName: 'header-background',
          },
          {
            headerName: "SGST",
            field: "SGST",
                headerClassName: 'header-background',
          },
          {
            headerName: "Status",
            field: "statusValue",
            width: 220,
            headerClassName: 'header-background',
          
          },
          {
            headerName: "Reconciled",
            field: "Reconciled",
            width: 115,
             headerClassName: 'header-background',
          },
          {
            headerName: "Actions",
            field: "Actions",
            width: 100,
            headerClassName: 'header-background',
            renderCell: (params) => (
              <>
                <button
                   onClick={() => handleEdit(params.row.id)}
                   style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
                  >
                 <EditIcon style={{ fontSize: '1rem',   color: 'green', borderRadius: '1rem' , }} />
                </button>
      
                <Popconfirm
             title="Delete this item"
             description="Are you sure to delete this data?"
            onConfirm={()=>handleDelete(params.row.id)}
           
            onCancel={cancel}
          icon={
            <QuestionCircleOutlined
              style={{
                color: 'red',
              }}
            />
          }
        >
                <button
                style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}  
                >
                <DeleteIcon  style={{ fontSize: '1rem',   color: 'red', borderRadius: '1rem' , }}/>
      
                </button>
                </Popconfirm>
                </>
            ),
          },
      ];
      
      

  const getData = async() => {
  const response = await  imsAxios.get(`/book/getbookdata`)
    try{
      // setLoading("fetch");

      if(response.status === 200){
        setBookData(response.data.book)

      }
      else{
        toast.error('Some error occured while in fetching data!')
      }
    }catch(error){
      toast.error(error)
    }finally {
    // setLoading(false);
}

  }


  useEffect(() => {
    getData()
   
  },[]);
  const downloadtable = async() =>{
   downloadCSV(getbookdata,columns, 'BookData')
  }
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

  

  // console.log(getbookdata)
      
  return (
    <>

<Button style={{marginLeft:'2rem', marginTop:'0.5rem'}} onClick={showConfirm}>Validate Data</Button>
<Button  style={{marginLeft:'2rem'}} onClick={downloadtable}> Download</Button>
<Col style={{height:"75%", paddingLeft:'2rem', paddingRight:'2rem', marginTop:'1rem'}}> 
        <MyDataTable
        columns = {columns}
        data = {getbookdata}
        size = 'small'
      
        // sx={{
        //   "& .header-background": {
        //     backgroundColor: "#E6E6E6",
        //   },
        // }}
        
        />

        </Col>

        {isSidebarOpen && (
        <SideForm
          onClose={() => {
            setSidebarOpen(false);
            setSelectedRowData(null); 
          }}
          columns={columns}
          selectedRowData={selectedRowData}
          getbookdata={getbookdata}
        />
      )}
    </>
  )
}


export default ViewBookData