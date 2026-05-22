import { useScrollSpy } from '../utils/useScrollSpy.js'

interface SideBarProps {
    items: {id: string, label: string}[]
}

export function SideBarMenu({ items }: SideBarProps) {
    const activeId = useScrollSpy(items.map(item => item.id))

    return (
        <nav className='flex-col w-30 fixed space-y-2 hidden lg:flex'>
            {
                items.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`font-bold text-leg border-b transition-all duration-300 py-1
                                ${activeId === item.id ? 'border-pink-600 dark:border-pink-400 text-pink-900 dark:text-pink-100 translate-x-2'
                                                        : 'border-transparent text-pink-400/70 hover:text-pink-600 dark:hover:text-pink-300'}
                            `}
                    >
                        {item.label}
                    </a>
                ))
            }
        </nav>
    )


}