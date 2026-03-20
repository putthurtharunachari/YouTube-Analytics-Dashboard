import React from 'react';
import { motion } from 'framer-motion';

const Blob = ({ color, size, initialPos, duration, delay }) => {
    return (
        <motion.div
            className={`absolute rounded-full blur-[20px] opacity-80 dark:opacity-90 pointer-events-none`}
            style={{
                backgroundColor: color,
                width: size,
                height: size,
                left: initialPos.x,
                top: initialPos.y,
                willChange: "transform",
                transform: "translateZ(0)",
            }}
            animate={{
                x: [0, 60, -50, 0],
                y: [0, -70, 80, 0],
                scale: [1, 1.15, 0.85, 1],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear"
            }}
        />
    );
};

const BackgroundBlobs = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-background">
            {/* Dark Mode Blobs (Neon/Vibrant) */}
            <div className="hidden dark:block h-full w-full relative">
                <Blob
                    color="#3b82f6"
                    size="35vw"
                    initialPos={{ x: '-10%', y: '-10%' }}
                    duration={25}
                    delay={0}
                />
                <Blob
                    color="#8b5cf6"
                    size="30vw"
                    initialPos={{ x: '75%', y: '15%' }}
                    duration={30}
                    delay={2}
                />
                <Blob
                    color="#ec4899"
                    size="25vw"
                    initialPos={{ x: '15%', y: '65%' }}
                    duration={22}
                    delay={5}
                />
                <Blob
                    color="#06b6d4"
                    size="40vw"
                    initialPos={{ x: '65%', y: '75%' }}
                    duration={35}
                    delay={1}
                />
            </div>

            {/* Light Mode Blobs (Highly Visible Pastels) */}
            <div className="block dark:hidden h-full w-full relative">
                <Blob
                    color="#93c5fd"
                    size="40vw"
                    initialPos={{ x: '-5%', y: '10%' }}
                    duration={28}
                    delay={0}
                />
                <Blob
                    color="#c4b5fd"
                    size="35vw"
                    initialPos={{ x: '70%', y: '20%' }}
                    duration={32}
                    delay={3}
                />
                <Blob
                    color="#f9a8d4"
                    size="30vw"
                    initialPos={{ x: '20%', y: '60%' }}
                    duration={26}
                    delay={4}
                />
                <Blob
                    color="#67e8f9"
                    size="38vw"
                    initialPos={{ x: '60%', y: '70%' }}
                    duration={38}
                    delay={2}
                />
            </div>

            {/* High Contrast Overlay instead of Blur */}
            <div className="absolute inset-0 bg-background/30 z-0" />

            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-noise opacity-[0.05] dark:opacity-[0.03] z-10" />
        </div>
    );
};

export default BackgroundBlobs;
