
import React from "react";
import { BsFillHddStackFill } from "react-icons/bs";
import { ImCart } from "react-icons/im";
import { MdAccountBox, MdDashboard, MdQueryStats } from "react-icons/md";
import {
  IoBookSharp,
  IoFileTrayStacked,
  IoJournalSharp,
} from "react-icons/io5";
import {
  StarFilled,
  StarOutlined,
  MenuOutlined,
  UserOutlined,
  CalculatorFilled,
  FormOutlined,
  AlignRightOutlined,
  CustomerServiceOutlined,
  UnorderedListOutlined,
  DeploymentUnitOutlined,
  DeliveredProcedureOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { RiBillFill } from "react-icons/ri";
import { BiMoney, BiTransfer } from "react-icons/bi";
import { FaWarehouse } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { SiPaytm } from "react-icons/si";
import FileDownloadIcon from '@mui/icons-material/FileDownload';// Default icon for items without specific icons
import AutorenewIcon from '@mui/icons-material/Autorenew';

const DefaultIcon = () => <MenuOutlined />;

// Icon mapping object
const iconMap= {
  // React Icons
  BsFillHddStackFill: BsFillHddStackFill,
  ImCart: ImCart,
  MdAccountBox: MdAccountBox,
  MdDashboard: MdDashboard,
  MdQueryStats: MdQueryStats,
  IoBookSharp: IoBookSharp,
  IoFileTrayStacked: IoFileTrayStacked,
  IoJournalSharp: IoJournalSharp,
  RiBillFill: RiBillFill,
  BiMoney: BiMoney,
  BiTransfer: BiTransfer,
  FaWarehouse: FaWarehouse,
  TbReportAnalytics: TbReportAnalytics,
  SiPaytm: SiPaytm,

  // Ant Design Icons
  StarFilled: StarFilled,
  StarOutlined: StarOutlined,
  MenuOutlined: MenuOutlined,
  UserOutlined: UserOutlined,
  CalculatorFilled: CalculatorFilled,
  FormOutlined: FormOutlined,
  AlignRightOutlined: AlignRightOutlined,
  CustomerServiceOutlined: CustomerServiceOutlined,
  UnorderedListOutlined: UnorderedListOutlined,
  DeploymentUnitOutlined: DeploymentUnitOutlined,
  DeliveredProcedureOutlined: DeliveredProcedureOutlined,
  CheckCircleOutlined: CheckCircleOutlined,
  ExperimentOutlined: ExperimentOutlined,
  PlusIcon: PlusOutlined,
  UploadIcon: UploadOutlined,

  // Material-UI Icons (as fallbacks)
  SettingsIcon: MenuOutlined,
  ReceiptIcon: FormOutlined,
  ListAltIcon: UnorderedListOutlined,
  BookIcon: FormOutlined,
  SwapHorizIcon: BiTransfer,
  PaymentIcon: CalculatorFilled,
  AccountBalanceIcon: CalculatorFilled,
  AttachMoneyIcon: BiMoney,
  MonetizationOnIcon: BiMoney,
  AssessmentIcon: TbReportAnalytics,
  BalanceIcon: CalculatorFilled,
  TableChartIcon: TbReportAnalytics,
  TrendingUpIcon: TbReportAnalytics,
  TodayIcon: MenuOutlined,
  ScheduleIcon: MenuOutlined,
  DescriptionIcon: FormOutlined,
  AnalyticsIcon: TbReportAnalytics,
  ReceiptLongIcon: FormOutlined,
  MoreHorizIcon: MenuOutlined,
  CompareArrowsIcon: BiTransfer,
  NoteIcon: FormOutlined,
  GavelIcon: MenuOutlined,
  AddIcon: MenuOutlined,
  CheckCircleIcon: CheckCircleOutlined,
  SummarizeIcon: TbReportAnalytics,
  VisibilityIcon: EyeOutlined,
  CalculateIcon: CalculatorFilled,
  StraightenIcon: MenuOutlined,
  ExtensionIcon: MenuOutlined,
  InventoryIcon: FaWarehouse,
  BuildIcon: MenuOutlined,
  CategoryIcon: MenuOutlined,
  MapIcon: MenuOutlined,
  LocationOnIcon: MenuOutlined,
  GroupIcon: MenuOutlined,
  HomeIcon: MenuOutlined,
  LocalShippingIcon: MenuOutlined,
  ListIcon: UnorderedListOutlined,
  BusinessIcon: MenuOutlined,
  PersonAddIcon: UserOutlined,
  PeopleIcon: UserOutlined,
  WorkIcon: MenuOutlined,
  AddShoppingCartIcon: ImCart,
  ManageAccountsIcon: UserOutlined,
  ApprovalIcon: CheckCircleOutlined,
  InputIcon: MenuOutlined,
  UndoIcon: MenuOutlined,
  EditIcon: FormOutlined,
  PendingIcon: MenuOutlined,
  OutputIcon: MenuOutlined,
  ReturnIcon: MenuOutlined,
  BlockIcon: MenuOutlined,
  UpdateIcon: MenuOutlined,
  DeleteIcon: MenuOutlined,
  SecurityIcon: MenuOutlined,
  TransformIcon: MenuOutlined,
  AuditIcon: TbReportAnalytics,
  PrintIcon: FormOutlined,
  HelpIcon: MenuOutlined,
  RequestQuoteIcon: FormOutlined,
  PatternIcon: MenuOutlined,
  WebIcon: MenuOutlined,
  InboxIcon: MenuOutlined,
  ErrorIcon: MenuOutlined,
  GroupWorkIcon: MenuOutlined,
  DashboardIcon: MdDashboard,
  PublicIcon: MenuOutlined,
  BarChartIcon: TbReportAnalytics,
  DownloadIcon: FileDownloadIcon,
  ResetIcon: AutorenewIcon,
};

// Function to get icon component
export const getIcon = (iconName) => {
  if (!iconName) {
    return DefaultIcon;
  }

  const IconComponent = iconMap[iconName];
  return IconComponent || DefaultIcon;
};

// Function to render icon with proper props
export const renderIcon = (iconName, props) => {
  const IconComponent = getIcon(iconName);
  return <IconComponent {...props} />;
};

export default iconMap;
