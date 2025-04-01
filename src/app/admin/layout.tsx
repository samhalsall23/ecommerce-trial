import { Nav, NavLink } from "@/components/Nav";

export const dynamic = "force-dynamic";
// force next to not cache any of the admin pages since we want most up to date

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/customers">Customers</NavLink>
        <NavLink href="/admin/orders">Sales</NavLink>
      </Nav>
      <div className="container m-6">{children}</div>
    </>
  );
}
