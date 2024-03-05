import { Button, Card, Col, Form, Input, Row } from "antd";
import React from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import { EditOutlined } from "@ant-design/icons";

function Addparty() {
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState('');
  const [partysearch,setpartysearch] = useState('')
  const [form] = Form.useForm();
  const addRows = async (values) => {
    console.log("values", values)
    const data = await imsAxios.post("/qaProcessmaster/insert_Process", values);

    console.log("row Data", data);
    if (data.status === "200" || data.status === 200) {
      // getRows();
    }
  };

const getpartydetails = async () =>{
  console.log(partysearch);
  setRows([]);
  const response = await imsAxios.post("/agreement/fetchparties", {
    searchTerm: partysearch,
  });
  console.log(response.data)
  if(response.status === 200){
    const newarr = response.data.parties.filter((row) => row.party_name === partysearch)
    console.log(newarr)
    const arr = newarr.map((row, index) => {
      return {
        key: index,
        id: index,
        party_name: row.party_name,
        party_type: row.party_type,
        mobile: row.party_mobile,
        cin:row.party_cin,
        pan:row.party_pan,
        address:row.party_address,
        state:row.state,
        pin: row.pincode
      };
    });
    setRows(arr);
  }
}

  const getRows = async () => {
    const response = await imsAxios.get("/qaProcessmaster/fetch_Process");
    // console.log("datadata", data.data);
    if (response.status === "200" || response.status === 200) {
      const { data } = response.data;
      console.log("datadata", data);
      const arr = data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    }
  };
  const submitForm = async () => {
    try {
      setLoading("select"/"fetch");
      const values = await form.validateFields();
      const state = values.state.replace(/\s*\([^)]*\)\s*/, '')
      const response = await imsAxios.post('/agreement/addparties',{
        "party_name" : values.partyName,
        "party_address" : values.partyAddress,
        "party_type" : values.partyType,
        "party_cin" : values.partyCin ,
        "party_pan" : values.Pan,
        "party_mobile" : values.mobile,
        "state": state,
        "pincode": values.pin
        })
      if(response.status === 200){
        form.resetFields()
        toast.success(response.data.msg)
      } 
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      headerName: "#",
      width: 50,
      field: "index",
    },
    {
      headerName: "Party Name",
      flex: 1,
      field: "party_name",
    },
    {
      headerName: "Party Type",
      flex: 1,
      field: "party_type",
    },
    {
      headerName: 'Mobile',
      flex: 1,
      field:'mobile'
    },
    {
      headerName: 'CIN',
      flex: 1,
      field:'cin'
    },
    {
      headerName: 'Action',
      width: 100,
      renderCell: ({ row }) => <EditOutlined onClick={() => editRow(row)} />
    }
  ];

const editRow = (row) =>{
  console.log(row)
}


  const getStateOptions = async (searchTerm) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/stateList", {
      search: searchTerm,
    });
    const { data } = response;
    if (data[0]) {
      let arr = data.map((row) => ({
        value: row.text,
        text: row.text,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
    setLoading(false);
  };
  const getpartyoptions = async (searchTerm) => {
    console.log(searchTerm.length)
    if(searchTerm.length > 2){
      setLoading("select");
      const response = await imsAxios.post("/agreement/fetchparties", {
        searchTerm: searchTerm,
      });
      const { data } = response;
      console.log(data.parties)
      if (response.status === 200) {
        let arr = data.parties.map((row) => ({
          value: row.party_name,
          text: row.party_name,
        }));
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
        toast.error(data.msg)
      }
      setLoading(false);
    }
    
  };

  return (
    <div>
      <Row gutter={10} span={24}>
        <Col span={8}>
          <Card>
            <Form form={form} layout="vertical">
              <Form.Item
                name="partyName"
                label="Party Name"
                rules={rules.partyName}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="partyAddress"
                label="Party Address"
                rules={rules.partyAddress}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="partyType"
                label="Party Type"
                rules={rules.partyType}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="partyCin"
                label="Party CIN"
                rules={rules.partyCin}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="partyPan"
                label="Party PAN"
                rules={rules.partyPan}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="mobile"
                label="Mobile"
                rules={rules.mobile}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="state"
                label="State"
                rules={rules.state}
              >
                <MyAsyncSelect
                selectLoading={loading === "select"}
                loadOptions={getStateOptions}
                optionsState={asyncOptions}
                onBlur={() => setAsyncOptions([])}
              />
              </Form.Item>
              <Form.Item
                name="pin"
                label="pin Code"
                rules={rules.pin}
              >
                <Input />
              </Form.Item>
            </Form>
            <Row justify="end">
              <Col span={4}>
                <Button>Reset</Button>
              </Col>
              <Col span={4}>
                <Button type="primary" onClick={submitForm}>
                  Submit
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col style={{ height: "100%" }} span={16}>

          <div style={{ height: "15rem", marginTop: "20px" }}>
            <Row >
              <Col span={8}>
                <MyAsyncSelect
                loading={loading === "select"}
                loadOptions={getpartyoptions}
                optionsState={asyncOptions}
                onChange= {(value)=>{setpartysearch(value)}}
                onBlur={() => setAsyncOptions([])}
                />
                
              </Col>
              <Col>
                <Button style={{ marginLeft: "10px" }} onClick={getpartydetails}>Fetch Details</Button>
              </Col>
            </Row>
            <Row>
              <div style={{height: "80vh",width: "99%", marginTop: "10px"}}>
              <MyDataTable
                columns={columns}
                data={rows} 
              />
              </div>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Addparty;

const rules = {
  partyName: [
    {
      required: true,
      message: "Party Name is required",
    },
  ],
  partyAddress: [
    {
      required: true,
      message: "Party Address is required",
    },
  ],
  partyType: [
    {
      required: true,
      message: "Party Type is required",
    },
  ],
  partyAddress: [
    {
      required: true,
      message: "Party Address is required",
    },
  ],
  partyCin: [
    {
      required: true,
      message: "Party CIN is required",
    },
  ],
  partyPan: [
    {
      required: true,
      message: "Party PAN is required",
    },
  ],
  mobile: [
    {
      required: true,
      message: "Mobile is required",
    },
  ],
  state: [
    {
      required: true,
      message: "State is required",
    },
  ],
  pin: [
    {
      required: true,
      message: "Pin Code is required",
    },
  ],
};
