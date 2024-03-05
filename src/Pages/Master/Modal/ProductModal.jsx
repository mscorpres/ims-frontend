import React, { useState, useEffect } from "react";
import {
  Button,
  Col,
  Drawer,
  Row,
  Space,
  Input,
  Select,
  Divider,
  Upload,
} from "antd";
import { imsAxios } from "../../../axiosInterceptor";

const { TextArea } = Input;
function ProductModal({ productModal, setProductModal, fetchProductData }) {
  const [product, setProduct] = useState([]);
  const [productAllData, setProductAllData] = useState({
    uom: {},
    productcategory: "",
    producttype_name: "",
    enablestatus_name: {},

    tax_type_name: {},
    gstrate_name: {},
    hsncode: "",

    brand: "",
    ean: "",
    weight: "",
    vweight: "",
    height: "",
    width: "",

    minstock: "",
    minrmstock: "",
    batchstock: "",
    loc: "",
    laboutcost: "",
    packingcost: "",
    jobworkcost: "",
    othercost: "",
  });
  const [uom, setUom] = useState([]);
  console.log(product);

  const getUOM = async () => {
    const { data } = await imsAxios.get("/uom");
    //  console.log(data.data);
    let arr = [];
    arr = data.data.map((d) => {
      return { label: d.units_name, value: d.units_id };
    });
    // console.log(arr);
    setUom(arr);
  };

  const productType = [
    { label: "FG", value: "default" },
    { label: "SEMI FG", value: "semi" },
  ];
  const enableStatus = [
    { label: "Yes", value: "Y" },
    { label: "No", value: "N" },
  ];
  const taxType = [
    { label: "------", value: "0" },
    { label: "Exempted", value: "EXE" },
    { label: "Regular", value: "REG" },
  ];
  const gstType = [
    { label: "----", value: "0" },
    { label: "05", value: "05" },
    { label: "12", value: "12" },
    { label: "18", value: "18" },
    { label: "28", value: "28" },
  ];

  const getFetchExistingProduct = async () => {
    const { data } = await imsAxios.post("/products/getProductForUpdate", {
      product_key: productModal?.product_key,
    });
    data.data.map((a) => setProduct(a));
  };

  const inputHandler = (name, value) => {
    console.log(name, value);
    setProduct((detail) => {
      return {
        ...detail,
        [name]: value,
      };
    });
  };

  const updateProduct = async () => {
    const { data } = await imsAxios.post("/products/updateProduct", {
      producttKey: productModal.product_key,
      category: product.productcategory,
      mrp: product?.mrp,
      producttype: product?.producttype_name,
      isenabled: product?.enablestatus_name,
      gsttype: product?.tax_type_name,
      gstrate: product?.gstrate_name,
      uom: product?.uomid,
      location: "--",
      hsn: product?.hsncode,
      brand: product?.brand,
      ean: product?.ean,
      weight: product?.weight,
      vweight: product?.vweight,
      height: product?.height,
      width: product?.width,
      minstock: product?.minstock,
      minstockrm: product?.minrmstock,
      batchstock: product?.batchstock,
      labourcost: product?.laboutcost,
      packingcost: product?.packingcost,
      othercost: product?.othercost,
      jobworkcost: product?.jobworkcost,
      description: product?.description,
    });
    console.log(data);
    if (data.code == 200) {
      setProductModal(false);
      fetchProductData();
    }
  };

  useEffect(() => {
    if (productModal?.product_key) {
      getFetchExistingProduct();
      getUOM();
    }
  }, [productModal?.product_key]);

  useEffect(() => {
    if (productModal?.product_key) {
      console.log(product);
    }
  }, [productModal?.product_key]);
  return (
    <Space>
      <Drawer
        //   bodyStyle={{ backgroundColor: "#FDFCFC" }}
        width="100vw"
        title="Update Product"
        placement="right"
        closable={false}
        onClose={() => setProductModal(false)}
        open={productModal}
        getContainer={false}
        style={{
          position: "absolute",
        }}
        extra={
          <Space>
            <Button value="small" type="primary" onClick={updateProduct}>
              Update
            </Button>
            <Button
              style={{ background: "red", color: "white" }}
              onClick={() => setProductModal(false)}
            >
              Cancel
            </Button>
          </Space>
        }
      >
        <Row gutter={16}>
          <>
            <Col span={24}>
              <div>
                <span>Basic Details:</span>
              </div>
            </Col>
            <Col span={6}>
              <div>Sku</div>
              <Input value={product?.sku} style={{ width: "100%" }} disabled />
            </Col>
            <Col span={6}>
              <div>Product Name</div>
              <Input
                value={product?.productname}
                style={{ width: "100%" }}
                disabled
              />
            </Col>
            <Col span={6}>
              <div>Uom</div>
              <Select
                options={uom}
                value={product?.uomid}
                style={{ width: "100%" }}
                onChange={(e) => inputHandler("uomid", e)}
              />
            </Col>
            <Col span={6}>
              <div>Product Category</div>
              <Input
                value={product?.productcategory}
                onChange={(e) =>
                  inputHandler("productcategory", e.target.value)
                }
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6}>
              <div>MRP</div>
              <Input value={product?.mrp} style={{ width: "100%" }} disabled />
            </Col>
            <Col span={6}>
              <div>Product Type</div>
              <Select
                style={{ width: "100%" }}
                options={productType}
                value={product?.producttype_name}
                onChange={(e) => inputHandler("producttype_name", e)}
              />
            </Col>
            <Col span={6}>
              <div>Cost Price ( auto calc from Bom)</div>
              <Input
                value={product?.costprice}
                style={{ width: "100%" }}
                disabled
              />
            </Col>
            <Col span={6}>
              <div>Enabled</div>
              <Select
                style={{ width: "100%" }}
                options={enableStatus}
                value={product?.enablestatus_name}
                onChange={(e) => inputHandler("enablestatus_name", e)}
              />
            </Col>
            <Col span={6}>
              <div>Product Description</div>
              <TextArea
                style={{ width: "100%" }}
                value={product?.description}
                onChange={(e) => inputHandler("description", e.target.value)}
              />
            </Col>
          </>
          <Divider></Divider>
          <>
            <Col span={24}>
              <div>
                <span>Tax Details :</span>
              </div>
            </Col>
            <Col span={6}>
              <div>Tax Type</div>
              <Select
                style={{ width: "100%" }}
                options={taxType}
                value={product?.tax_type_name}
                onChange={(e) => inputHandler("tax_type_name", e)}
              />
            </Col>
            <Col span={6}>
              <div>GST Tax Rate</div>
              <Select
                style={{ width: "100%" }}
                options={gstType}
                value={product?.gstrate_name}
                onChange={(e) => inputHandler("gstrate_name", e)}
              />
            </Col>
            <Col span={6}>
              <div>HSN</div>
              <Input
                style={{ width: "100%" }}
                value={product?.hsncode}
                onChange={(e) => inputHandler("hsncode", e.target.value)}
              />
            </Col>
          </>
          <Divider></Divider>
          <>
            <Col span={24}>
              <div>
                <span>Advance Details:</span>
              </div>
            </Col>
            <Col span={6}>
              <div>Brand</div>
              <Input
                style={{ width: "100%" }}
                value={product?.brand}
                onChange={(e) => inputHandler("brand", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>EAN</div>
              <Input
                style={{ width: "100%" }}
                value={product?.ean}
                onChange={(e) => inputHandler("ean", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>Weight (gms)</div>
              <Input
                style={{ width: "100%" }}
                value={product?.weight}
                onChange={(e) => inputHandler("weight", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>Volumetric Weight (gms)</div>
              <Input
                style={{ width: "100%" }}
                value={product?.vweight}
                onChange={(e) => inputHandler("vweight", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>Height (mm)</div>
              <Input
                style={{ width: "100%" }}
                value={product?.height}
                onChange={(e) => inputHandler("height", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>Width (mm)</div>
              <Input
                style={{ width: "100%" }}
                value={product?.width}
                onChange={(e) => inputHandler("width", e.target.value)}
              />
            </Col>
            {/* <Col span={6}>
              <Upload>
                <Button
                  disabled
                  type="primary"
                  icon={<UploadOutlined />}
                  style={{ marginTop: "25px" }}
                >
                  Select File
                </Button>
              </Upload>
            </Col> */}
          </>
          <Divider></Divider>
          <>
            <Col span={24}>
              <div>
                <span>Prduction Plan and Costing:</span>
              </div>
            </Col>
            <Col span={6}>
              <div>Min Stock (FG)</div>
              <Input
                style={{ width: "100%" }}
                value={product?.minstock}
                onChange={(e) => inputHandler("minstock", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>Min Stock (RM)</div>
              <Input
                style={{ width: "100%" }}
                value={product?.minrmstock}
                onChange={(e) => inputHandler("minrmstock", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>Mfg Batch Size</div>
              <Input
                style={{ width: "100%" }}
                value={product?.batchstock}
                onChange={(e) => inputHandler("batchstock", e.target.value)}
              />
            </Col>
            {/* <Col span={6}>
              <div>Default Stock Location</div>
              <Select
                style={{ width: "100%" }}
                disabled
                onChange={(e) => inputHandler("othercost", e.target.value)}
              />
            </Col> */}
            <Col span={6}>
              <div>Labour Cost</div>
              <Input
                style={{ width: "100%" }}
                value={product?.laboutcost}
                onChange={(e) => inputHandler("laboutcost", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>Sec Packing Cost</div>
              <Input
                style={{ width: "100%" }}
                value={product?.packingcost}
                onChange={(e) => inputHandler("packingcost", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>JW Cost</div>
              <Input
                style={{ width: "100%" }}
                value={product?.jobworkcost}
                onChange={(e) => inputHandler("jobworkcost", e.target.value)}
              />
            </Col>
            <Col span={6}>
              <div>Other Cost</div>
              <Input
                style={{ width: "100%" }}
                value={product?.othercost}
                onChange={(e) => inputHandler("othercost", e.target.value)}
              />
            </Col>
          </>
          <Divider></Divider>
        </Row>
      </Drawer>
    </Space>
  );
}

export default ProductModal;

{
  /* <>
<Col span={24}>
            <div>
              <span>Tax Details :</span>
            </div>
          </Col>
          <Col span={6}>
            <div>Tax Type</div>
            <Select style={{ width: "100%" }} options={taxType} />
          </Col>
          <Col span={6}>
            <div>GST Tax Rate</div>
            <Select style={{ width: "100%" }} options={gstType} />
          </Col>
          <Col span={6}>
            <div>HSN</div>
            <Input style={{ width: "100%" }} value={product?.hsncode} />
          </Col>
          <Divider></Divider>

          <Col span={24}>
            <div>
              <span>Advance Details:</span>
            </div>
          </Col>
          <Col span={6}>
            <div>Brand</div>
            <Input style={{ width: "100%" }} value={product?.brand} />
          </Col>
          <Col span={6}>
            <div>EAN</div>
            <Input style={{ width: "100%" }} value={product?.ean} />
          </Col>
          <Col span={6}>
            <div>Weight (gms)</div>
            <Input style={{ width: "100%" }} value={product?.weight} />
          </Col>
          <Col span={6}>
            <div>Volumetric Weight (gms)</div>
            <Input style={{ width: "100%" }} value={product?.vweight} />
          </Col>
          <Col span={6}>
            <div>Height (mm)</div>
            <Input style={{ width: "100%" }} value={product?.height} />
          </Col>
          <Col span={6}>
            <div>Width (mm)</div>
            <Input style={{ width: "100%" }} value={product?.width} />
          </Col>
          <Col span={6}>
            <Upload>
              <Button
                disabled
                type="primary"
                icon={<UploadOutlined />}
                style={{ marginTop: "25px" }}
              >
                Select File
              </Button>
            </Upload>
          </Col>

          <Divider></Divider>
          <Col span={24}>
            <div>
              <span>Prduction Plan and Costing:</span>
            </div>
          </Col>
          <Col span={6}>
            <div>Min Stock (FG)</div>
            <Input style={{ width: "100%" }} value={product?.minstock} />
          </Col>
          <Col span={6}>
            <div>Min Stock (RM)</div>
            <Input style={{ width: "100%" }} value={product?.minrmstock} />
          </Col>
          <Col span={6}>
            <div>Mfg Batch Size</div>
            <Input style={{ width: "100%" }} value={product?.batchstock} />
          </Col>
          <Col span={6}>
            <div>Default Stock Location</div>
            <Select style={{ width: "100%" }} disabled />
          </Col>
          <Col span={6}>
            <div>Labour Cost</div>
            <Input style={{ width: "100%" }} value={product?.laboutcost} />
          </Col>
          <Col span={6}>
            <div>Sec Packing Cost</div>
            <Input style={{ width: "100%" }} value={product?.packingcost} />
          </Col>
          <Col span={6}>
            <div>JW Cost</div>
            <Input style={{ width: "100%" }} value={product?.jobworkcost} />
          </Col>
          <Col span={6}>
            <div>Other Cost</div>
            <Input style={{ width: "100%" }} value={product?.othercost} />
          </Col>
          </> */
}
