import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import useScrollEngine from './hooks/useScrollEngine';
import useVisitorTracker from './hooks/useVisitorTracker';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Sell = lazy(() => import('./pages/Sell'));
const TradeLoan = lazy(() => import('./pages/TradeLoan'));
const Exchange = lazy(() => import('./pages/Exchange'));
const About = lazy(() => import('./pages/About'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'));
const Faq = lazy(() => import('./pages/Faq'));
const NotFound = lazy(() => import('./pages/NotFound'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Account = lazy(() => import('./pages/Account'));
const Accounts = lazy(() => import('./pages/Accounts'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <main style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>Loading account...</main>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);
  return null;
}

function App() {
  const { pathname } = useLocation();
  useScrollEngine(pathname);
  useVisitorTracker();

  return (
    <>
      <ScrollToTop />
      <Header />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/brands" element={<Navigate to="/shop" replace />} />
          <Route path="/new-arrivals" element={<Navigate to="/shop" replace />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/trade" element={<TradeLoan />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/about" element={<About />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route
            path="/account"
            element={(
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            )}
          />
          <Route path="/faq" element={<Faq />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
