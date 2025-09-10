import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes.jsx'; // Router sozlamasini alohida faylda yaratamiz
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;
