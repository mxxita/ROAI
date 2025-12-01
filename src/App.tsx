import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EventLogs from './pages/EventLogs';
import ProcessMap from './pages/ProcessMap';
import UserSegments from './pages/UserSegments';
import Interviews from './pages/Interviews';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/event-logs" element={<EventLogs />} />
                <Route path="/process-map" element={<ProcessMap />} />
                <Route path="/user-segments" element={<UserSegments />} />
                <Route path="/interviews" element={<Interviews />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
