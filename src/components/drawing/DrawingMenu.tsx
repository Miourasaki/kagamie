import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/components/ui/menubar"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import DefaultAvatar from '@/assets/default_avatar.webp'
import Favicon from '@/assets/favicon.png'
import { useContext, useEffect, useState } from "react"
import { DrawingContext, ToolStatus } from "./DrawingContext"
import { useReactiveLSState, useReactiveState } from "@/lib/state"
import ColorPicker from "./ColorPicker"
import { BrowserContext } from "@/store/BrowserContext"
import ScaleBar from "../common/ScaleBar"
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog"

export default function DrawingMenu() {

    const openPicker = useReactiveLSState<boolean>('gaban.tools.picker', true)
    const { status, color, position, scale } = useContext(DrawingContext)
    const browser = useContext(BrowserContext)

    return (<>
        <div className="z-5 absolute flex flex-col top-0 left-0 py-2 px-4 size-full pointer-events-none">
            <div className="flex items-center justify-between">
                <LeftMenu />
                <RightMenu />
            </div>
            <div className='flex-1 flex items-start justify-between mt-10 w-full'>
                <Menubar className="pointer-events-auto gap-2 flex-col h-auto w-10 p-1 py-2">
                    <button onClick={() => (status.set(ToolStatus.DRAW))} className={`${status.value == ToolStatus.DRAW && 'bg-accent text-accent-foreground'} hover:bg-accent hover:text-accent-foreground px-1 size-8 outline-hidden select-none rounded-sm`}>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M7 16c.55 0 1 .45 1 1c0 1.1-.9 2-2 2c-.17 0-.33-.02-.5-.05c.31-.55.5-1.21.5-1.95c0-.55.45-1 1-1M18.67 3c-.26 0-.51.1-.71.29L9 12.25L11.75 15l8.96-8.96a.996.996 0 0 0 0-1.41l-1.34-1.34c-.2-.2-.45-.29-.7-.29zM7 14c-1.66 0-3 1.34-3 3c0 1.31-1.16 2-2 2c.92 1.22 2.49 2 4 2c2.21 0 4-1.79 4-4c0-1.66-1.34-3-3-3z" fill="currentColor"></path></svg>
                    </button>
                </Menubar>
                <div className='flex items-start gap-3'>
                    <Menubar inert={!openPicker.value} className={`pointer-events-auto z-1 gap-2 flex-col h-auto overflow-auto w-62 p-5 transition-all duration-200 ease-in-out transform ${openPicker.value ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
                        <ColorPicker />
                    </Menubar>
                    <Menubar className="pointer-events-auto z-2 gap-2 flex-col h-auto w-10 p-1 py-2">
                        <button onClick={() => (status.set(ToolStatus.MOVE))} className={`${status.value == ToolStatus.MOVE && 'bg-accent text-accent-foreground'} hover:bg-accent hover:text-accent-foreground px-1 size-8 outline-hidden select-none rounded-sm`}>
                            <svg className='' xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M15.28 6.03a.75.75 0 0 1-1.06 0l-1.47-1.47v3.69a.75.75 0 0 1-1.5 0V4.56L9.78 6.03a.75.75 0 0 1-1.06-1.06l2.75-2.75a.75.75 0 0 1 1.06 0l2.75 2.75a.75.75 0 0 1 0 1.06zm-9.25 8.19a.75.75 0 1 1-1.06 1.06l-2.75-2.75a.75.75 0 0 1 0-1.06l2.75-2.75a.75.75 0 0 1 1.06 1.06l-1.47 1.47h3.69a.75.75 0 0 1 0 1.5H4.56l1.47 1.47zm11.94 1.06a.75.75 0 0 1 0-1.06l1.47-1.47h-3.69a.75.75 0 0 1 0-1.5h3.69l-1.47-1.47a.75.75 0 0 1 1.06-1.06l2.75 2.75a.75.75 0 0 1 0 1.06l-2.75 2.75a.75.75 0 0 1-1.06 0zm-2.69 2.69a.75.75 0 0 0-1.06 0l-1.47 1.47v-3.69a.75.75 0 0 0-1.5 0v3.69l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2.75 2.75a.75.75 0 0 0 1.06 0l2.75-2.75a.75.75 0 0 0 0-1.06z" fill="currentColor"></path></g></svg>
                        </button>
                        <button onClick={() => (status.set(ToolStatus.SEARCH))} className={`${status.value == ToolStatus.SEARCH && 'bg-accent text-accent-foreground'} hover:bg-accent hover:text-accent-foreground px-1 size-8 outline-hidden select-none rounded-sm`}>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M27.01 12l-1.41 1.41L28.18 16l-2.59 2.59L27.01 20l4-4l-4-4z" fill="currentColor"></path><path d="M6.41 13.42L5 12l-4 4l4 4l1.42-1.41L3.83 16l2.58-2.58z" fill="currentColor"></path><path d="M16 28.17l-2.59-2.59L12 27l4 4l4-4l-1.41-1.41L16 28.17z" fill="currentColor"></path><path d="M16 3.83l2.58 2.58L20 5l-4-4l-4 4l1.41 1.42L16 3.83z" fill="currentColor"></path><path d="M22 16a6 6 0 1 0-2.53 4.89l3.82 3.82l1.42-1.42l-3.82-3.82A6 6 0 0 0 22 16zm-6 4a4 4 0 1 1 4-4a4 4 0 0 1-4 4z" fill="currentColor"></path></svg>
                        </button>
                        <button onClick={() => openPicker.set(!openPicker.value)} className={`${openPicker.value && 'bg-accent text-accent-foreground'} hover:bg-accent hover:text-accent-foreground px-1 size-8 outline-hidden select-none rounded-sm`}>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20"><g fill="none"><path d="M5.77 3.166c2.373-1.454 5.173-1.59 7.927-.174c3.976 2.042 5.502 6.162 4.187 10.435c-.415 1.35-1.245 2.698-2.371 3.59c-1.14.902-2.604 1.347-4.206.799c-1.102-.377-1.79-.967-2.203-1.68c-.404-.696-.52-1.462-.574-2.132a25.653 25.653 0 0 1-.039-.586c-.007-.132-.014-.259-.022-.369a4.724 4.724 0 0 0-.101-.76a1.163 1.163 0 0 0-.206-.466a.751.751 0 0 0-.386-.244c-.518-.159-.874-.126-1.156-.036c-.248.078-.447.2-.689.346c-.062.038-.127.078-.197.119c-.316.186-.72.396-1.238.37c-.514-.025-1.045-.275-1.656-.773c-.67-.546-.934-1.31-.938-2.112c-.003-.788.243-1.635.614-2.434c.737-1.59 2.043-3.15 3.254-3.893zM9.75 6.75a1 1 0 1 0 0-2a1 1 0 0 0 0 2zm3 1a1 1 0 1 0 0-2a1 1 0 0 0 0 2zM15.5 9a1 1 0 1 0-2 0a1 1 0 0 0 2 0zm-1 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2zm-1 1a1 1 0 1 0-2 0a1 1 0 0 0 2 0z" fill={color.value.hex} stroke='pink' strokeWidth={0.5}></path></g></svg>  </button>
                        <button onClick={() => (status.set(ToolStatus.SELECT))} className={`${status.value == ToolStatus.SELECT && 'bg-accent text-accent-foreground'} hover:bg-accent hover:text-accent-foreground px-1 size-8 outline-hidden select-none rounded-sm`}>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M20.71 5.63l-2.34-2.34a.996.996 0 0 0-1.41 0l-3.12 3.12l-1.23-1.21c-.39-.39-1.02-.38-1.41 0a.996.996 0 0 0 0 1.41l.72.72l-8.77 8.77c-.1.1-.15.22-.15.36v4.04c0 .28.22.5.5.5h4.04c.13 0 .26-.05.35-.15l8.77-8.77l.72.72a.996.996 0 1 0 1.41-1.41l-1.22-1.22l3.12-3.12a.99.99 0 0 0 .02-1.42zM6.92 19L5 17.08l8.06-8.06l1.92 1.92L6.92 19z" fill="currentColor"></path></svg>
                        </button>
                    </Menubar>
                </div>
            </div>

            <div className='w-full flex justify-between items-end'>
                <div className='mb-3'>
                    <PositionBar />
                </div>
                <div inert className='flex items-center flex-col gap-0.5'>
                    <div className="text-xs">X: {position.value.x.toFixed()}  Y: {position.value.y.toFixed()}</div>
                    <ScaleBar scale={scale.value} unit="cm" width={(browser.innerSize.value.x / 30) * 30} color="#000" />
                </div>
            </div>
        </div>

    </>)

}
import { buildInfo } from '@/build-info'
import { DialogTitle } from "@radix-ui/react-dialog"

const LeftMenu = () => {

    const { fetchData, data } = useContext(DrawingContext);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const checkFullScreen = () => {
        return !!(
            document.fullscreenElement
        );
    };

    const toggleFullScreen = () => {
        if (!isFullScreen) {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };
    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(checkFullScreen());
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);
    const about = useReactiveState<boolean>(false);

    return (<>
        <Dialog open={about.value} onOpenChange={about.set}>
            <DialogContent className='w-100 max-h-2/3 flex flex-col p-0'>
                <DialogHeader className="px-5 pt-5">
                    <a href={buildInfo.git.repository} target="_blank" className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 size-11 rounded-lg">
                            {/* 使用你的项目图标或默认图标 */}
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5C64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9c26.4 39.1 77.9 32.5 104 26c5.7-23.5 17.9-44.5 34.7-60.8c-140.6-25.2-199.2-111-199.2-213c0-49.5 16.3-95 48.3-131.7c-20.4-60.5 1.9-112.3 4.9-120c58.1-5.2 118.5 41.6 123.2 45.3c33-8.9 70.7-13.6 112.9-13.6c42.4 0 80.2 4.9 113.5 13.9c11.3-8.6 67.3-48.8 121.3-43.9c2.9 7.7 24.7 58.3 5.5 118c32.4 36.8 48.9 82.7 48.9 132.3c0 102.2-59 188.1-200 212.9a127.5 127.5 0 0 1 38.1 91v112.5c.8 9 0 17.9 15 17.9c177.1-59.7 304.6-227 304.6-424.1c0-247.2-200.4-447.3-447.5-447.3z" fill="currentColor"></path></svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold flex items-center gap-2">{buildInfo.node.project.name}
                                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5"></path><path d="M10 14L20 4"></path><path d="M15 4h5v5"></path></g></svg>
                            </h2>
                            <p className="text-sm text-muted-foreground">v{buildInfo.node.project.version}</p>
                        </div>
                    </a>
                </DialogHeader>
                <div className="shadow-inner overflow-auto p-6 space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Build Date</p>
                            <p className="text-sm">{new Date(buildInfo.buildDate).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Node Version</p>
                            <p className="text-sm">{buildInfo.node.version} ({buildInfo.platform})</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Git Commit</p>
                        <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-0.5 rounded">
                                {buildInfo.git.commit.hash}
                            </code>
                            <p className="text-sm">{buildInfo.git.commit.summary}</p>
                        </div>
                        <p className="text-sm">
                            由 {buildInfo.git.commit.author} 提交于 {new Date(buildInfo.git.commit.date).toLocaleString()}
                        </p>
                    </div>

                    <div className="space-y-2 mt-10">
                        <p className="text-sm font-medium text-muted-foreground">依赖项</p>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(buildInfo.dependencies).map(([name, version]) => (
                                <div key={name} className="text-sm">
                                    <span className="font-medium">{name}</span>: <span className="text-muted-foreground text-xs">{version}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        <Menubar className="pointer-events-auto">
            <MenubarMenu>
                <MenubarTrigger className="pl-1 pr-1.5">
                    <img className="size-6" src={Favicon.src} alt="kagami è" />
                </MenubarTrigger>
                <MenubarContent>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => about.set(true)}>
                        About
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled>
                        New Canvas <MenubarShortcut>⌘N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled>
                        Find Canvas On List
                    </MenubarItem>
                    <MenubarItem disabled>Join Canvas</MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger>Share</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem onClick={() => navigator.clipboard.writeText(window.location.href)
                            }>Copy link</MenubarItem>
                            <MenubarItem disabled>Messages</MenubarItem>
                            <MenubarItem disabled>Twitter (X.com)</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => {
                        if (data.value) {
                            const offscreenCanvas = document.createElement('canvas');
                            offscreenCanvas.width = data.value.size.x;
                            offscreenCanvas.height = data.value.size.y;
                            const offscreenCtx = offscreenCanvas.getContext('2d');

                            if (!offscreenCtx) return;
                            offscreenCtx.imageSmoothingEnabled = false

                            Object.entries(data.value.pixels).forEach(([key, value]) => {
                                const [i, j] = key.split(",").map(coord => parseInt(coord, 10));
                                offscreenCtx.fillStyle = value;
                                offscreenCtx.fillRect(i, j, 1, 1);
                            });

                            offscreenCanvas.toBlob((blob) => {
                                if (!blob) return;

                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                const localUrl = new URL(location.href)
                                a.download = `${data.value!.name}(${data.value!.size.x}x${data.value!.size.y}) by ${localUrl.hostname} at ${(new Date()).toLocaleString()}.png`; // 设置下载文件名
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url); // 释放内存
                            }, 'image/png');

                        }
                    }}>
                        Print... <MenubarShortcut>⌘P</MenubarShortcut>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled>
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled>
                        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger>Find</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem disabled>Search the Pixel</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem disabled>Find...</MenubarItem>
                            <MenubarItem disabled>Find Next</MenubarItem>
                            <MenubarItem disabled>Find Previous</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    {/* <MenubarSeparator /> */}
                    {/* <MenubarItem>Cut</MenubarItem>
                    <MenubarItem>Copy</MenubarItem>
                    <MenubarItem>Paste</MenubarItem> */}
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarCheckboxItem disabled>
                        Hide All Panels <MenubarShortcut>tab</MenubarShortcut>
                    </MenubarCheckboxItem>
                    <MenubarCheckboxItem disabled checked>
                        Background Grid
                    </MenubarCheckboxItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => fetchData()} inset>
                        Reload <MenubarShortcut>⌘R</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onClick={() => location.reload()} inset>
                        Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => toggleFullScreen()} inset>
                        Toggle Fullscreen <MenubarShortcut>F11</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled inset>Hide Sidebar</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Window</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled>
                        导入参考图
                    </MenubarItem>
                    <MenubarSub>
                        <MenubarSubTrigger>参考图1</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem disabled>固定位置</MenubarItem>
                            <MenubarItem disabled>重置位置</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem disabled>放大</MenubarItem>
                            <MenubarItem disabled>缩小</MenubarItem>
                            <MenubarItem disabled>切换图源</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>

                    <MenubarSeparator />
                    <MenubarItem disabled>特效着色器</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

        </Menubar>
    </>)
}



const PositionBar = () => {

    const { move, reset } = useContext(DrawingContext)
    return (
        <Menubar className="pointer-events-auto">
            <MenubarMenu>
                <button onClick={reset} className={`hover:bg-accent hover:text-accent-foreground px-0.5 size-7 outline-hidden select-none rounded-sm`}>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16"><g fill="none"><path d="M8 9a1 1 0 1 0 0-2a1 1 0 0 0 0 2zM4.5 8a3.5 3.5 0 1 1 7 0a3.5 3.5 0 0 1-7 0zM8 5.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5zM2 8a6 6 0 1 1 12.001 0A6 6 0 0 1 2 8zm6-5a5 5 0 1 0 0 10.001A5 5 0 0 0 8 3z" fill="currentColor"></path></g></svg>
                </button>
                <MenubarTrigger>
                    <div className="flex items-center gap-2">
                        <div className="space-x-1 w-10">
                            <span className="text-stone-500 text-[10px]">X</span>
                            <span className="">{move.value.x}</span>
                        </div>
                        <div className="space-x-1 w-10">
                            <span className="text-stone-500 text-[10px]">Y</span>
                            <span className="">{move.value.y}</span>
                        </div>
                    </div>
                </MenubarTrigger>
                <MenubarContent align="end">
                    <MenubarItem inset disabled>使用邮箱登录</MenubarItem>
                    <MenubarGroup>
                        <MenubarItem inset>Add Profile...</MenubarItem>
                        <MenubarItem inset>Edit...</MenubarItem>
                    </MenubarGroup>
                    <MenubarRadioGroup value="benoit">
                        <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                        <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                        <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
                    </MenubarRadioGroup>
                    <MenubarSeparator />
                    <MenubarItem inset>Edit...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem inset>Add Profile...</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}




const RightMenu = () => {
    return (
        <Menubar className="pointer-events-auto">
            <MenubarMenu>
                <MenubarTrigger
                    className="gap-2 flex items-center text-sm text-gray-500"
                    onClick={(e) => {

                    }}>
                    <Avatar className="size-5">
                        <AvatarImage src={DefaultAvatar.src} alt="@avatar" />
                        <AvatarFallback>AT</AvatarFallback>
                    </Avatar>
                    Login
                </MenubarTrigger>
                <MenubarContent align="end">
                    <MenubarItem inset disabled>使用邮箱登录</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem inset disabled>Login with Github</MenubarItem>
                    <MenubarItem inset disabled>Login with QQ</MenubarItem>
                    {/* <MenubarGroup>
                        <MenubarItem inset>Add Profile...</MenubarItem>
                        <MenubarItem inset>Edit...</MenubarItem>
                    </MenubarGroup>
                    <MenubarRadioGroup value="benoit">
                        <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                        <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                        <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
                    </MenubarRadioGroup>
                    <MenubarSeparator />
                    <MenubarItem inset>Edit...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem inset>Add Profile...</MenubarItem> */}
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}