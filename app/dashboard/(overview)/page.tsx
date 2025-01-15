import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
// import query functions, removed after we streamed/suspensed data in components
// import { fetchCardData } from '@/app/lib/data';
// import suspense for streaming data fetch timing
import { Suspense } from 'react';
// import skeletons to show better UI for loading
import CardWrapper from '@/app/ui/dashboard/cards';
import { 
  RevenueChartSkeleton, 
  LatestInvoicesSkeleton,
  CardsSkeleton,
 } from '@/app/ui/skeletons';
 import { Metadata } from 'next';


export const metadata: Metadata = {
  // title: 'Invoices | Acme Dashboard',
  title: 'Dashboard',
};

export default async function Page() {
  // comment out getting data here to streaming fetchRevenue, fetchLatestInvoices, in components 
  // to optimize load time with <Suspense> below

  // const revenue = await fetchRevenue();
  // const latestInvoices = await fetchLatestInvoices();
  // const { 
  //   totalPaidInvoices,
  //   totalPendingInvoices, 
  //   numberOfInvoices,
  //   numberOfCustomers,
  //  } = await fetchCardData();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        /> */}
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* Suspense here for streaming/data fetching*/}
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />} >
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}