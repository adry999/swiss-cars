import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'ro',
}));

vi.mock('next-intl/server', () => ({
    getTranslations: () => Promise.resolve((key: string) => key),
    getLocale: () => Promise.resolve('ro'),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
    notFound: vi.fn(),
}));

// Mock next/image
vi.mock('next/image', () => ({
    default: function MockImage({ src, alt, ...props }: { src: string; alt: string }) {
        return React.createElement('img', { src, alt, ...props });
    },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: function MockMotionDiv({ children, ...props }: { children: React.ReactNode }) {
            return React.createElement('div', props, children);
        },
        p: function MockMotionP({ children, ...props }: { children: React.ReactNode }) {
            return React.createElement('p', props, children);
        },
    },
    AnimatePresence: function MockAnimatePresence({ children }: { children: React.ReactNode }) {
        return React.createElement(React.Fragment, null, children);
    },
}));
