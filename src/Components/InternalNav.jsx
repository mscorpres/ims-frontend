import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Col, Menu, Row, Tooltip, Typography } from "antd";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux/es/exports";
import internalLinks from "../Pages/internalLinks";

export default function InternalNav({
  // links,
  placeholder,
  menuWidth,
  additional,
}) {
  const { currentLinks: links } = useSelector((state) => state.login);
  const { pathname } = useLocation();
  const [linksList, setLinksList] = useState([]);
  const [current, setCurrent] = useState("");
  const navigate = useNavigate();
  const onClick = (e) => {
    setCurrent(e.key);
  };
  useEffect(() => {
    let key =
      linksList &&
      linksList
        ?.filter((link) => link.routePath == pathname)[0]
        ?.key.toString();

    setCurrent(key);
  }, [linksList]);
  // console.log(links);
  // useEffect(() => {
  //   if (links) {
  //     let arr = links?.map((link, index) => {
  //       return {
  //         ...link,
  //         key: index,
  //       };
  //     });
  //     setLinksList(arr);
  //   }
  // }, [links]);
  useEffect(() => {
    let arr = [];
    internalLinks.map((group) => {
      let matched = false;
      if (group.filter((link) => link.routePath == pathname)[0]) {
        arr = group;
      }
    });
    let current = arr.filter((row) => row.routePath === pathname)[0];

    if (current) {
      document.title = "IMS | " + current.routeName;
    } else {
      document.title = "IMS";
    }
    arr = arr?.map((link, index) => {
      return {
        ...link,
        key: index,
      };
    });
    setLinksList(arr);

    // console.log(arr);
  }, [navigate]);
  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      size="small"
      mode="horizontal"
      style={{
        marginBottom: 8,
        width: "100%",
        background: "white",
        // background: "rgb(235, 235, 235)",
      }}
      items={
        linksList &&
        linksList?.map((link, index) => ({
          key: link.key.toString(),
          label: (
            <Tooltip
              placement="bottomLeft"
              overlayStyle={{ fontSize: "0.7rem", color: "white" }}
              color="#245181"
              title={link.placeholder && link.placeholder}
            >
              <Link to={link.routePath}>
                <span>{link.routeName}</span>
                <span style={{ marginLeft: 5 }}>
                  {pathname == link.routePath && link.placeholder}
                </span>
              </Link>
            </Tooltip>
          ),
        }))
      }
    />
  );
}
