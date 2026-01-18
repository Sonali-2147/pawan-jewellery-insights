import { Users, Target, UserPlus, TrendingUp, ShoppingBag, IndianRupee } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { mockCustomers, mockPurposes, mockStaff } from "@/data/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const salesData = [
  { month: "Jan", sales: 4500 },
  { month: "Feb", sales: 5200 },
  { month: "Mar", sales: 4800 },
  { month: "Apr", sales: 6100 },
  { month: "May", sales: 5500 },
  { month: "Jun", sales: 7200 },
];

const purposeData = [
  { name: "Wedding", value: 45 },
  { name: "Daily Wear", value: 30 },
  { name: "Festival", value: 15 },
  { name: "Investment", value: 10 },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={mockCustomers.length}
          subtitle="Active customers"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Purposes"
          value={mockPurposes.length}
          subtitle="Categories available"
          icon={Target}
        />
        <StatCard
          title="Staff Members"
          value={mockStaff.length}
          subtitle="Active employees"
          icon={UserPlus}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Monthly Revenue"
          value="₹7.2L"
          subtitle="This month"
          icon={IndianRupee}
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Sales Overview
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 8%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(40, 10%, 55%)" />
              <YAxis stroke="hsl(40, 10%, 55%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(30, 8%, 10%)",
                  border: "1px solid hsl(30, 8%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(40, 20%, 95%)",
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(43, 74%, 49%)"
                fill="url(#salesGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Purpose Distribution */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Purpose Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={purposeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 8%, 18%)" />
              <XAxis type="number" stroke="hsl(40, 10%, 55%)" />
              <YAxis dataKey="name" type="category" stroke="hsl(40, 10%, 55%)" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(30, 8%, 10%)",
                  border: "1px solid hsl(30, 8%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(40, 20%, 95%)",
                }}
              />
              <Bar dataKey="value" fill="hsl(43, 74%, 49%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Recent Customers
        </h3>
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>City</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.slice(0, 5).map((customer) => (
                <tr key={customer.id}>
                  <td className="font-medium text-foreground">{customer.name}</td>
                  <td className="text-muted-foreground">{customer.phone}</td>
                  <td className="text-muted-foreground">{customer.city}</td>
                  <td className="text-muted-foreground">
                    {customer.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
