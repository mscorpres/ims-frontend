import { useState,useEffect } from "react";
import { v4 } from "uuid";
import { Tree as AntdTree } from "antd";

export default function Tree({ subGroups }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    setData(subGroups ?? []);
  }, [subGroups]);

  const flatArray = (array) => {
    let arr = [];
    array?.map((row) => {
      if (row.nodes || row.children) {
        // delete row.nodes;]
        row.children = row.nodes;
        row.title = row.label;
        row.key = v4();
        arr = [...arr, { ...row }];
        flatArray(row.children);
      } else {
        row.title = row.label;
        row.key = v4();
        arr = [...arr, { ...row }];
      }
    });
    setData(arr);
  };
  useEffect(() => {
    if (subGroups.length > 0) flatArray(subGroups);
  }, []);
  return (
    <div style={{ height: 100 }}>
      <AntdTree
        showLine={true}
        height={200}
        // showIcon={showIcon}
        // defaultExpandedKeys={["0-0-0"]}
        // onSelect={onSelect}
        treeData={data}
      />
    </div>
  );
}
