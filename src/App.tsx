import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { RoamlyProvider } from './context/RoamlyContext';
import { Navbar } from './components/Navbar';
import { BottomNavigation } from './components/BottomNavigation';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ToastContainer } from './components/ToastContainer';
import { Splash } from './pages/Splash';
import { Discover } from './pages/Discover';
import { Explore } from './pages/Explore';
import { DestinationDetails } from './pages/DestinationDetails';
import { TripPlanner } from './pages/TripPlanner';
import { SavedTrips } from './pages/SavedTrips';
import { Profile } from './pages/Profile';

function AppShell() {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const isSplash = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9F3] text-[#172B3A]">
      {!isSplash && <Navbar onOpenNotifications={() => setNotifOpen(true)} />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/destination/:id" element={<DestinationDetails />} />
          <Route path="/planner" element={<TripPlanner />} />
          <Route path="/saved" element={<SavedTrips />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/discover" replace />} />
        </Routes>
      </main>

      {!isSplash && <BottomNavigation />}

      <AuthModal />
      <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RoamlyProvider>
        <AppShell />
      </RoamlyProvider>
    </BrowserRouter>
  );
}
