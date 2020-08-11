export function getSubMenuItemsFromMenu(breadcrumbs: string[], menuInf: any): any {
    for (let i = 0; i < breadcrumbs.length; i++) {
        let breadcrumb = breadcrumbs[i];
        menuInf = menuInf[breadcrumb];
    }
    return menuInf;
}
