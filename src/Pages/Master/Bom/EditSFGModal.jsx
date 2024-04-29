import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Alter from "./Alter";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Input,
  Row,
  Skeleton,
  Space,
} from "antd";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyDataTable from "../../../Components/MyDataTable";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import errorToast from "../../../Components/errorToast";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";
import ViewEmergingComponent from "./ViewEmergingComponent";
import AddEmergingComponent from "./AddEmergingComponent";
import FormTable from "../../../Components/FormTable";
import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions } from "../../../api/general";

const EditSFGModal = ({ sfgEditModal, setSfgEditModal }) => {
  const [fetchData, setFetchData] = useState([]);
  const [secondData, setSecondData] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(null);
  const [altModal, setAltModal] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [addUpdateLoading, setAddUpdateLoading] = useState(false);
  const [updateRowLoading, setUpdateRowLoading] = useState(false);
  const [addingEmergingPart, setAddingEmergingPart] = useState(false);
  const [viewEmergingPart, setViewEmergingPart] = useState(false);

  const { executeFun, loading: loading1 } = useApi();
  const reset = () => {
    setSecondData([]);
  };

  const opt = [
    { text: "Part", value: "P" },
    { text: "Packing", value: "PCK" },
    { text: "Other", value: "O" },
  ];
  const opt1 = [
    { text: "ACTIVE", value: "A" },
    { text: "ALTERNATE", value: "ALT" },
    { text: "INACTIVE", value: "I" },
  ];

  const editPerticularId = async () => {
    const { data } = await imsAxios.post("/bom/fetchProductInBom", {
      subject_id: sfgEditModal?.subject_id,
    });
    setFetchData(data.data);
  };
  const selectInputHandler = (name, id, value) => {
    setSecondData((rows) =>
      rows.map((row) => {
        if (row.id == id) {
          return { ...row, [name]: value };
        } else {
          return row;
        }
      })
    );
  };

  const next = async () => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/bom/fetchComponentsInBomForUpdate", {
      subject_id: sfgEditModal?.subject_id,
    });
    setPageLoading(false);
    const arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
      };
    });
    setSecondData(arr);
  };

  const addRow = () => {
    let newARow = {
      id: v4(),
      component: "",
      category: "P",
      requiredQty: "",
      bomstatus: "A",
      type: "new",
      minusSign: true,
    };
    setSecondData((dataRow) => [newARow, ...dataRow]);
    // toast.success("Row Has Been Added Successfully");
    //  setSecondData
  };

  const loadData = async (e) => {
    if (e.length > 2) {
      setSelectLoading(true);
      // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: e,
      // });
      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      setSelectLoading(false);
      let arr = [];
      arr = data.map((vList) => {
        return { text: vList.text, value: vList.id };
      });
      // console.log("Array Vendor=>", arr);
      setAsyncOptions(arr);
    }
  };

  const deleteRow = (id) => {
    // console.log(id)
    setSecondData((secondData) => {
      return secondData.filter((row) => row.id != id);
    });
    // toast.info("Row Has Been Delete Successfully");
  };

  const clas = (a) => {
    // console.log("Line no 99 ->>>>>>>>>", a);
    setAltModal(a);
  };

  const addDataRow = async (id) => {
    let b = secondData.filter((a) => a.id == id)[0];
    // console.log("bbbbbbb", b);

    if (b.component == "") {
      return toast.error("Please select a component");
    } else if (b.requiredQty == 0 || b.requiredQty == "" || b.requiredQty < 0) {
      return toast.error(
        "Required Quanity can not be blank and should be more than 0"
      );
    }
    setAddUpdateLoading(id);
    const { data } = await imsAxios.post("/bom/updateBomComponent", {
      component_id: b.component.value,
      qty: b.requiredQty,
      category: b.category,
      status: b.bomstatus,
      subject_id: fetchData?.subjectid,
      sku: fetchData?.sku,
    });
    setAddUpdateLoading(false);

    if (data.code == 200) {
      let arr = secondData;
      arr = arr.map((row) => {
        if (row.id === id) {
          console.log(row);
          return {
            ...row,
            component: row.component.label,
            type: false,
          };
        } else {
          return row;
        }
      });
      setSecondData(arr);
      toast.success(data.message);
    } else {
      toast.error(errorToast(data.message));
    }
    // console.log(data);
    // console.log("first")
  };

  const clickOnUpdata = async (a) => {
    // console.log(a);
    if (a.component == "") {
      return toast.error("Please select a component");
    } else if (a.requiredQty == 0 || a.requiredQty == "" || a.requiredQty < 0) {
      return toast.error(
        "Required Quanity can not be blank and should be more than 0"
      );
    }
    setUpdateRowLoading(a.id);
    const { data } = await imsAxios.post("/bom/updateBomComponent", {
      component_id: a.compKey,
      qty: a.requiredQty,
      category: a.category,
      status: a.bomstatus,
      subject_id: sfgEditModal.subject_id,
      sku: sfgEditModal.bom_product_sku,
      priority: a.priority ?? 1,
    });
    setUpdateRowLoading(false);
    if (data.code == 200) {
      // next();
      toast.success(data.message);
    } else {
      toast.error(errorToast(data.message));
    }
    // // console.log(data);
  };
  const handlerEmergingMogal = (row) => {
    let obj = {
      subject: sfgEditModal.subject_id,
      parent_part: row.compKey,
      componentName: row.component + " / " + row.partcode,
      bom: fetchData?.subject,
    };
    setAddingEmergingPart(obj);
  };
  const handleViewEmerging = async (row) => {
    let obj = {
      subject: sfgEditModal.subject_id,
      parent_part: row.compKey,
      componentName: row.component + " / " + row.partcode,
      bom: fetchData?.subject,
    };
    setViewEmergingPart(obj);
  };
  const columns = [
    {
      headerName: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <CommonIcons action="addRow" onClick={addRow} />
        </div>
      ),
      width: 50,
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        row.type == "new" && (
          <CommonIcons action="removeRow" onClick={() => deleteRow(row?.id)} />
        ),
      // sortable: false,
    },
    {
      headerName: "Component",
      field: "component",
      sortable: false,
      width: 500,
      renderCell: ({ row }) =>
        row.type == "new" ? (
          <MyAsyncSelect
            labelInValue
            selectLoading={loading1("select")}
            optionsState={asyncOptions}
            loadOptions={loadData}
            onInputChange={(e) => setSearchInput(e)}
            onChange={(value) => selectInputHandler("component", row.id, value)}
          />
        ) : (
          `${row.component}`
        ),
    },
    // {
    //   headerName: "Emerging Component",
    //   field: "emerged_partcode",
    //   sortable: false,
    //   width: 500,
    //   renderCell: ({ row }) =>
    //     row.emerged_partcode == "--" ? (
    //       <Button
    //         type="text"
    //         onClick={() => handlerEmergingMogal(row)}
    //         style={{ color: "#1890ff", fontSize: 12 }}
    //       >
    //         + Add Emerging Part Code
    //       </Button>
    //     ) : (
    //       <Button
    //         type="text"
    //         onClick={() => handleViewEmerging(row)}
    //         style={{ color: "#1890ff", fontSize: 14 }}
    //       >
    //         {row.emerged_component_name}{" "}
    //         {row.emerged_partcode === "undefined" ? "" : "/"}
    //         {row.emerged_partcode === "undefined" ? "" : row.emerged_partcode}
    //       </Button>
    //     ),
    // },
    {
      headerName: "Part Code",
      width: 100,
      field: "partcode",
      sortable: false,
      renderCell: ({ row }) => <span>{row.partcode}</span>,
    },
    {
      headerName: "Prority",
      width: 100,
      field: "priority",
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          size="default"
          onChange={(e) =>
            selectInputHandler("priority", row.id, e.target.value)
          }
          value={row.priority}
        />
      ),
    },
    {
      headerName: "Qty",
      width: 100,
      field: "requiredQty",
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          size="default"
          onChange={(e) =>
            selectInputHandler("requiredQty", row.id, e.target.value)
          }
          value={row.requiredQty}
        />
      ),
    },
    {
      headerName: "Category",
      field: "category",
      sortable: false,
      flex: 1,
      renderCell: ({ row }) => (
        <MySelect
          disabled={row.component == ""}
          options={opt}
          onChange={(e) => selectInputHandler("category", row.id, e)}
          value={row.category}
        />
      ),
    },
    {
      headerName: "Status",
      field: "bomstatus",
      sortable: false,
      flex: 1,
      renderCell: ({ row }) => (
        <MySelect
          options={opt1}
          disabled={row.component == ""}
          onChange={(e) => {
            if (e == "ALT") {
              clas(row, fetchData);
            }
            selectInputHandler("bomstatus", row.id, e);
          }}
          value={row.bomstatus}
        />
      ),
    },
    {
      headerName: "Actions",
      width: 80,
      field: "actions",
      sortable: false,
      renderCell: ({ row }) =>
        row.type == "new" ? (
          <CommonIcons
            onClick={() => addDataRow(row?.id)}
            size="small"
            action="checkButton"
            loading={addUpdateLoading === row.id}
          />
        ) : (
          <CommonIcons
            onClick={() => clickOnUpdata(row)}
            size="small"
            loading={updateRowLoading === row.id}
            action="checkButton"
          />
        ),
      // sortable: false,
    },
  ];

  useEffect(() => {
    if (sfgEditModal == null) {
      reset();
    } else if (sfgEditModal?.subject_id) {
      // console.log(sfgEditModal);
      editPerticularId();
      next();
    }
  }, [sfgEditModal]);
  useEffect(() => {
    if (sfgEditModal == null) {
      reset();
    } else if (sfgEditModal?.subject_id) {
      editPerticularId();
      next();
    }
  }, [sfgEditModal]);
  return (
    <Drawer
      width="100vw"
      // title={fetchData?.subject}
      title={`${fetchData?.subject} / ${secondData?.length} item${
        secondData?.length == 1 ? "" : "s"
      }`}
      placement="right"
      onClose={() => setSfgEditModal(null)}
      open={sfgEditModal}
      getContainer={false}
      extra={
        <Space>
          <CommonIcons action="refreshButton" onClick={next} />
        </Space>
      }
    >
      <ViewEmergingComponent
        viewEmergingPart={viewEmergingPart}
        setViewEmergingPart={setViewEmergingPart}
        next={next}
      />
      <AddEmergingComponent
        addingEmergingPart={addingEmergingPart}
        setAddingEmergingPart={setAddingEmergingPart}
        next={next}
      />
      <Skeleton active loading={pageLoading} />
      {pageLoading && <Divider />}
      <Skeleton active loading={pageLoading} />
      <Skeleton active loading={pageLoading} />
      {!pageLoading && (
        <>
          <Row style={{ marginTop: -13 }} gutter={8}>
            <Col span={5}>
              <Input value={fetchData?.product} disabled />
            </Col>
            <Col span={4}>
              <Input value={fetchData?.sku} disabled />
            </Col>
          </Row>

          <Divider style={{ margin: "13px 0" }} />
          <Row gutter={24} style={{ height: "75vh" }}>
            {secondData?.length && (
              <FormTable hideHeaderMenu columns={columns} data={secondData} />
            )}
          </Row>
        </>
      )}
      <Alter
        altModal={altModal}
        setAltModal={setAltModal}
        secondData={secondData}
        fetchData={fetchData}
        // sfgEditModal={sfgEditModal}
      />
    </Drawer>
  );
};

export default EditSFGModal;
