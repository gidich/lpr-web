import { Routes, Route } from 'react-router-dom';
import { Root } from './components/layouts/root';
import './App.css';

export const App : React.FC =() => {
  return (
    <Routes>
      <Route path="*" element={<Root />} />
    </Routes>
  )
}