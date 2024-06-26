import { Col, Collapse, Divider, Flex, Popover, Row, Typography } from "antd";
import { useEffect, useState } from "react";

import useApi from "@/hooks/useApi";
import {
  getAllCategoryFields,
  getCategoryOptions,
} from "@/api/master/component";
import MyButton from "@/Components/MyButton";
import { v4 } from "uuid";
import AddCategoryModal from "@/Pages/Master/Components/material/categoryMaster/AddCategoryModal";
import { ConsoleSqlOutlined } from "@ant-design/icons";

const CategoryMaster = () => {
  const [fields, setFields] = useState([]);
  const [selectOptions, setSelectOptions] = useState([]);
  const [showAddValue, setShowAddValue] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  const { executeFun, loading } = useApi();

  const handleFetchFields = async () => {
    setFields([]);
    setSelectOptions([]);
    const response = await executeFun(() => getAllCategoryFields(), "fetch");
    let allOptions = [];
    if (response.data.code === 200) {
      const arr = response.data.message.map((row) => ({
        label: row.text,
        name: row.id,
        id: v4(),
        type: row.inp_type,
        isAddable: row.isAddable === "true",
        regex: row.regex,
        componentType: row.componentType,
      }));
      // setFields(arr);

      const categorySet = new Set();
      arr.map((row) => categorySet.add(row.componentType));
      console.log("this is the cateogry set", categorySet);
      categorySet.forEach((row) => {
        const foundArr = arr.filter(
          (fieldRow) => fieldRow.componentType === row
        );

        setFields((curr) => [
          ...curr,
          {
            label: row,
            key: row,
            fields: foundArr,
          },
        ]);
      });

      const fieldNames = arr
        .filter((row) => row.type === "select")
        .map((row) => row.name);

      console.log("these are the fieldNames", fieldNames);
      const requestPromises = fieldNames.map((row) =>
        executeFun(() => getCategoryOptions(row), "values")
      );

      const allResponse = await Promise.all(requestPromises);
      console.log("all response1", allResponse);
      allResponse.map((row) => {
        if (
          typeof row.data === "object" &&
          row?.data &&
          !allOptions.find((row1) => row1.name === row.data[0].name)
        ) {
          allOptions = [...allOptions, ...row.data];
        }
      });
      setSelectOptions(allOptions);
      console.log(
        "all response",
        allOptions.filter((row) => row.name === "12312")
      );
    }
  };

  console.log("select options 123", selectOptions);

  const handleSelectField = (field: any) => {
    setSelectedField(field);
    setShowAddValue(true);
  };
  const handleHideAddModal = () => {
    setSelectedField(null);
    setShowAddValue(false);
  };
  console.log("fields are here", fields);
  useEffect(() => {
    handleFetchFields();
  }, []);
  return (
    <Flex vertical style={{ height: "95%", padding: 10, paddingBottom: 50 }}>
      <AddCategoryModal
        show={showAddValue}
        field={selectedField}
        hide={handleHideAddModal}
        fieldSelectOptions={selectOptions}
        handleFetchFields={handleFetchFields}
      />
      <Row>
        <Col span={24}>
          <Typography.Title level={5}>Update Component Master</Typography.Title>
        </Col>
        <Col span={24}>
          <Typography.Text type="secondary" strong>
            Here you can add more options to the component attributes but you
            can not update the existing ones
          </Typography.Text>
        </Col>
        <Divider />
        {loading("fetch") && (
          <Flex
            style={{ width: "100%", margin: "50px 0" }}
            justify="center"
            align="middle"
          >
            <Typography.Text strong type="secondary">
              Fetching Categories
            </Typography.Text>
          </Flex>
        )}
        <Collapse
          items={fields.map((row) => ({
            ...row,
            children: (
              <Row gutter={[6, 10]}>
                {row.fields
                  .filter((row) => row.type === "select")
                  .map((field, index) => (
                    <Col span={24} key={index}>
                      <Row gutter={[6, 6]}>
                        <Col span={1}>
                          <Typography.Text strong type="secondary">
                            {index + 1}.
                          </Typography.Text>
                        </Col>
                        <Col span={4}>
                          <Typography.Text
                            strong
                            style={{ textTransform: "capitalize" }}
                          >
                            {field.label.replaceAll("_", " ")}:
                          </Typography.Text>
                        </Col>
                        <Col span={18}>
                          <Row>
                            {loading("values") && (
                              <Typography.Text>
                                Fetching Options...
                              </Typography.Text>
                            )}
                            {selectOptions
                              .filter((row) => row.name === field.name)
                              .map((row) => (
                                <Popover
                                  content={
                                    <Row>
                                      <Col span={24}>
                                        <Typography.Text strong>
                                          {row.value}
                                        </Typography.Text>
                                      </Col>
                                    </Row>
                                  }
                                >
                                  <Col
                                    style={{
                                      background: "#cccccc",
                                      padding: "5px 8px",
                                      borderRadius: 3,
                                      margin: "2px 3px",
                                    }}
                                  >
                                    {row.text}
                                  </Col>
                                </Popover>
                              ))}
                            <Col>
                              {field.isAddable && (
                                <MyButton
                                  onClick={() => handleSelectField(field)}
                                  variant="add"
                                  type="link"
                                />
                              )}
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                  ))}
              </Row>
            ),
          }))}
          style={{ maxHeight: "90%", overflow: "auto", width: "100%" }}
        />
      </Row>
    </Flex>
  );
};

export default CategoryMaster;
