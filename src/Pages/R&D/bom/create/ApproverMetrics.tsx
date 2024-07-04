import IconButton from "@/Components/IconButton";
import useApi from "@/hooks/useApi";
import { ModalType, SelectOptionType } from "@/types/general";
import { MultiStageApproverType } from "@/types/r&d";
import { CloseCircleFilled, PlusCircleFilled } from "@ant-design/icons";
import { Divider, Flex, Input, Modal, Typography } from "antd";
import { useEffect, useState } from "react";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import { getUserOptions } from "@/api/general";
import { getFixedApprovers } from "@/api/r&d/bom";

interface Props extends ModalType {}

const ApproverMetrics = ({ hide, show, submitHandler }: Props) => {
  const [asyncOptions, setAsyncOptions] = useState([]);

  const { executeFun, loading } = useApi();

  const [approvers, setApprovers] =
    useState<MultiStageApproverType[]>(initialApprovers);

  const handleFetchUserOptions = async (search: string) => {
    const response = await executeFun(() => getUserOptions(search), "select");
    setAsyncOptions(response.data ?? []);
  };

  const handleFetchFixedApprovers = async () => {
    const response = await executeFun(() => getFixedApprovers(), "fetch");

    let arr = approvers;
    arr = arr.map((row) => {
      const found = response.data.find((resRow) => resRow.stage === row.stage);
      console.log("after found", found);
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

    setApprovers(arr);
  };

  const handleDeleteApprover = (stage: number, line: number) => {
    const arr = approvers.map((row) => {
      let obj = row;
      if (row.stage === stage) {
        //remove logic here
        obj = {
          ...obj,
          approvers: obj.approvers.filter((lineRow) => {
            return lineRow.line !== line;
          }),
        };
      }
      return obj;
    });

    setApprovers(arr);
    // setApprovers(
    // );
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

    setApprovers(arr);
  };

  const handleAddApprover = (stage: number) => {
    const found = approvers.find((row) => row.stage === stage);
    const newApprover: MultiStageApproverType["approvers"][0] = {
      line: found?.approvers.length - 1,
      user: undefined,
      new: true,
    };
    let arr = approvers;
    arr = arr.map((row) => {
      let obj = row;
      if (obj.stage === stage) {
        obj.approvers.push(obj.approvers[obj.approvers.length - 1]);
        obj.approvers[obj.approvers.length - 2] = newApprover;
      }

      return obj;
    });

    setApprovers(arr);
  };

  useEffect(() => {
    if (show) {
      handleFetchFixedApprovers();
    }
  }, [show]);
  return (
    <Modal
      style={{ minWidth: "30vw" }}
      open={show}
      onCancel={hide}
      title="Approver Metrics"
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
          />
        ))}
      </Flex>
    </Modal>
  );
};

export default ApproverMetrics;

const initialApprovers = [
  {
    stage: 1,
    approvers: [
      {
        line: 1,
        user: undefined,
      },
      {
        line: 2,
        user: undefined,
      },
      {
        line: 3,
        user: undefined,
        fixed: true,
      },
    ],
  },
  {
    stage: 2,
    approvers: [
      {
        line: 1,
        user: undefined,
      },
      {
        line: 2,
        user: undefined,
      },
      {
        line: 3,
        user: undefined,
        fixed: true,
      },
    ],
  },
  {
    stage: 3,
    approvers: [
      {
        line: 1,
        user: undefined,
      },
      {
        line: 2,
        user: undefined,
      },
      {
        line: 3,
        user: undefined,
        fixed: true,
      },
    ],
  },
];

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
}: StageProps) => {
  return (
    <Flex vertical>
      <Flex justify="space-between">
        <Typography.Title level={5}>L-{stage.stage}</Typography.Title>
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
            <label style={{ fontSize: 12 }}>S-{index + 1}</label>
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
