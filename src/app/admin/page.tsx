import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/formatters";

import { prisma } from "@/lib/prisma";

async function getSalesData() {
  const data = await prisma.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });

  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { pricePaidInCents: true },
      _count: true,
    }),
  ]);

  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

export default async function AdminDashboard() {
  const [salesData, userData] = await Promise.all([
    getSalesData(),
    getUserData(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Sales"
        subtitle={salesData.numberOfSales.toString()}
        body={salesData.amount.toString()}
      />
      <DashboardCard
        title="Customer"
        subtitle={`${formatNumber(userData.averageValuePerUser)}`}
        body={`${formatCurrency(salesData.amount)}`}
      />
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}
