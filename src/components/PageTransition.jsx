import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
            staggerChildren: 0.08,
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

const childVariants = {
    initial: {
        opacity: 0,
        y: 15,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

export function PageTransition({ children, className = '' }) {
    return (
        <motion.div
            className={`page-transition ${className}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {children}
        </motion.div>
    );
}

export function AnimatedChild({ children, className = '' }) {
    return (
        <motion.div variants={childVariants} className={className}>
            {children}
        </motion.div>
    );
}

export default PageTransition;
