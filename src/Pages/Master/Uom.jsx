import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Col, Input, Row, Space } from "antd";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import { imsAxios } from "../../axiosInterceptor";

const Uom = () => {
  const [uomData, setUomData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUom, setNewUom] = useState({
    uom: "",
    description: "",
  });

  //   fetch uom
  const fetchUOm = async () => {
    setLoading(true);
    const { data } = await imsAxios.get("/uom");
    let arr = data.data.map((row, index) => {
      return {
        ...row,
        index: index + 1,
        id: v4(),
      };
    });
    setUomData(arr);
    setLoading(false);
  };

  //   add UOM
  const addUom = async (e) => {
    e.preventDefault();

    if (!newUom.uom) {
      toast.error("Please Add UoM");
    } else if (!newUom.description) {
      toast.error("Please Add Description");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/uom/insert", {
        uom: newUom.uom,
        description: newUom.description,
      });
      if (data.code === 200) {
        setNewUom({
          uom: "",
          description: "",
        });
        fetchUOm();
        setLoading(false);
      } else {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  const reset = () => {
    setNewUom({
      uom: "",
      description: "",
    });
  };

  const columns = [
    { field: "index", headerName: "S.No", width: 170 },
    { field: "units_name", headerName: "Unit", width: 170 },
    { field: "units_details", headerName: "Specification", width: 170 },
  ];

  useEffect(() => {
    fetchUOm();
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <Row gutter={16} style={{ margin: "10px" }}>
        <Col span={8}>
          <Row>
            <Col span={24} className="gutter-row">
              <div>
                <Input
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Unit(UOM)"
                  value={newUom.uom}
                  onChange={(e) =>
                    setNewUom((newUom) => {
                      return { ...newUom, uom: e.target.value };
                    })
                  }
                />
              </div>
            </Col>
            <Col span={24} className="gutter-row">
              <div style={{ margin: "5px 0px" }}>
                <Input
                  size="large"
                  placeholder="Unit(Description)"
                  style={{ width: "100%" }}
                  value={newUom.description}
                  onChange={(e) =>
                    setNewUom((newUom) => {
                      return { ...newUom, description: e.target.value };
                    })
                  }
                />
              </div>
            </Col>
            <Row justify="end" style={{ width: "100%", margin: "10px 0" }}>
              <Col className="gutter-row">
                <Space style={{ textAlign: "end" }}>
                  <Button
                    onClick={reset}
                    // block
                    style={{
                      backgroundColor: "#3A4B53",
                      color: "white",
                      // marginTop: "6px",
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    // block
                    onClick={addUom}
                    style={{
                      // backgroundColor: "green",
                      color: "white",
                      // marginTop: "6px",
                    }}
                  >
                    Save
                  </Button>
                </Space>
              </Col>
            </Row>
          </Row>
        </Col>
        <Col span={16}>
          <div className="m-2" style={{ height: "100%" }}>
            <div style={{ height: "80vh" }}>
              <MyDataTable loading={loading} data={uomData} columns={columns} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Uom;
