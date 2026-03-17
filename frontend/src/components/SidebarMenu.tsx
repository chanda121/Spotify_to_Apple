import { useScrollSpy } from '../utils/useScrollSpy.js'

interface SideBarProps {
    items: {id: string, label: string}[]
}

export function SideBarMenu({ items }: SideBarProps) {
    const activeId = useScrollSpy(items.map(item => item.id))

    return (
        <nav className='flex flex-col w-30 fixed space-y-2'>
            {
                items.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`font-bold text-leg border-b transition-all duration-300 py-1
                                ${activeId === item.id ? 'border-black dark:border-white text-black dark:text-white translate-x-2'
                                                        : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
                            `}
                    >
                        {item.label}
                    </a>
                ))
            }
        </nav>
    )


}