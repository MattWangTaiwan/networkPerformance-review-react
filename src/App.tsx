import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Report from './pages/Report';
import List from './pages/List';

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <MainLayout></MainLayout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/report' element={<Report />} />
          <Route path='/list' element={<List />} />
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
