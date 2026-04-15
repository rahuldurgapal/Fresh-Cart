import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };
    
    // Fire immediately then catch any delayed browser restorations 
    handleScroll();
    setTimeout(handleScroll, 10);
    setTimeout(handleScroll, 50);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
