export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  createdAt: Date;
}

export interface Purpose {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  joinedAt: Date;
}
