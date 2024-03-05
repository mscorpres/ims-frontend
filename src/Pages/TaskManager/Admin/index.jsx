import { useEffect, useState } from "react";
import { Col, Flex, Row, Space } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import ViewTasks from "./View";
import MyButton from "../../../Components/MyButton";
import CreateTask from "./Create";
import { toast } from "react-toastify";
import DetailsModal from "./View/DetailsModal";
import TransferModal from "../TransferModal";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import TaskLogs from "../TaskLogs";
import Typography from "antd/es/typography/Typography";

const initFilters = {
  username: "",
  status: "",
};

const Tasks = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setSetshowDetailsModal] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [filters, setFilters] = useState(initFilters);

  const fetchTasks = async (filters) => {
    try {
      setLoading("fetch");
      let filterString = "";
      let filterArr = [];
      for (var key in filters) {
        if (filters[key]) {
          filterArr = [
            ...filterArr,
            `${key}=`,
            `${filters[key]?.value ?? filters[key]}&`,
          ];
        }
      }

      filterString = filterArr.join("");

      const response = await imsAxios.get(
        "/taskmaster/fetch_created_task?" + filterString
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row, index) => ({
            id: index + 1,
            taskId: row.task_id,
            title: row.task_title,
            assignDate: row.assign_dt,
            assignedTo: row.assign_to,
            assignedToName: row.assign_to_name,
            tat: row.tat,
            status: row.status,
          }));
          console.log(arr);
          setTasks(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getUserOptions = async (search) => {
    try {
      setLoading("select");
      setAsyncOptions([]);
      const response = await imsAxios.post("/backend/fetchUsers", {
        search,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            value: row.id,
            text: row.text,
          }));
          setAsyncOptions(arr);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTasks();
  }, []);
  useEffect(() => {
    fetchTasks(filters);
  }, [filters]);

  return (
    <Row style={{ height: "90%" }} align="center">
      <Col span={20}>
        <Flex style={{ height: "100%" }} vertical gap={10}>
          <Flex justify="space-between" align="end" style={{ width: "100%" }}>
            <Space align="end">
              <div style={{ width: 200 }}>
                <Typography.Text style={{ fontSize: 12 }}>
                  Select User
                </Typography.Text>
                <MyAsyncSelect
                  placeholder="Select User"
                  labelInValue={true}
                  onBlur={() => setAsyncOptions([])}
                  loading={loading === "select"}
                  loadOptions={getUserOptions}
                  optionsState={asyncOptions}
                  value={filters.username}
                  onChange={(value) =>
                    setFilters((curr) => ({ ...curr, username: value }))
                  }
                />
              </div>
              <div style={{ width: 200 }}>
                <Typography.Text style={{ fontSize: 12 }}>
                  Select Status
                </Typography.Text>
                <MySelect
                  labelInValue={true}
                  placeholder="Select Status"
                  value={filters.status}
                  onChange={(value) =>
                    setFilters((curr) => ({ ...curr, status: value }))
                  }
                  options={statusOptions}
                />
              </div>
              <MyButton
                variant="clear"
                type="link"
                onClick={() => setFilters(initFilters)}
              />
            </Space>
            <MyButton onClick={() => setShowAddModal(true)} variant="add" />
          </Flex>
          <div style={{ width: "100%", height: "100%" }}>
            <ViewTasks
              loading={loading === "fetch"}
              tasks={tasks}
              setSetshowDetailsModal={setSetshowDetailsModal}
              setShowTransferModal={setShowTransferModal}
              showLogs={showLogs}
              setShowLogs={setShowLogs}
            />
          </div>
        </Flex>
      </Col>
      <CreateTask
        show={showAddModal}
        hide={() => setShowAddModal(false)}
        fetchTasks={fetchTasks}
      />
      <DetailsModal
        show={showDetailsModal}
        hide={() => setSetshowDetailsModal(null)}
        setShowAddModal={setShowAddModal}
        fetchTasks={fetchTasks}
        showTransferModal={showTransferModal}
        setShowTransferModal={setShowTransferModal}
      />
      <TransferModal
        show={showTransferModal}
        hide={() => setShowTransferModal(false)}
      />
      <TaskLogs show={showLogs} hide={() => setShowLogs(false)} />
    </Row>
  );
};

export default Tasks;

const statusOptions = [
  {
    text: "Completed",
    value: "COMPLETED",
  },
  {
    text: "Pending",
    value: "PENDING",
  },
];
