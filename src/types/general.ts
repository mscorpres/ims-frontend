export interface ResponseType {
  data: any | null;
  success: boolean;
  message?: string | null;
  error?: boolean;
  status?: number;
}
export interface SelectOptionType {
  text: string | number | boolean;
  value: string | number | boolean;
}

export interface SelectOptionType1 {
  label: string;
  value: string;
}

export interface ModalType {
  show: boolean;
  hide: () => void;
  submitHandler?: () => void;
  loading?: boolean;
}
