import { Card, Col, Drawer, Form, Input, Row } from "antd";
import ClientDetailsCard from "./ClientDetailsCard";
import BillingDetailsCard from "./BillingDetailsCard";
import DispatchAddress from "./DispatchDetailsCard";
import NavFooter from "../../../../Components/NavFooter";
import Loading from "../../../../Components/Loading";
import MySelect from "../../../../Components/MySelect";
import MyDataTable from "../../../../Components/MyDataTable";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import {
  defaultValues,
  gstTypeOptions,
  uploadTypeOptions,
} from "./createChallanModal/constants";
import { previewDataColms } from "./createChallanModal/columns/previewColumns";
import useCreateChallanModal from "./createChallanModal/useCreateChallanModal";
import ComponentSection from "./createChallanModal/sections/ComponentSection";
import ProductSection from "./createChallanModal/sections/ProductSection";

const CreateChallanModal = ({
  show,
  close,
  data,
  editShipment,
  rtnchallan,
  setRtnChallan,
}) => {
  const {
    challanForm,
    test,
    loading,
    closeDrawer,
    uplaodType,
    setUploadType,
    toggleInputType,
    stage,
    previewuploaData,
    previewData,
    gstType,
    setgstType,
    setaddid,
    setdaddid,
    addOptions,
    challantitle,
    locationlist,
    setlocationlist,
    getLocationList,
    calculation,
    getComponentOptions,
    asyncOptions,
    setAsyncOptions,
    inputHandler,
    minRows,
    removeRow,
    rows,
    componentsLoading,
    syncOutQty,
    getComponentDetails,
    updateDeliveryChallan,
    updateRmChallan,
    showSubmitConfirmationModal,
    showReturnSubmitConfirmationModal,
  } = useCreateChallanModal({
    show,
    close,
    data,
    editShipment,
    rtnchallan,
    setRtnChallan,
  });

  // Work area picks Product/Component from `test` once the challan title is
  // known, otherwise from the incoming `show.label`.
  const workAreaIsShipment =
    (challantitle
      ? test === "Create shipment"
      : show.label === "Create shipment") || editShipment === "Shipment";
  // The footer always keys off `test` in the original implementation.
  const footerIsShipment =
    test === "Create shipment" || editShipment === "Shipment";

  const workArea = workAreaIsShipment ? (
    <ProductSection
      form={challanForm}
      location={locationlist}
      calculation={calculation}
      gsttype={gstType}
      setlocationlist={setlocationlist}
      locationlist={locationlist}
      getLocationList={getLocationList}
      getComponentOptions={getComponentOptions}
      asyncOptions={asyncOptions}
      setAsyncOptions={setAsyncOptions}
      getComponentDetails={getComponentDetails}
      editShipment={editShipment}
      inputHandler={inputHandler}
      minRows={minRows}
      removeRow={removeRow}
      rows={rows}
    />
  ) : (
    <ComponentSection
      form={challanForm}
      location={locationlist}
      calculation={calculation}
      gsttype={gstType}
      setlocationlist={setlocationlist}
      getLocationList={getLocationList}
      locationlist={locationlist}
      inputHandler={inputHandler}
      minRows={minRows}
      removeRow={removeRow}
      editShipment={editShipment}
      componentsLoading={componentsLoading}
      syncOutQty={syncOutQty}
      rows={rows}
    />
  );

  return (
    <Drawer
      title={` ${test}`}
      placement="right"
      onClose={closeDrawer}
      bodyStyle={{ padding: 5 }}
      open={show}
      width="100%"
    >
      {(loading === "fetch" || loading === "fetch-wo-min") && <Loading />}
      <Form
        style={{ height: "100%" }}
        layout="vertical"
        form={challanForm}
        initialValues={defaultValues}
      >
        <Row
          gutter={8}
          style={{ height: "calc(100% - 30px)", overflow: "hidden" }}
        >
          <Col span={6} style={{ height: "100%", overflow: "hidden" }}>
            <Row
              gutter={[0, 6]}
              style={{ overflow: "auto", height: "calc(100% - 30px)" }}
            >
              <ClientDetailsCard
                form={challanForm}
                uploadTypeOptions={uploadTypeOptions}
                toggleInputType={toggleInputType}
                uplaodType={uplaodType}
                setUploadType={setUploadType}
                stage={stage}
                rtnchallan={rtnchallan}
                previewuploaData={previewuploaData}
              />
              {uplaodType === "table" && (
                <Col span={24}>
                  <Card size="small">
                    <Form.Item name="gstType" label="GST Type">
                      <MySelect
                        options={gstTypeOptions}
                        onChange={(e) => setgstType(e)}
                      />
                    </Form.Item>
                    {!editShipment && (
                      <Form.Item
                        label="Insert Date"
                        name="insertDate"
                        rules={[
                          { required: true, message: "Please Enter Insert Date" },
                        ]}
                      >
                        <SingleDatePicker
                          setDate={(value) =>
                            challanForm.setFieldValue("insertDate", value)
                          }
                        />
                      </Form.Item>
                    )}
                    {editShipment === "editReturn" && (
                      <Form.Item name="challanRemark" label="Challan Remark">
                        <Input />
                      </Form.Item>
                    )}
                  </Card>
                </Col>
              )}

              <BillingDetailsCard
                form={challanForm}
                code={data.clientCode}
                setaddid={setaddid}
                addoptions={addOptions}
              />
              <DispatchAddress
                form={challanForm}
                code={data.clientCode}
                setaddid={setdaddid}
                addoptions={addOptions}
                rtnchallan={rtnchallan}
              />
            </Row>
          </Col>
          {uplaodType === "table" && (
            <Col
              span={18}
              style={{ height: "calc(100% - 30px)", overflow: "auto" }}
            >
              {workArea}
            </Col>
          )}
          {uplaodType === "file" && (
            <MyDataTable
              columns={previewDataColms}
              data={previewData}
              loading={loading}
            />
          )}
        </Row>
      </Form>

      {challantitle ? (
        <NavFooter
          submitFunction={
            footerIsShipment ? updateDeliveryChallan : updateRmChallan
          }
          nextLabel={
            footerIsShipment ? "Update Delivery Challan" : "Update RM Challan"
          }
          loading={loading === "fetch"}
        />
      ) : (
        <NavFooter
          submitFunction={
            footerIsShipment
              ? showSubmitConfirmationModal
              : showReturnSubmitConfirmationModal
          }
          nextLabel={test}
          loading={loading === "create"}
        />
      )}
    </Drawer>
  );
};

export default CreateChallanModal;
