import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { BookingPage } from './pages/BookingPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { BillingPage } from './pages/BillingPage';
import { AccessPage } from './pages/AccessPage';
import { MeetingPackagePage } from './pages/MeetingPackagePage';
import { AgreementsPage } from './pages/AgreementsPage';
import { VisitorsPage } from './pages/VisitorsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CommunityPage } from './pages/CommunityPage';
import { OperatorBillingPage } from './pages/OperatorBillingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/access" element={<AccessPage />} />
          <Route path="/meeting-package" element={<MeetingPackagePage />} />
          <Route path="/agreements" element={<AgreementsPage />} />
          <Route path="/visitors" element={<VisitorsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/operator-billing" element={<OperatorBillingPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
