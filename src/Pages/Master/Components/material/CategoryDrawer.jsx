import {
  Col,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import React from "react";
import MyButton from "../../../../Components/MyButton";
import { useParams } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import MySelect from "../../../../Components/MySelect";
import { Numbers } from "@mui/icons-material";

export default function CategoryDrawer({
  show,
  hide,
  getDetails,
  setUniqueIdData,
}) {
  // console.log("show", show, hide, getDetails, setUniqueIdData);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [uniqueId, setUniqueId] = useState("");
  const [fieldSelectOptions, setFieldSelectOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [manfCode, setManfCode] = useState(null);
  const params = useParams();
  const [form] = Form.useForm();
  var alpha;
  var extractednum;
  var getAlpha;
  var wholeVal;
  var result;
  const value = Form.useWatch("value", form);
  const getCategoryFields = async (categoryKey) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/mfgcategory/getAttributeListByCategory",
        {
          category: categoryKey,
        }
      );
      const { data } = response;

      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            label: row.text,
            name: row.id,
            type: row.inp_type,
          }));
          setFields(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {}
  };

  const getieldSelectOptions = async (fields) => {
    try {
      let optionsArr = [];
      setLoading("fetch");
      setFieldSelectOptions([]);
      await fields.map(async (row) => {
        const response = await imsAxios.post("/mfgcategory/getAttributeValue", {
          attribute: row.name,
        });
        const { data } = response;
        if (data.code === 200) {
          optionsArr.push({ data: data.message });
          setFieldSelectOptions((curr) => [
            ...curr,
            {
              name: row.name,
              options: data.message.map((row) => ({
                text: row.attr_value,
                value: row.code,
              })),
            },
          ]);
        }
      });
    } catch (error) {}
  };

  const getFieldValues = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/mfgcategory/getRmCategoryData", {
        component: params.componentKey,
      });
      const { data } = response;

      if (data) {
        if (data.code === 200) {
          let finalObj = {};
          let arr = [];
          setUniqueId(data.inputs.rm_cat_code);
          for (var key in data.inputs) {
            if (data.inputs[key].id) {
              finalObj[key] = data.inputs[key].name;
            }
          }

          form.setFieldsValue(finalObj);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {}
  };

  const validateHandler = async () => {
    const values = await form.validateFields();
    console.log(values);
    console.log(uniqueId);
    console.log("selectedCategory", selectedCategory);
    console.log("msnf", manfCode);

    const attr_raw =
      selectedCategory.label === "Capacitor"
        ? {
            tolerance: values.tolerance.value,
            mountingStyle: values.mounting_style.value,
            packageSize: values.package_size.value,
            voltage: values.voltage.value,
            value: values.value,
            typeofCapacitor: values.type_Of_capacitor.value,
            siUnit: values.si_unit.value,
            //manufacturing code
            manufacturing_code: manfCode,
          }
        : selectedCategory.label === "Resistor"
        ? {
            multipler: values.multiplier,
            tolerance: values.tolerance.value,
            mountingStyle: values.mounting_style.value,
            packageSize: values.package_size.value,
            powerRating: values.power_rating.value,
            value: values.value,
            //manufacturing code
            manufacturing_code: manfCode,
          }
        : "";
    let payload;
    if (selectedCategory.label === "Other") {
      payload = {
        attributeCode: "--",
        // c_type: selectedCategory.label === "Capacitor" ? "C" : "R",
        attribute_category: selectedCategory?.label,
        attr_raw,
      };
    } else {
      payload = {
        attributeCode: uniqueId,
        // c_type: selectedCategory.label === "Capacitor" ? "C" : "R",
        attribute_category: selectedCategory?.label,
        attr_raw,
      };
    }

    console.log("payload,", payload);
    setUniqueIdData(payload);
    hide();
  };
  const getCategoryOptions = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.get("/mfgcategory/listCategories");

      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setCategoryOptions(data.data);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getieldSelectOptions(fields);
  }, [fields]);
  useEffect(() => {
    if (show) {
      // getCategoryFields();
      getFieldValues();
      getCategoryOptions();
    }
    if (show?.value !== "NA") {
      setSelectedCategory(show);
    }
    if (show?.value == "--") {
      setSelectedCategory("Other");
    }
  }, [show]);
  useEffect(() => {
    // console.log("selectedCategory?.value", selectedCategory?.value);
    if (selectedCategory && selectedCategory?.value !== "348423984423") {
      if (
        selectedCategory?.value !== "Other" ||
        selectedCategory?.value !== undefined
      ) {
        console.log("here cs", selectedCategory?.value);
        getCategoryFields(selectedCategory?.value);
      }
    } else if (selectedCategory && selectedCategory?.value === "348423984423") {
      setFields([]);
    }
  }, [selectedCategory]);
  //check the value
  const checkDecimal = (value) => {
    {
      result = value - Math.floor(value) !== 0;
      if (result) {
        let decimalPartLength = (value.toString().split(".")[1] || "").length;
        let decimalVal = addZerosToTen(decimalPartLength);
        let pointVal = 1 / decimalVal;
        alpha = getLetterFromDeciNumber(pointVal);
        form.setFieldValue("multiplier", alpha);
        getWholeNumber(value, decimalVal);
      } else {
        let newNum = removeAndCountTrailingZeros(value);
        getAlpha = removeTrailingZerosUsingSwitch(newNum.count);
        extractednum = newNum.stringWithoutTrailingZeros;
      }
    }
  };
  //add Zero in the starting ot create 4 number code value digit
  function zeroPad(num) {
    return num.toString().padStart(5, "0");
  }
  //generate code
  const getUniqueNo = async () => {
    let values = await form.validateFields();
    let makingString;
    if (result) {
      makingString = wholeVal + alpha;
    } else {
      makingString = extractednum + alpha;
    }

    let categorSnip = selectedCategory.label.toUpperCase();
    let newSnip = categorSnip.substr(0, 3);
    if (newSnip == "CAP") {
      let filledFields =
        newSnip +
        values.mounting_style.value +
        values.type_Of_capacitor.value +
        "(" +
        values.package_size.value +
        ")" +
        // values.power_rating.value +
        values.tolerance.value +
        values.voltage.value;

      if (makingString.length <= 5) {
        let codeValue = zeroPad(makingString);
        setUniqueId(filledFields + codeValue + values.si_unit.value);
      }
    } else if (newSnip == "RES") {
      let filledFields =
        newSnip +
        values.mounting_style.value +
        "(" +
        values.package_size.value +
        ")" +
        values.power_rating.value +
        values.tolerance.value;
      if (makingString.length <= 5) {
        let codeValue = zeroPad(makingString);
        setUniqueId(filledFields + codeValue);
      }
    } else {
      console.log("makingString greater than 5  =", makingString);
    }
  };

  //without decimal value functions
  function addZerosToTen(numZeros) {
    let result = "1" + "0".repeat(numZeros);
    return parseInt(result);
  }
  function getLetterFromNumber(number) {
    const mapping = {
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

    const result = Object.entries(mapping).find(
      ([key, value]) => parseInt(key) === number
    );
    return result ? result[1] : "Number not found";
  }
  function removeTrailingZerosUsingSwitch(numbers, letter) {
    let numberpowerOfTen;

    let number = addZerosToTen(numbers);
    alpha = getLetterFromNumber(number);

    form.setFieldValue("multiplier", alpha);
  }
  function removeAndCountTrailingZeros(number) {
    const numString = number.toString();
    let count = 0;

    for (let i = numString.length - 1; i >= 0; i--) {
      if (numString[i] === "0") {
        count++;
      } else {
        break;
      }
    }

    const stringWithoutTrailingZeros = numString.slice(
      0,
      numString.length - count
    );
    return {
      stringWithoutTrailingZeros: parseInt(stringWithoutTrailingZeros),
      count,
    };
  }

  //decimal value functions
  function getLetterFromDeciNumber(number) {
    let result;

    switch (number) {
      case 0.001:
        result = "Z";
        break;
      case 0.01:
        result = "Y";
        break;
      case 0.1:
        result = "X";
        break;
      default:
        result = "Number not found";
    }

    return result;
  }

  const getWholeNumber = (num, decimalVal) => {
    wholeVal = num * decimalVal;
    wholeVal = Number(wholeVal).toFixed(0);
  };

  // ---
  useEffect(() => {
    if (value) {
      checkDecimal(value);
      getUniqueNo();
    }
  }, [value, alpha]);
  const sortedFields = [...fields].sort((a, b) => {
    if (a.type === b.type) {
      return a.label.localeCompare(b.label);
    }
    return a.type.localeCompare(b.type);
  });

  return (
    <Drawer
      title="Category Details"
      placement="right"
      onClose={hide}
      width={"40vw"}
      open={show}
      extra={<MyButton variant="submit" onClick={validateHandler} />}
    >
      <Form form={form} layout="vertical">
        <Row gutter={[6, 6]}>
          <Col span={24}>
            <Row justify="space-between">
              <Col>
                <Typography.Text strong>Unique Id : </Typography.Text>
                <Typography.Text>{uniqueId ?? "--"}</Typography.Text>
              </Col>
              <Col span={10}>
                <Row justify="end">
                  {/* {show?.value !== "NA" && (
                    <Typography.Text strong>{show?.text}</Typography.Text>
                  )} */}
                </Row>

                <Flex justify="end" align="center" gap={5}>
                  <Typography.Text style={{ fontSize: 13 }}>
                    Category:{" "}
                  </Typography.Text>
                  <div style={{ width: 130 }}>
                    <MySelect
                      labelInValue={true}
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      options={categoryOptions}
                    />
                  </div>
                </Flex>
              </Col>
              <Col span={12}>
                {/* <Flex justify="center"> */}
                {/* <Typography.Text strong>Manufacturing Code: {uniqueId}</Typography.Text> */}
                <Input
                  placeholder="Manufacturing Code"
                  onChange={(e) => setManfCode(e.target.value)}
                />
              </Col>
            </Row>
            <Row justify="center">
              <Typography.Text
                strong
                type="secondary"
                style={{ textAlign: "center" }}
              >
                Select a Category to continue
                <br />
                In Case of category "Others" no attributes will be required and
                no unique Id will be generated
              </Typography.Text>
            </Row>
          </Col>

          <Divider style={{ margin: 0 }} />
          {sortedFields.map((row) => (
            <Col span={8} key={row.label}>
              {" "}
              {/* Ensure to provide a unique key for each element */}
              {row.type === "select" && (
                <Form.Item
                  style={{ textTransform: "capitalize" }}
                  name={row.label}
                  label={row.label.replaceAll("_", " ")}
                >
                  <MySelect
                    labelInValue
                    disabled={row.label === "multiplier"}
                    options={
                      fieldSelectOptions.find(
                        (field) => field.name === row.name
                      )?.options || []
                    }
                  />
                </Form.Item>
              )}
              {row.type === "text" && (
                <Form.Item
                  style={{ textTransform: "capitalize" }}
                  name={row.label}
                  label={row.label.replaceAll("_", " ")}
                >
                  <Input />
                </Form.Item>
              )}
            </Col>
          ))}
        </Row>
      </Form>
    </Drawer>
  );
}
