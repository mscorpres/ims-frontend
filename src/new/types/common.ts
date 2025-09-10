// Common types for the new UI

export interface User {
  id: string;
  name: string;
  email: string;
  type: "user" | "developer" | "admin";
  company_branch?: string;
  session?: string;
  showlegal?: boolean;
  favPages?: Array<{
    page_id: string;
    url: string;
    page_name: string;
  }>;
  passwordChanged?: "P" | "C";
  token?: string;
}

export interface Notification {
  ID: string;
  type: string;
  title: string;
  details: string;
  message?: string;
  file?: string;
  loading?: boolean;
  status?: "pending" | "completed" | "error";
  notificationId?: string;
  conversationId?: string;
}

export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  label: React.ReactNode;
}

export interface ApiResponse<T = any> {
  code: number;
  message: {
    msg: string;
  };
  data: T;
}

export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  render?: (value: any, record: any) => React.ReactNode;
}

export interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon?: React.ReactNode;
}

export interface SidebarProps {
  showSideBar: boolean;
  setShowSideBar: (show: boolean) => void;
  user: User;
  setShowTickets: (show: boolean) => void;
}

export interface HeaderProps {
  user: User;
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  showTickets: boolean;
  setShowTickets: (show: boolean) => void;
  showSetting: boolean;
  setShowSetting: (show: boolean) => void;
}
