export interface MISType {
  department: string;
  shifts: {
    product: string;
    manPower: string;
    lineCount: string;
    output: string;
    date: string;
    shiftStart: string;
    shiftEnd: string;
    overTime: string;
    workingHours: string;
    remarks?: string;
  }[];
}
