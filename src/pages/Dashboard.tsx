import { Users, Target, UserPlus, TrendingUp, IndianRupee, Calendar } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { analyticsApi, purposeApi, customerApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
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

const Dashboard = () => {
  // Fetch analytics - last 7 days
  const { data: lastNDaysData } = useQuery({
    queryKey: ["analytics", "lastNDays"],
    queryFn: () => analyticsApi.getLastNDays(7),
    retry: 1,
  });

  // Fetch staff analytics
  const { data: staffCountData } = useQuery({
    queryKey: ["analytics", "staffCount"],
    queryFn: () => analyticsApi.getStaffCount(30),
    retry: 1,
  });

  // Fetch purposes count
  const { data: purposesData } = useQuery({
    queryKey: ["purposes"],
    queryFn: () => purposeApi.getAll(),
    retry: 1,
  });

  // Fetch customers for total count
  const { data: customersData } = useQuery({
    queryKey: ["customers", 1],
    queryFn: () => customerApi.getAll(1, 1),
    retry: 1,
  });

  const salesData = lastNDaysData?.data?.map((d) => ({
    date: d.date.slice(5), // MM-DD format
    count: d.count,
  })).reverse() || [];

  const staffData = staffCountData?.data?.slice(0, 5) || [];

  const totalCustomers = customersData?.total_records || 0;
  const totalPurposes = purposesData?.count || 0;
  const totalStaff = staffData.length || 0;
  
  // Calculate today's customers
  const todayCount = lastNDaysData?.data?.[0]?.count || 0;

  // Recent customers from first page
  const { data: recentCustomersData } = useQuery({
    queryKey: ["customers", "recent"],
    queryFn: () => customerApi.getAll(1, 5),
    retry: 1,
  });

  const recentCustomers = recentCustomersData?.data || [];

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
          value={totalCustomers}
          subtitle="Active customers"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Today's Additions"
          value={todayCount}
          subtitle="New customers today"
          icon={Calendar}
        />
        <StatCard
          title="Purposes"
          value={totalPurposes}
          subtitle="Categories available"
          icon={Target}
        />
        <StatCard
          title="Active Staff"
          value={totalStaff}
          subtitle="Team members"
          icon={UserPlus}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Customer Trend Chart */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Customer Trend (Last 7 Days)
          </h3>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 8%, 18%)" />
                <XAxis dataKey="date" stroke="hsl(40, 10%, 55%)" />
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
                  dataKey="count"
                  stroke="hsl(43, 74%, 49%)"
                  fill="url(#salesGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No data available. Connect to API.
            </div>
          )}
        </div>

        {/* Staff Performance */}
        <div className="card-premium p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Staff Performance (Last 30 Days)
          </h3>
          {staffData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={staffData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 8%, 18%)" />
                <XAxis type="number" stroke="hsl(40, 10%, 55%)" />
                <YAxis dataKey="staff_name" type="category" stroke="hsl(40, 10%, 55%)" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(30, 8%, 10%)",
                    border: "1px solid hsl(30, 8%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(40, 20%, 95%)",
                  }}
                />
                <Bar dataKey="customer_count" fill="hsl(43, 74%, 49%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No staff data available. Connect to API.
            </div>
          )}
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
                <th>Mobile</th>
                <th>Address</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentCustomers.length > 0 ? (
                recentCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="font-medium text-foreground">{customer.name}</td>
                    <td className="text-muted-foreground">{customer.mob_no}</td>
                    <td className="text-muted-foreground">{customer.address}</td>
                    <td className="text-muted-foreground">{customer.joining_date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted-foreground py-8">
                    No customers yet. Connect to API to see data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
