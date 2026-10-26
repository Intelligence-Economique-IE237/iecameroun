import { useEffect, useRef, useState } from "react";

const RevealOnScroll = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.15,
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{
                transitionDelay: `${delay}ms`,
            }}
            className={`
        transition-all duration-700 ease-out
        ${
                visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
            }
      `}
        >
            {children}
        </div>
    );
};

export default RevealOnScroll;