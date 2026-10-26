import { useEffect, useState, useRef } from "react";

const CountUp = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [start, setStart] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStart(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.5,
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);


    useEffect(() => {
        if (!start) return;

        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;

            const progress = Math.min(
                (timestamp - startTime) / duration,
                1
            );

            setCount(Math.floor(progress * value));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(value);
            }
        };

        requestAnimationFrame(animate);

    }, [start, value, duration]);


    return (
        <span ref={ref}>
      {count}
    </span>
    );
};

export default CountUp;