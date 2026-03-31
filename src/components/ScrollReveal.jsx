import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function ScrollReveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    className = '',
    once = true,
}) {
    const ref = useRef(null);
    const controls = useAnimation();
    const [hasAnimated, setHasAnimated] = useState(false);

    const directionMap = {
        up: { y: 30, x: 0 },
        down: { y: -30, x: 0 },
        left: { x: 30, y: 0 },
        right: { x: -30, y: 0 },
    };

    const offset = directionMap[direction] || directionMap.up;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !(once && hasAnimated)) {
                    controls.start({
                        opacity: 1,
                        x: 0,
                        y: 0,
                        transition: {
                            duration,
                            delay,
                            ease: [0.4, 0, 0.2, 1],
                        },
                    });
                    setHasAnimated(true);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [controls, delay, duration, hasAnimated, once]);

    return (
        <motion.div
            ref={ref}
            animate={controls}
            initial={{ opacity: 0, ...offset }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
