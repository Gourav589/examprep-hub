import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "./Layout.css";

function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <Navbar onMenuClick={() => setOpen(true)} />

      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div
        className={"drawer-overlay" + (open ? " show" : "")}
        onClick={() => setOpen(false)}
      />

      {children}
      <Footer />
    </>
  );
}

export default Layout;