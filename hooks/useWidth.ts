import { useState, useEffect, useRef } from 'react';

export const useWidth = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1200);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0) {
                    setWidth(entry.contentRect.width);
                }
            }
        });

        observer.observe(el);

        // Initial measure
        if (el.getBoundingClientRect().width > 0) {
            setWidth(el.getBoundingClientRect().width);
        }

        return () => observer.disconnect();
    }, []);

    return { ref, width };
};
