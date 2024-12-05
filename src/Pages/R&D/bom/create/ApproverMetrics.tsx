import IconButton from "@/Components/IconButton";
import useApi from "@/hooks/useApi";
import { ModalType, SelectOptionType } from "@/types/general";
import { MultiStageApproverType } from "@/types/r&d";
import { CloseCircleFilled, PlusCircleFilled } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Flex,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import { getUserOptions } from "@/api/general";
import { getFixedApprovers } from "@/api/r&d/bom";

interface Props extends ModalType {
  approvers: any[];
  setApprovers: React.Dispatch<React.SetStateAction<MultiStageApproverType[]>>;
  submitLoading: boolean;
  submitHandler: (action: "draft" | "final") => void;
  saveType: "draft" | "final" | null|any;
}

const ApproverMetrics = ({
  approvers,
  setApprovers,
  show,
  hide,
  submitHandler,
  submitLoading,
  saveType,
  // initialApprovers,
}: Props) => {
  const [asyncOptions, setAsyncOptions] = useState<any>([]);

  const { executeFun, loading } = useApi();
  function getLastDigit(input) {
    // Match all digits in the string
    const match = input.match(/\d+/g);
    // If matches are found, return the last digit of the last match
    if (match) {
      const lastMatch = match[match.length - 1]; // Get the last numeric string
      return lastMatch[lastMatch.length - 1]; // Return the last digit of the last numeric string
    }
    return null; // Return null if no digits are found
  }
  const handleFetchUserOptions = async (search: string) => {
    const response = await executeFun(() => getUserOptions(search), "select");
    setAsyncOptions(response.data ?? []);
  };

  const handleFetchFixedApprovers = async () => {
    // setApprovers(initialApprovers);
    const response = await executeFun(() => getFixedApprovers(), "fetch");
    // console.log("response for fixed", response);

    let arr = approvers;
    arr = arr.map((row) => {
      const found = response.data.find((resRow) => resRow.stage === row.stage);
      // console.log("response", found);

      if (found) {
        let obj = row;
        obj.approvers[obj.approvers.length - 1].user = {
          text: found.name,
          value: found.crn,
          label: found.name,
        };

        return obj;
      } else {
        return row;
      }
    });
    // console.log("arr handleFetchFixedApprovers", arr);

    if (approvers) {
      const updatedData = convertStageToNumber(arr);
      setApprovers(updatedData);
    }
    // setApprovers(arr);
  };

  const handleDeleteApprover = (stage: number, line: number) => {
    const arr = approvers.map((row) => {
      let obj = row;
      // console.log("row in delate", obj);

      if (row.stage === stage) {
        //remove logic here
        obj = {
          ...obj,
          approvers: obj.approvers.filter((lineRow) => {
            return lineRow.line !== line;
          }),
        };

        //decreasing line number of last approver
        obj.approvers[obj.approvers.length - 1].line =
          obj.approvers[obj.approvers.length - 1].line - 1;
      }
      return obj;
    });
    // console.log("arr in deelte", arr);

    if (approvers) {
      const updatedData = convertStageToNumber(arr);
      setApprovers(updatedData);
    }
    // setApprovers(arr);
  };

  const handleUpdateApprover = (
    stage: number,
    line: number,
    value: SelectOptionType
  ) => {
    let arr = approvers;
    arr = approvers.map((row) => {
      if (row.stage === stage) {
        return {
          ...row,
          approvers: row.approvers.map((appRow) => {
            if (appRow.line === line) {
              return {
                ...appRow,
                user: value,
              };
            } else {
              return appRow;
            }
          }),
        };
      } else {
        return row;
      }
    });
    // setApprovers(arr);
    if (approvers) {
      const updatedData = convertStageToNumber(arr);
      setApprovers(updatedData);
    }
 
  };

  const handleAddApprover = (stage: number) => {
    let arr = approvers;
    let found = approvers.find((row) => row.stage === stage);
    let last = found?.approvers[found.approvers.length - 1];

    if (!found || !last) return;
    //pushing last approver again with updated line
    found?.approvers.push({
      ...last,
      line: last?.line + 1,
    });

    //udpating second last
    const secondLastIndex = found.approvers.length - 2;
    let secondLast = found.approvers[secondLastIndex];
    console.log("this is second last", secondLastIndex);
    found.approvers[secondLastIndex] = {
      ...secondLast,
      fixed: false,
      user: undefined,
    };

    arr = approvers.map((row) => {
      if (row.stage === stage) {
        return found;
      }
      {
        return row;
      }
    });
    if (approvers) {
      const updatedData = convertStageToNumber(arr);
      setApprovers(updatedData);
    }

    // setApprovers(arr);
    // console.log("this is arr", arr);
  };

  // console.log("save type", saveType);

  useEffect(() => {
    handleFetchFixedApprovers();
  }, []);
  // function getLastDigit(input) {
  //   // Match all digits in the string
  //   const match = input.match(/\d+/g);
  //   // If matches are found, return the last digit of the last match
  //   if (match) {
  //     const lastMatch = match[match.length - 1]; // Get the last numeric string
  //     return lastMatch[lastMatch.length - 1]; // Return the last digit of the last numeric string
  //   }
  //   return null; // Return null if no digits are found
  // }
  function convertStageToNumber(data) {
    // console.log("data ub ", data);

    return data.map((item) => {
      if (typeof item.stage === "string") {
        // console.log(" item.stage", item.stage);

        // Extract the numeric part from the string using a regular expression
        const match = item.stage.match(/\d+/);
        // console.log("match", match);

        // Replace `stage` with the extracted number, if found
        item.stage = match ? parseInt(match[0], 10) : item.stage;
      }
      return item;
    });
  }
  // useEffect(() => {
  //   if (approvers) {
  //     const updatedData = convertStageToNumber(approvers);
  //     setApprovers(updatedData);
  //     setApprovers(updatedData);
  //   }
  // }, [approvers]);

  // console.log("approvaers fr modal dsiable", approvers);

  return (
    <Modal
      style={{ minWidth: "30vw" }}
      open={show}
      onCancel={hide}
      title="Approver Metrics"
      // okText="Create BOM"
      // confirmLoading={submitLoading}
      // onOk={() => submitHandler(saveType)}
      // disa
      footer={null}
    >
      <Flex vertical style={{ minHeight: "70vh" }}>
        {approvers.map((approver) => (
          <Stage
            asyncOptions={asyncOptions}
            handleFetchUserOptions={handleFetchUserOptions}
            setAsyncOptions={setAsyncOptions}
            stage={approver}
            key={approver.stage}
            selectLoading={loading("select")}
            handleDeleteApprover={handleDeleteApprover}
            handleAddApprover={handleAddApprover}
            handleUpdateApprover={handleUpdateApprover}
            convertStageToNumber={convertStageToNumber}
          />
        ))}
      </Flex>
      <Row justify={"end"}>
        {" "}
        <Col span={5}>
          <Button onClick={hide}>Cancel</Button>{" "}
        </Col>
        <Col span={6}>
          <Button
            // loading={submitLoading}
            onClick={() => submitHandler(saveType)}
            type="primary"
            disabled={
              (approvers && !approvers[2]?.approvers[0]?.user?.value) ||
              (approvers && !approvers[1]?.approvers[0]?.user?.value) ||
              (approvers && !approvers[0]?.approvers[0]?.user?.value)
            }
          >
            {saveType == "draft" ? "Save As Draft" : "Create BOM"}
          </Button>{" "}
        </Col>{" "}
      </Row>
    </Modal>
  );
};

