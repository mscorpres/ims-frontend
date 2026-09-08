import { Col, Form, Row } from "antd";
import NavFooter from "../../../../Components/NavFooter";
import { defaultValues } from "./scrapeChallan/constants";
import useScrapeChallan from "./scrapeChallan/useScrapeChallan";
import ClientDetailsSection from "./scrapeChallan/sections/ClientDetailsSection";
import BillingDetailsSection from "./scrapeChallan/sections/BillingDetailsSection";
import DispatchDetailsSection from "./scrapeChallan/sections/DispatchDetailsSection";
import ComponentsTableSection from "./scrapeChallan/sections/ComponentsTableSection";

const CreateScrapeChallan = () => {
  const {
    challanForm,
    uplaodType,
    editScrapeChallan,
    asyncOptions,
    setAsyncOptions,
    addOptions,
    ClientBranchOptions,
    getClientOptions,
    getclientDetials,
    getAddInfo,
    handlebilladress,
    handleaddress,
    handleFetchComponentOptions,
    handleFetchComponentDetails,
    calculation,
    validateHandler,
  } = useScrapeChallan();

  return (
    <>
      <Form
        style={{ height: "100%" }}
        layout="vertical"
        form={challanForm}
        initialValues={defaultValues}
      >
        <Row
          gutter={8}
          style={{ height: "calc(100% - 100px)", overflow: "auto" }}
        >
          <Col span={6} style={{ height: "90%", overflow: "hidden" }}>
            <Row gutter={[0, 6]} style={{ overflow: "auto", height: "100%" }}>
              <ClientDetailsSection
                challanForm={challanForm}
                asyncOptions={asyncOptions}
                setAsyncOptions={setAsyncOptions}
                getClientOptions={getClientOptions}
                getclientDetials={getclientDetials}
                ClientBranchOptions={ClientBranchOptions}
                getAddInfo={getAddInfo}
                uplaodType={uplaodType}
                editScrapeChallan={editScrapeChallan}
              />
              <BillingDetailsSection
                addOptions={addOptions}
                handlebilladress={handlebilladress}
              />
              <DispatchDetailsSection
                addOptions={addOptions}
                handleaddress={handleaddress}
              />
            </Row>
          </Col>

          <ComponentsTableSection
            challanForm={challanForm}
            calculation={calculation}
            asyncOptions={asyncOptions}
            setAsyncOptions={setAsyncOptions}
            handleFetchComponentOptions={handleFetchComponentOptions}
            handleFetchComponentDetails={handleFetchComponentDetails}
          />
        </Row>
      </Form>
      <NavFooter
        type="primary"
        resetFunction={() => challanForm.resetFields()}
        submitFunction={validateHandler}
        nextLabel="Submit"
      />
    </>
  );
};

export default CreateScrapeChallan;
