import React, { useState, useEffect } from 'react'
import Sidebar from './Components/Sidebar/Sidebar'
import Main from './Components/Main/Main'
import './App.css'

const App = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarVisible, setSidebarVisible] = useState(false); // Hidden by default on mobile
    useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarVisible(true);
      else setSidebarVisible(false);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className={`app-container ${sidebarVisible && isMobile ? 'sidebar-active' : ''}`}>
      {sidebarVisible && <Sidebar closeSidebar={() => setSidebarVisible(false)} />}
      <Main toggleSidebar={toggleSidebar} isMobileView={isMobile} sidebarVisible={sidebarVisible} />
      
      {sidebarVisible && isMobile && (
        <div className="sidebar-overlay" onClick={() => setSidebarVisible(false)}></div>
      )}
    </div>
  )
}

export default App