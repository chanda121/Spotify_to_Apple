interface NavItem {
    id: number;
    label: string;
    link: string;
}

export const headerNavItems: NavItem[] = [{
    id: 0,
    label: 'Stats',
    link: '/stats'
}, {
    id: 1,
    label: 'Transfer Playlist',
    link: '/transfer-playlist'
}, {
    id: 2,
    label: 'About',
    link: '/about'
}]