'use client'
import { Button } from "@/components/ui/button";
import { DropdownMenu, 
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuContent, 
    DropdownMenuLabel, 
    DropdownMenuSeparator
 } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, SunMoon } from "lucide-react";

const ModeToggle = () => {
    const {theme,setTheme} = useTheme()

    return  <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant='ghost' className="focus-visible:ring-0 focus-visible:ring-offset-0">
                {theme === 'system' ? (
                    <SunMoon/>
                ): theme === 'dark' ? (
                    <MoonIcon/>
                ) : (<SunIcon/>)
                }
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuLabel>
                Appearance
            </DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuCheckboxItem checked = {theme === 'system'} onClick={() => setTheme('system')}>
                System
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked = {theme === 'light'} onClick={() => setTheme('light')}>
                light
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked = {theme === 'dark'} onClick={() => setTheme('dark')}>
                dark
            </DropdownMenuCheckboxItem>

        </DropdownMenuContent>
        </DropdownMenu> ;
};
 
export default ModeToggle;