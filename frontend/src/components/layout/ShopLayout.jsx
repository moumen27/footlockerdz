import { Outlet } from 'react-router-dom';
import { Header } from './Header';
// import { Footer } from './Footer';

export const ShopLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-20 lg:pb-0">
        {/* pt-24 pour compenser la fixed navbar */}
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
};
