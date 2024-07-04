import React, { useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { SelectOptionType } from "@/types/general";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Typography,
  Upload,
} from "antd";
import MySelect from "@/Components/MySelect.jsx";
import { getCategoryFields, getCategoryOptions } from "@/api/master/component";
import { UploadOutlined } from "@ant-design/icons";
import { imsAxios } from "@/axiosInterceptor";
import { downloadCSV } from "@/Components/exportToCSV";

interface PropTypes {
  uniqueCode: string;
  setUniqueCode: React.Dispatch<React.SetStateAction<string>>;
  category: SelectOptionType;
  componentName: string;
  updateNameAndCode: (code: string, name: string) => void;
  form: any;
  setAttributes: (values: any) => void;
  setAllAttributeOptions: React.Dispatch<React.SetStateAction<never[]>>;
  hideExtra?: boolean;
  valuesNotRequired?: boolean;
}
const CategoryForm = (props: PropTypes) => {
  const [stage, setStage] = useState(1);
  const [fields, setFields] = useState<FieldType[]>([]);
  const [selectOptions, setSelectOptions] = useState<OptionType[]>([]);
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [codeRows, setCodeRows] = useState([]);

  const values = Form.useWatch([], props.form);
  const mfgCode = Form.useWatch("mfgCode", props.form);
  const { executeFun, loading } = useApi();

  const handleFetchCategoryFields = async (categoryKey: string) => {
    setFields([]);
    setSelectOptions([]);
    let promises: Promise<any>[] = [];
    const response = await executeFun(
      () => getCategoryFields(categoryKey),
      "fetch"
    );
    for (let i = 0; i < response.data.length; i++) {
      const current = response.data[i];
      if (current.type === "select") {
        const optionsResponse = executeFun(
          () => getCategoryOptions(current.name),
          "fetch"
        );
        promises = [...promises, optionsResponse];
      }
    }
    let allOptions = [];
    let allResponse = await Promise.all(promises);
    allResponse = allResponse.map((row) => {
      allOptions = [...allOptions, ...row.data];
    });

    setSelectOptions(allOptions);
    if (props.setAllAttributeOptions) {
      props.setAllAttributeOptions(allOptions);
    }

    setFields(response.data);
  };

  const uploadProps = {
    maxCount: 1,
    fileList: demoFile ? [demoFile] : [],
    beforeUpload: () => false,
    onChange: (info) =>
      info.file ? setDemoFile(info.file) : setDemoFile(null),
  };

  const handleFetchJSON = async () => {
    if (demoFile) {
      const formData = new FormData();
      formData.append("file", demoFile);
      let arr = [];
      const response = await imsAxios.post("/component/readData", formData);
      // return;
      if (response.success) {
        response.data.map((row) => {
          let updatedValues = {};
          for (let key in row.values) {
            const newObj = {
              label: row.values[key].attr_value,
              text: row.values[key].attr_value,
              value: row.values[key].code ?? row.values[key].selectedvalues,
            };

            updatedValues[key] = newObj;
            // updatedValues["label"] = row.values[key].attr_value;
            // updatedValues["text"] = row.values[key].attr_value;
            // updatedValues["value"] = row.values[key].code;
          }
          const code = generateCode(updatedValues);
          console.log("generate", code);
          arr = [
            ...arr,
            {
              partCode: row.partCode,
              code,
            },
          ];
        });
      }
      console.log("code arr", arr);
      const columns = [
        {
          headerName: "Part Code",
          field: "partCode",
        },
        {
          headerName: "Code",
          field: "code",
        },
      ];

      downloadCSV(arr, columns, "Updated Code");
    }
  };
  useEffect(() => {
    if (props.category) {
      handleFetchCategoryFields(props.category.value);
    }
  }, [props.category]);

  useEffect(() => {
    let generatedCode = "";
    let generatedName = "";

    console.log("values ", values);

    if (values) {
      if (props.setAttributes) {
        let udpatedFields = {};
        for (let key in values) {
          const current = values[key];
          const found = fields.find((field) => field.name === key);
          console.log("field name", values);
          if (found) {
            udpatedFields[found?.name] = current?.value ?? current;
          } else {
            udpatedFields[key] = current;
          }
        }
        console.log("updateFields", udpatedFields);
        props.setAttributes(udpatedFields);
      }

      const mounting = values["12312"];
      const packageSize = values["434092"];
      const value =
        props.category?.value === "20231025864820945"
          ? values["353453454"]
          : props.category?.value === "20231028142920945"
          ? values["574954523value"]
          : values["574954524value"];
      const multiplier = values["65490895"];
      const tolerance = values["89768575"];
      const powerRating = values["7876567"];
      const frequency = values["5749534324"];
      const freequencyValue = values["5749534324value"];
      const capacitorType = values["49431234739"];
      const voltage = values["453940492"];

      const siUnit = values["574954523"];
      const currentSiUnitInd = values["5749532987"];
      const currentSiUnitIndValue = values["5749532987value"]; //this one
      const dcResistance = values["98789537458"];
      const dcResistanceValue = values["98789537458value"];
      const siUnitInd = values["574954524"];
      const siUnitIndValue = values["574954524value"]; //this one
      const siUnitCap = values["574954523"];
      const siUnitCapValue = values["574954523value"];
      let zeroes = [1];
      const valueArr = value
        ?.toString()
        .replaceAll(".", "")
        .split(".")[0]
        .split("");
      for (let i = valueArr?.length - 1; i >= 0; i--) {
        const current = valueArr[i];

        if (current === "0") {
          zeroes.push(0);
          valueArr.pop();
        } else {
          break;
        }
      }
      const broken = convertValue(value?.toString());
      let valueLetter = "";
      if (broken.length > 0) {
        if (!value?.toString().includes(".")) {
          valueLetter = getLetterFromNumber(zeroes?.join(""));
        } else {
          valueLetter = getLetterFromNumber(convertValue(value?.toString()));
        }
      }

      if (props.category?.value === "20231025864820945") {
        //resistor
        generatedCode = `RES${getValue(mounting)}(${getValue(
          packageSize
        )})${getValue(tolerance)}${getValue(powerRating)}${
          valueArr?.join("")?.length > 4
            ? "Invalid Value"
            : valueArr?.join("")?.padStart(4, "0") ?? "__"
        }${valueLetter}`;

        generatedName = `${getValue(packageSize)}-${
          getComponentValueForName(+value, props.category.label) ?? "__"
        }-${getLabel(tolerance)}-${getLabel(powerRating)}W-${
          getLabel(mounting) === "Thru Hole" ? "MI" : getLabel(mounting)
        }-Resistor`;
      } else if (props.category?.value === "20231028142920945") {
        //capacitor
        generatedCode = `CAP${getValue(mounting)}${getValue(
          capacitorType
        )}(${getValue(packageSize)})${getValue(tolerance)}${getValue(voltage)}${
          valueArr?.join("")?.length > 4
            ? "Invalid Value"
            : valueArr?.join("")?.padStart(4, "0") ?? "__"
        }${valueLetter}${getValue(siUnit)}`;

        generatedName = `${getValue(packageSize)}-${getLabel(
          siUnitCapValue
        )}${getLabel(siUnitCap)}-${getLabel(tolerance)}-${getLabel(voltage)}V-${
          getLabel(mounting) === "Thru Hole" ? "MI" : getLabel(mounting)
        }-${getLabel(capacitorType)}`;
      } else if (props.category?.value === "348423983543") {
        //inductor
        generatedCode = `(${getValue(packageSize)})-${getValue(
          siUnitIndValue
        )}${getLabel(siUnitInd)}-${getValue(freequencyValue)}${getLabel(
          frequency
        )}-${getValue(currentSiUnitIndValue)}${getLabel(
          currentSiUnitInd
        )}-${getValue(dcResistanceValue)}${getLabel(dcResistance)}-${getLabel(
          tolerance
        )}-${
          getLabel(mounting) === "Thru Hole" ? "MI" : getLabel(mounting)
        }-Inductor`;
        generatedName = generatedCode;
      }
      if (!props.hideExtra) {
        props.updateNameAndCode(generatedCode, generatedName);
      }
    }
  }, [values, props.category]);

  console.log("updaging mfgcode", mfgCode);
  return (
    <Form form={props.form} layout="vertical">
      <Row gutter={6}>
        {!props.hideExtra && (
          <Col span={12}>
            <Card
              size="small"
              style={{ height: "100%" }}
              bodyStyle={{ height: "98%" }}
            >
              <Flex vertical gap={20}>
                <div>
                  <Typography.Text strong>
                    Selected Category: {props.category?.text}
                  </Typography.Text>
                </div>
                <Divider style={{ margin: "-5px 0px" }} />
                <div>
                  <Typography.Text strong>
                    Unique Id: <br />
                    <span style={{ color: "#04b0a8" }}>{props.uniqueCode}</span>
                  </Typography.Text>
                </div>
                <div>
                  <Divider style={{ margin: "-5px 0px" }} />
                  <Typography.Text strong>
                    Component Name: <br />
                    <span style={{ color: "#04b0a8" }}>
                      {props.componentName}
                    </span>
                  </Typography.Text>
                </div>
                <Divider style={{ margin: "-5px 0px" }} />
                <div>
                  <Form.Item
                    rules={[{ required: true }]}
                    name="mfgCode"
                    preserve={true}
                    label="Manufacturing Code"
                  >
                    <Input placeholder="Manufacturing Code" />
                  </Form.Item>
                </div>
                <Upload {...uploadProps}>
                  <Button block icon={<UploadOutlined />}>
                    Select File
                  </Button>
                </Upload>
                <Button onClick={handleFetchJSON}>Fetch JSON</Button>
              </Flex>
            </Card>
          </Col>
        )}

        <Col span={props.hideExtra ? 24 : 12}>
          {stage === 1 && (
            <Card size="small" style={{ height: "100%" }}>
              <Flex justify="center" align="center" style={{ marginTop: 20 }}>
                {loading("fetch") && (
                  <Typography.Text type="secondary" strong>
                    Fetching attributes...
                  </Typography.Text>
                )}
              </Flex>
              {!loading("fetch") && (
                <Row gutter={10}>
                  {fields
                    .sort((a, b) => a.order - b.order)
                    .filter((row) => row.order !== 0)
                    .map((row) => (
                      <Col span={24}>
                        <Flex>
                          <div></div>
                          {row.valueLabel !== "" && (
                            <Form.Item
                              rules={[{ required: !props.valuesNotRequired }]}
                              style={{ textTransform: "capitalize", flex: 1 }}
                              name={`${row.name}value`}
                              label={row.valueLabel + " Value"}
                            >
                              <Input />
                            </Form.Item>
                          )}
                          <Form.Item
                            rules={[{ required: !props.valuesNotRequired }]}
                            style={{ flex: 1.5 }}
                            name={row.name}
                            label={row.label.replaceAll("_", " ")}
                          >
                            {row.type === "select" && (
                              <MySelect
                                style={{ textTransform: "none" }}
                                labelInValue
                                // disabled={row.label === "multiplier"}
                                options={
                                  selectOptions.filter(
                                    (field) => field.name === row.name
                                  ) || []
                                }
                              />
                            )}
                            {row.type === "text" &&
                              row.name !== "353453454" && <Input />}
                            {row.name === "353453454" && (
                              <InputNumber
                                // maxLength={5}
                                style={{ width: "100%" }}
                              />
                            )}
                          </Form.Item>
                        </Flex>
                      </Col>
                    ))}
                </Row>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default CategoryForm;

interface FieldType {
  name: string;
  label: string;
  valueLabel: string;
  type: "text" | "select";
  order: number;
}

interface OptionType {
  name: string;
  text: string;
  value: string;
}

const convertValue = (value) => {
  let broken = "";
  if (value) {
    if (value.includes(".")) {
      let after = value?.toString().split(".")[1];

      if (after) {
        broken = after.split("");
        broken = broken.map((row, index) => {
          if (index === broken.length - 1) {
            return 1;
          } else {
            return 0;
          }
        });
        broken = "0." + broken.join("");
      }
    } else {
      broken = value.split("");

      broken = broken.map((row, index) => {
        if (index === 0) {
          return 1;
        } else {
          return 0;
        }
      });
      broken = broken.join("");
    }
  }

  return broken;
};

function getLetterFromNumber(number) {
  const mapping = {
    0.001: "Z",
    0.01: "Y",
    0.1: "X",
    1: "A",
    10: "B",
    100: "C",
    1000: "D",
    10000: "E",
    100000: "F",
    1000000: "G",
    10000000: "H",
    100000000: "I",
    1000000000: "J",
    10000000000: "K",
  };

  return mapping[+number] ? mapping[+number] : "Number not found";
}

const getValue = (value) => {
  if (value === undefined) {
    return "__";
  } else if (value?.value) {
    return value.value;
  } else if (typeof value === "string" || typeof value === "number") {
    return value;
  }
};

const getLabel = (value) => {
  if (value === undefined) {
    return "__";
  } else if (value?.label) {
    return value.label;
  } else if (typeof value === "string" || typeof value === "number") {
    return value;
  }
};
const getComponentValueForName = (value, category) => {
  console.log("valye in component value", value);
  let componentVal;
  let categorSnip = category?.toUpperCase();

  let newSnip = categorSnip?.substr(0, 3);
  if (newSnip != "CAP") {
    if (value <= 999) {
      componentVal = value + "R";
    } else if (value <= 999999 && value >= 1000) {
      componentVal = +Number(value / 1000).toFixed(3) + "K";
    } else if (value > 1000000) {
      componentVal = +Number(value / 1000000).toFixed(3) + "M";
    }
  } else {
    componentVal = value;
  }
  // setValForName(componentVal);
  return componentVal;
};

const generateCode = (values) => {
  let generatedCode = "";
  let generatedName = "";

  console.log("values for generate ", values);
  if (values) {
    // if (props.setAttributes) {
    //   let udpatedFields = {};
    //   for (let key in values) {
    //     const current = values[key];
    //     const found = fields.find((field) => field.name === key);
    //     console.log("field name", values);
    //     if (found) {
    //       udpatedFields[found?.name] = current?.value ?? current;
    //     } else {
    //       udpatedFields[key] = current;
    //     }
    //   }
    //   console.log("updateFields", udpatedFields);
    //   props.setAttributes(udpatedFields);
    // }

    const mounting = values["12312"];
    const packageSize = values["434092"];
    const value = values["574954523value"];
    // props.category?.value === "20231025864820945"
    //   ? values["353453454"]
    //   : props.category?.value === "20231028142920945"
    //   ? values["574954523value"]
    //   : values["574954524value"];
    const multiplier = values["65490895"];
    const tolerance = values["89768575"];
    const powerRating = values["7876567"];
    const frequency = values["5749534324"];
    const freequencyValue = values["5749534324value"];
    const capacitorType = values["49431234739"];
    const voltage = values["453940492"];

    const siUnit = values["574954523"];
    const currentSiUnitInd = values["5749532987"];
    const currentSiUnitIndValue = values["5749532987value"]; //this one
    const dcResistance = values["98789537458"];
    const dcResistanceValue = values["98789537458value"];
    const siUnitInd = values["574954524"];
    const siUnitIndValue = values["574954524value"]; //this one
    const siUnitCap = values["574954523"];
    const siUnitCapValue = values["574954523value"].value;
    console.log(
      "convertValue(value?.toString()) generate",
      convertValue(value?.toString())
    );
    let zeroes = [1];
    const valueArr = value
      ?.toString()
      .replaceAll(".", "")
      .split(".")[0]
      .split("");
    for (let i = valueArr?.length - 1; i >= 0; i--) {
      const current = valueArr[i];

      if (current === "0") {
        zeroes.push(0);
        valueArr.pop();
      } else {
        break;
      }
    }
    const broken = convertValue(value?.toString());
    let valueLetter = "";
    if (broken.length > 0) {
      if (!value?.toString().includes(".")) {
        valueLetter = getLetterFromNumber(zeroes?.join(""));
      } else {
        valueLetter = getLetterFromNumber(convertValue(value?.toString()));
      }
    }

    // if (props.category?.value === "20231025864820945") {
    //resistor
    // generatedCode = `RES${getValue(mounting)}(${getValue(
    //   packageSize
    // )})${getValue(tolerance)}${getValue(powerRating)}${
    //   valueArr?.join("")?.length > 4
    //     ? "Invalid Value"
    //     : valueArr?.join("")?.padStart(4, "0") ?? "__"
    // }${valueLetter}`;

    // generatedName = `${getValue(packageSize)}-${
    //   getComponentValueForName(value?.value ?? value, "Resistor") ?? "__"
    // }-${getLabel(tolerance)}-${getLabel(powerRating)}W-${
    //   getLabel(mounting) === "Thru Hole" ? "MI" : getLabel(mounting)
    // }-Resistor`;
    // }
    // else if (props.category?.value === "20231028142920945") {
    //capacitor
    generatedCode = `CAP${getValue(mounting)}${getValue(
      capacitorType
    )}(${getValue(packageSize)})${getValue(tolerance)}${getValue(voltage)}${
      valueArr?.join("")?.length > 4
        ? "Invalid Value"
        : valueArr?.join("")?.padStart(4, "0") ?? "__"
    }${valueLetter}${getValue(siUnit)}`;

    generatedName = `${getValue(packageSize)}-${getLabel(
      siUnitCapValue
    )}${getLabel(siUnitCap)}-${getLabel(tolerance)}-${getLabel(voltage)}V-${
      getLabel(mounting) === "Thru Hole" ? "MI" : getLabel(mounting)
    }-${getLabel(capacitorType)}`;
    // }
    //  else if (props.category?.value === "348423983543") {
    //   //inductor
    //   generatedCode = `(${getValue(packageSize)})-${getValue(
    //     siUnitIndValue
    //   )}${getLabel(siUnitInd)}-${getValue(freequencyValue)}${getLabel(
    //     frequency
    //   )}-${getValue(currentSiUnitIndValue)}${getLabel(
    //     currentSiUnitInd
    //   )}-${getValue(dcResistanceValue)}${getLabel(dcResistance)}-${getLabel(
    //     tolerance
    //   )}-${
    //     getLabel(mounting) === "Thru Hole" ? "MI" : getLabel(mounting)
    //   }-Inductor`;
    //   generatedName = generatedCode;
    // }
    return generatedName;
  }
};
