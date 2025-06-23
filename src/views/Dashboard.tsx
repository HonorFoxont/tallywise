import { Sidebar } from "@/components/Sidebar";

const Dashboard = () => {
  return ( <div className="flex">
    <Sidebar />
    <div>This is main content.</div>
  </div> );
}
export default Dashboard;