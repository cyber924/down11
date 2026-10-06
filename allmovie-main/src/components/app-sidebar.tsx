
"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  Zap, 
  Factory, 
  PenTool, 
  Image as ImageIcon, 
  LayoutTemplate, 
  Globe, 
  Briefcase,
  LogOut,
  User as UserIcon,
  Library,
  Plane,
  Clapperboard,
  Database,
  SearchCheck
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, useAuth } from "@/firebase"
import { AuthDialog } from "./auth-dialog"
import { signOut } from "firebase/auth"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"

const items = [
  {
    title: "대시보드",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "컨텐츠 관리 (CSV)",
    url: "/management",
    icon: Database,
  },
  {
    title: "원클릭 여행 패키지",
    url: "/package",
    icon: Zap,
  },
  {
    title: "원클릭 엔터 패키지",
    url: "/enter",
    icon: Clapperboard,
  },
  {
    title: "나의 여행 보관함",
    url: "/packages",
    icon: Library,
  },
  {
    title: "대량 콘텐츠 팩토리",
    url: "/factory",
    icon: Factory,
  },
  {
    title: "지능형 멀티 에디터",
    url: "/editor",
    icon: PenTool,
  },
  {
    title: "비주얼 에셋 디렉터",
    url: "/visuals",
    icon: ImageIcon,
  },
  {
    title: "구조화 템플릿",
    url: "/templates",
    icon: LayoutTemplate,
  },
  {
    title: "워드프레스 자동화",
    url: "/wordpress",
    icon: Globe,
  },
  {
    title: "검색최적화 관제",
    url: "/seo",
    icon: SearchCheck,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, loading } = useUser()
  const auth = useAuth()

  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 flex flex-row items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Plane className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden text-primary">
            K-드라마 스튜디오
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest opacity-50">
            K-DRAMA ENGINE
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url || (item.url === "/packages" && pathname.startsWith("/packages/"))}
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${pathname === item.url ? 'text-accent' : ''}`} />
                      <span className="font-bold text-[13px]">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border group-data-[collapsible=icon]:p-2">
        <div className="space-y-4 group-data-[collapsible=icon]:space-y-0">
          {!loading && (
            user ? (
              <div className="flex flex-col gap-3 group-data-[collapsible=icon]:items-center">
                <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-accent text-accent-foreground font-bold text-xs">
                      {user.displayName?.slice(0, 1) || user.email?.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[12px] font-bold truncate">{user.displayName || '사용자'}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-[11px] font-bold group-data-[collapsible=icon]:hidden">로그아웃</span>
                </Button>
              </div>
            ) : (
              <AuthDialog />
            )
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
