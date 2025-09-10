import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes.jsx'; // Router sozlamasini alohida faylda yaratamiz

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
