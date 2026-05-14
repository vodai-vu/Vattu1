export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  visibleColumns: { [key: string]: boolean };
}

export interface Equipment {
  id: string;
  name: string;
  images: string[];
  model: string;
  manufacturer: string;
  country: string;
  yearOfManufacture: string;
  yearOfUse: string;
  quantity: number;
  valuePercentage: number;
  status: string;
  source: string;
  note: string;
  department: string;
  departmentNote: string;
  originalPrice: number;
  totalValue: number;
  handoverDate: string;
  supplier: string;
  repairHistory: string;
  bookNumber: string;
  pageNumber: string;
  deleted?: boolean;
}

export interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  completed: boolean;
}

export interface Department {
  id: string;
  name: string;
  location: string;
  phone: string;
}

export interface Personnel {
  id: string;
  name: string;
  phone: string;
  address: string;
  jobTitle: string;
  note: string;
  username: string;
  status: 'active' | 'locked';
  role: UserRole;
  image?: string;
  department: string;
}

export interface FanType {
  id: string;
  name: string;
  type: string;
  specs: string;
}

export interface FanManagement {
  id: string;
  department: string;
  fanTypeName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: string;
  location: string;
  note: string;
}

export interface ACType {
  id: string;
  name: string;
  type: string;
  specs: string;
}

export interface ACManagement {
  id: string;
  department: string;
  acTypeName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: string;
  location: string;
  note: string;
}

export interface Generator {
  id: string;
  name: string;
  type: string;
  specs: string;
  location: string;
  powerSupplyTo: string;
  calculations: string;
}

export interface DutyMember {
  id: string;
  name: string;
  phone: string;
  group: string;
  turn: string;
}

export interface DutySchedule {
  id: string;
  date: string; // ISO string
  userId: string;
  userName: string;
  group: string;
  turn: string;
  isHoliday?: boolean;
  holidayType?: 'normal' | 'tet';
}
