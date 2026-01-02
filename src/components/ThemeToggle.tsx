import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';

export function ThemeToggle() {
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (stored === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // No stored preference - use system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            }
        }
    }, []);

    const toggleDark = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    return (
        <button onClick={toggleDark}
                className='w-10 h-9 flex items-center justify-center rounded-lg p-2'
        >
            <MoonIcon className='w-8 h-8 text-violet-700 block dark:hidden' />
            <SunIcon className='w-8 h-8 text-yellow-500 hidden dark:block' />
        </button>
    );
}