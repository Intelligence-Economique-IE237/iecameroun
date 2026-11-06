import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

// Fait apparaître son contenu en douceur quand il entre dans l'écran (une seule fois).
// delay en ms pour décaler les éléments d'une même grille.
const RevealOnScroll = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
      <div
          ref={ref}
          style={delay ? { transitionDelay: `${delay}ms` } : undefined}
          className={`revele ${visible ? "revele--visible" : ""} ${className}`}
      >
        {children}
      </div>
  );
};

RevealOnScroll.propTypes = {
  children: PropTypes.node,
  delay: PropTypes.number,
  className: PropTypes.string,
};

export default RevealOnScroll;
