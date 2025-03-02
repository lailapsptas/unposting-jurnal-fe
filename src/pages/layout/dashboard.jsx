import { useState, useEffect } from "react";
import Layout from "../../components/layout/layout";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000 * 60);

    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      <div className="dashboard-container">
        <Card className="dashboard-card info-card">
          <h2 className="dashboard-title">Information</h2>
          <div className="p-4">{/* Add your information content here */}</div>
        </Card>

        <Card className="dashboard-card calendar-card">
          <h2 className="dashboard-title">Calendar</h2>
          <div className="calendar-wrapper">
            <Calendar
              value={date}
              onChange={(e) => setDate(e.value)}
              inline
              showWeek={false}
              className="custom-calendar"
            />
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
