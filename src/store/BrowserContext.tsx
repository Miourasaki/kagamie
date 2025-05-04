import { ReactiveState, useReactiveState } from '@/lib/state';
import { Vector2 } from '@/lib/type';
import React, { createContext, useEffect } from 'react';

interface BrowserContextValue {
    innerSize: ReactiveState<Vector2>;
    about: ReactiveState<boolean>;
}


export const BrowserContext = createContext<BrowserContextValue>({
    innerSize: {
        value: { x: 0, y: 0 },
        set: () => console.warn("No BrowserProvider found!"),
    },
    about: {
        value: false,
        set: () => console.warn("No BrowserProvider found!"),
    },
});

export const BrowserProvider = ({ children }: { children: React.ReactNode }) => {

    const innerSize = useReactiveState<Vector2>({ x: 0, y: 0 });
    const about = useReactiveState<boolean>(false);

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            innerSize.set({
                x: window.innerWidth,
                y: window.innerHeight
            });
        });

        observer.observe(document.body);
        return () => observer.disconnect();
    }, []);

    return (
        <BrowserContext.Provider value={{ innerSize, about }}>
            {children}
        </BrowserContext.Provider>
    );
};

