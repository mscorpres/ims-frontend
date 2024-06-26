export interface RowType {
  stock: {
    opening: string | number;
    closing: string | number;
    name: string;
    owner: string;
    address: string;
  }[];
  total: {
    opening: string | number;
    closing: string | number;
  };
}