export default ApproverMetrics;

interface StageProps {
  stage: MultiStageApproverType;
  handleFetchUserOptions: (search: string) => void;
  asyncOptions: [];
  setAsyncOptions: React.Dispatch<React.SetStateAction<never[]>>;
  selectLoading: boolean;
  handleDeleteApprover: (stage: number, line: number) => void;
  handleAddApprover: (stage: number) => void;
  handleUpdateApprover: (
    stage: number,
    line: number,
    value: SelectOptionType
  ) => void;
}
const Stage = ({
  asyncOptions,
  handleFetchUserOptions,
  setAsyncOptions,
  stage,
  selectLoading,
  handleDeleteApprover,
  handleAddApprover,
  handleUpdateApprover,
  convertStageToNumber,
}: StageProps) => {
  return (
    <Flex vertical>
      <Flex justify="space-between">
        <Typography.Title level={5}>L-{stage?.stage}</Typography.Title>
        <IconButton
          onClick={() => handleAddApprover(stage.stage)}
          icon={
            <PlusCircleFilled
              style={{ fontSize: 24, color: "rgb(4,176,168)" }}
            />
          }
        />
      </Flex>
      <Flex vertical gap={10}>
        {stage.approvers.map((approver, index) => (
          <div style={{ margin: "0 30px" }}>
            <label style={{ fontSize: 12 }}>S-{approver.line}</label>
            <Flex gap={10} align="center">
              <MyAsyncSelect
                disabled={approver.fixed}
                optionsState={asyncOptions}
                onBlur={() => setAsyncOptions([])}
                loadOptions={handleFetchUserOptions}
                selectLoading={selectLoading}
                value={approver.user}
                labelInValue={true}
                onChange={(value) =>
                  handleUpdateApprover(stage.stage, approver.line, value)
                }
              />
              {!approver.fixed && (
                <IconButton
                  onClick={() =>
                    handleDeleteApprover(stage.stage, approver.line)
                  }
                  icon={
                    <CloseCircleFilled
                      style={{ fontSize: 18, color: "brown" }}
                    />
                  }
                />
              )}
            </Flex>
          </div>
        ))}
      </Flex>
      <Divider />
    </Flex>
  );
};
