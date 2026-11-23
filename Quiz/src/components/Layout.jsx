import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import OfferBanner from "./OfferBanner";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import WelcomePopup from "./WelcomePopup";
import "./Layout.css";

function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <OfferBanner />
      <Navbar onMenuClick={() => setOpen(true)} />

      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div
        className={"drawer-overlay" + (open ? " show" : "")}
        onClick={() => setOpen(false)}
      />

      {children}
      <Footer />

      <WelcomePopup />
    </>
  );
}

export default Layout;