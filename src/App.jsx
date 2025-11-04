import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import { ToastContainer } from "react-toastify";
import { Helmet, HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <>
        {/* SEO uchun asosiy meta teglar */}
        <Helmet>
          <title>
            PDP Education | Onlayn imtihon tizimi va baholash platformasi
          </title>
          <meta
            name="description"
            content="PDP Education — o‘quvchilar uchun onlayn imtihon topshirish, ballarni ko‘rish va ustozlar tomonidan baholash imkoniyatini beruvchi platforma."
          />
          <meta
            name="keywords"
            content="PDP, Education, imtihon, baholash tizimi, o‘quvchilar, ustozlar, test, ball, natija, onlayn ta'lim"
          />
          <meta name="robots" content="index, follow" />
          <meta
            property="og:title"
            content="PDP Education | Onlayn imtihon tizimi"
          />
          <meta
            property="og:description"
            content="O‘quvchilar uchun imtihon topshirish, ballarni ko‘rish va ustozlar baholashi mumkin bo‘lgan zamonaviy platforma."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://pdp-edu.netlify.app/" />
          <meta
            property="og:image"
            content="https://pdp-edu.netlify.app/preview.png"
          />
        </Helmet>

        {/* Asosiy Router */}
        <RouterProvider router={router} />

        {/* Toastlar */}
        <ToastContainer autoClose={2000} />
      </>
    </HelmetProvider>
  );
}

export default App;
