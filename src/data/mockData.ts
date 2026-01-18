import { Customer, Purpose, Staff } from "@/types";

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    email: "rajesh@email.com",
    address: "123 MG Road",
    city: "Mumbai",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Priya Sharma",
    phone: "+91 87654 32109",
    email: "priya@email.com",
    address: "456 Park Street",
    city: "Delhi",
    createdAt: new Date("2024-01-18"),
  },
  {
    id: "3",
    name: "Amit Patel",
    phone: "+91 76543 21098",
    email: "amit@email.com",
    address: "789 Lake View",
    city: "Ahmedabad",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "4",
    name: "Sneha Reddy",
    phone: "+91 65432 10987",
    email: "sneha@email.com",
    address: "321 Hill Road",
    city: "Hyderabad",
    createdAt: new Date("2024-01-22"),
  },
  {
    id: "5",
    name: "Vikram Singh",
    phone: "+91 54321 09876",
    email: "vikram@email.com",
    address: "654 Main Street",
    city: "Jaipur",
    createdAt: new Date("2024-01-25"),
  },
];

export const mockPurposes: Purpose[] = [
  {
    id: "1",
    name: "Wedding Collection",
    description: "Jewellery items for wedding ceremonies",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    name: "Daily Wear",
    description: "Lightweight jewellery for everyday use",
    createdAt: new Date("2024-01-12"),
  },
  {
    id: "3",
    name: "Festival Special",
    description: "Special collections for festivals",
    createdAt: new Date("2024-01-14"),
  },
  {
    id: "4",
    name: "Investment",
    description: "Gold and diamond pieces for investment",
    createdAt: new Date("2024-01-16"),
  },
];

export const mockStaff: Staff[] = [
  {
    id: "1",
    name: "Suresh Mehta",
    phone: "+91 99887 76655",
    email: "suresh@pawan.com",
    role: "Manager",
    joinedAt: new Date("2023-06-15"),
  },
  {
    id: "2",
    name: "Anita Verma",
    phone: "+91 88776 65544",
    email: "anita@pawan.com",
    role: "Sales Executive",
    joinedAt: new Date("2023-08-20"),
  },
  {
    id: "3",
    name: "Kiran Das",
    phone: "+91 77665 54433",
    email: "kiran@pawan.com",
    role: "Accountant",
    joinedAt: new Date("2023-10-10"),
  },
  {
    id: "4",
    name: "Rahul Gupta",
    phone: "+91 66554 43322",
    email: "rahul@pawan.com",
    role: "Sales Executive",
    joinedAt: new Date("2024-01-05"),
  },
];
