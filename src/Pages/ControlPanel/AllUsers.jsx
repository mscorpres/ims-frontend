import React, { useEffect, useState } from "react";
import MyDataTable from "../../Components/MyDataTable";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import { Col, Row, Button, Modal, Input, Form, Checkbox, Collapse } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { AiFillEdit } from "react-icons/ai";
import { PlusOutlined } from "@ant-design/icons";
import MySelect from "../../Components/MySelect";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { v4 } from "uuid";

const AllUsers = () => {
  const [rows, setRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailedData, setDetailedData] = useState([]);
  const actionColumns = [
    {
      headerName: "Action",
      type: "actions",
      field: "Action",
      width: 80,
      headerClassName: "header-background",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<AiFillEdit />}
          onClick={() => editUser(params.row)}
        />,
      ],
    },
  ];
  const columns = [
    {
      headerName: "S No.",
      field: "id",
      width: 80,
      headerClassName: "header-background",
    },
    {
      headerName: "User Name",
      field: "name",
      width: 200,
      headerClassName: "header-background",
    },
    {
      headerName: "Project",
      field: "project",
      width: 200,
      headerClassName: "header-background",
    },
    {
      headerName: "Permissions",
      field: "pages",
      width: 500,
      headerClassName: "header-background",
    },
  ];

  const editUser = async (row) => {
    try {
      const getUser = await imsAxios.post("/backend/fetchAllUser", {
        search: row.name,
      });

      const getUserInfo = await imsAxios.get(
        `/user/permission/getUser/${getUser.data[0].id}`
      );

      setDetailedData(getUserInfo.data);
      setIsModalOpen(true);
    } catch (error) {
      console.log("error in catch", error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await imsAxios.get("/user/permission/getUsers");
      if (response.status == "200") {
        const arr = response.data.map((row, index) => {
          const pages = row.pages.map((page) => page.name).join(", ");
          return {
            id: index + 1,
            name: row.name,
            project: row.project.toString(),
            pages: pages,
          };
        });
        setRows(arr);
        toast.success("Users fetched successfully");
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      toast.error("Something went wrong, Please contact administrator");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);
  return (
    <>
      <Col
        style={{
          width: "100%",
          height: "90%",
          marginTop: "1rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        <Row
          style={{
            marginBottom: "1rem",
            right: "0",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Add User
          </Button>
        </Row>
        <Row
          style={{
            height: "95%",
          }}
        >
          <MyDataTable columns={[...columns, ...actionColumns]} data={rows} />
        </Row>
      </Col>
      <AddUserModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        getRows={getUsers}
        setModalRows={setRows}
        detailedData={detailedData}
        setDetailedData={setDetailedData}
      />
    </>
  );
};

export default AllUsers;

const AddUserModal = ({
  isModalOpen,
  setIsModalOpen,
  getRows,
  detailedData,
  setDetailedData,
}) => {
  const [form] = Form.useForm();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectLoading, setSelectLoading] = useState(false);
  const [projectNames, setProjectNames] = useState([]);
  const [pages, setPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [pagesResponse, setPagesResponse] = useState({});
  const [permissionPages, setPermissionPages] = useState([]);

  let obj = {};

  useEffect(() => {
    form.setFieldValue("name", detailedData?.name);
    form.setFieldValue("project", detailedData?.project);
    const array = detailedData?.project?.map((e) => {
      return handleChange({
        checked: true,
        value: e,
      });
    });
  }, [detailedData]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await imsAxios.get(
          "/user/permission/allPages?filtered=true"
        );
        if (response.status === 200) {
          const projectNames = Object.keys(response.data);

          const pages = response.data;
          const permissionselect = (data, e, type) => {
            if (e.target.checked) {
              if (obj.hasOwnProperty(data.id)) {
                if (obj[data.id].hasOwnProperty(type.toLowerCase())) {
                  obj[data.id][type.toLowerCase()] = e.target.checked;
                }
              } else {
                obj[data.id] = {
                  id: data.id,
                  create: type === "Create" ? e.target.checked : false,
                  read: type === "Read" ? e.target.checked : false,
                  update: type === "Update" ? e.target.checked : false,
                  delete: type === "Delete" ? e.target.checked : false,
                };
                permissionPages.push(obj);
              }
            } else {
              obj[data.id][type.toLowerCase()] = e.target.checked;

              if (
                obj[data.id].create === false &&
                obj[data.id].read === false &&
                obj[data.id].update === false &&
                obj[data.id].delete === false
              ) {
                permissionPages.length === 1
                  ? setPermissionPages([])
                  : delete obj[data.id];
              }
            }
          };
          const columns = [
            {
              headerName: "Pages",
              field: "name",
              width: 200,
              headerClassName: "header-background",
            },
            {
              headerName: "Create",
              field: "create",
              width: 60,
              headerClassName: "header-background",
              renderCell: ({ row }) => (
                <Checkbox
                  onChange={(e) => {
                    permissionselect(row, e, "Create");
                  }}
                ></Checkbox>
              ),
            },
            {
              headerName: "Read",
              field: "read",
              width: 60,
              headerClassName: "header-background",
              renderCell: ({ row }) => (
                <Checkbox
                  onChange={(e) => {
                    permissionselect(row, e, "Read");
                  }}
                ></Checkbox>
              ),
            },
            {
              headerName: "Update",
              field: "update",
              width: 60,
              headerClassName: "header-background",
              renderCell: ({ row }) => (
                <Checkbox
                  onChange={(e) => {
                    permissionselect(row, e, "Update");
                  }}
                ></Checkbox>
              ),
            },
            {
              headerName: "Delete",
              field: "delete",
              width: 60,
              headerClassName: "header-background",
              renderCell: ({ row }) => (
                <Checkbox
                  onChange={(e) => {
                    permissionselect(row, e, "Delete");
                  }}
                ></Checkbox>
              ),
            },
          ];

          let arr = projectNames.map((elem) => {
            let data = pages[elem].map((page) => {
              return {
                id: page.id,
                name: page.name,
              };
            });

            return {
              key: v4(),
              label: elem.toUpperCase(),
              children: (
                <>
                  <MyDataTable
                    style={{ height: "350px" }}
                    columns={columns}
                    data={data}
                  />
                </>
              ),
            };
          });

          setPages(arr);
          setProjectNames(projectNames);
          setPagesResponse(response.data);
        } else {
          toast.error(response.data);
        }
      } catch (error) {
        toast.error("Something went wrong, Please contact administrator");
      }
    };

    fetchPermissions();
  }, []);

  const getUserOptions = async (e) => {
    if (e?.length > 2) {
      setSelectLoading(true);
      const response = await imsAxios.post("/backend/fetchAllUser", {
        search: e,
      });
      setSelectLoading(false);
      let arr = response.data.map((elem) => ({
        text: elem.text,
        value: elem.id,
      }));
      setAsyncOptions(arr);
    }
  };
  // const handleChange = async (target) => {
  //   const targetValue = target.value.toUpperCase();
  //   if (target.checked) {
  //     let arr = pages.filter((elem) => {
  //       return elem.label === targetValue;
  //     });
  //     setFilteredPages([...filteredPages, ...arr]);
  //   } else {
  //     let arr = filteredPages.filter((elem) => {
  //       return elem.label !== targetValue;
  //     });

  //     let arr2 = pages.filter((elem) => {
  //       return elem.label === targetValue;
  //     });

  //     arr2.forEach((elem) => {
  //       const uncheckedProject = elem.label.toLowerCase();

  //       const uncheckedProjectData = pagesResponse[uncheckedProject];

  //       uncheckedProjectData?.map((elem) => {
  //         return permissionPages.pop(elem.id);
  //       });
  //     });

  //     setFilteredPages(arr);
  //   }
  // };

  const handleChange = async (target) => {
    const targetValue = target.value.toUpperCase();
    if (target.checked) {
      let arr = pages.filter((elem) => elem.label === targetValue);
      setFilteredPages((prevFilteredPages) => [...prevFilteredPages, ...arr]);
    } else {
      let arr = filteredPages.filter((elem) => elem.label !== targetValue);
      let arr2 = pages.filter((elem) => elem.label === targetValue);
      arr2.forEach((elem) => {
        const uncheckedProject = elem.label.toLowerCase();
        const uncheckedProjectData = pagesResponse[uncheckedProject];
        uncheckedProjectData?.forEach((elem) => {
          permissionPages.pop(elem.id);
        });
      });
      setFilteredPages(arr);
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();

    console.log("filteredPages--->", filteredPages);

    console.log("permissionPages--->", permissionPages);

    if (permissionPages.length === 0) {
      toast.error("Please select atleast one page");
      return;
    }

    let arr = permissionPages.map((elem, index) => {
      return Object.values(elem)[index];
    });

    try {
      const response = await imsAxios.post("/user/permission/addUser", {
        user: values.name,
        project: values.project,
        pages: arr,
      });

      if (response.status === 200) {
        toast.success(response.data);
        setFilteredPages([]);
        setPermissionPages([]);
        setDetailedData([]);
        form.resetFields();
        setIsModalOpen(false);
        getRows();
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      toast.error("Something went wrong, Please contact administrator");
    }
  };

  return (
    <Modal
      title="Add New User"
      open={isModalOpen}
      onCancel={() => {
        setFilteredPages([]);
        form.resetFields();
        setDetailedData([]);
        // setPermissionPages([]);
        setIsModalOpen(false);
      }}
      onOk={handleOk}
      width={550}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="User Name" name="name" rules={[{ required: true }]}>
          <MyAsyncSelect
            selectLoading={selectLoading}
            value={searchInput}
            onBlur={() => {
              setAsyncOptions([]);
            }}
            loadOptions={getUserOptions}
            onInputChange={(e) => setSearchInput(e)}
            onChange={setSearchInput}
            optionsState={asyncOptions}
            placeholder="Enter User Name"
            disabled={!detailedData.name ? "" : "disabled"}
          />
        </Form.Item>
        <Form.Item label="Project" name="project" rules={[{ required: true }]}>
          <Checkbox.Group>
            {projectNames.map((option) => (
              <Checkbox
                key={option}
                value={option}
                onChange={(e) => {
                  handleChange(e.target);
                }}
              >
                {option.toUpperCase()}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
        <Form.Item label="Permissions" name="permission">
          <Collapse items={filteredPages} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
