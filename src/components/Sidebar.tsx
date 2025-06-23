import React from 'react'
import { Sidebar as Side, SidebarHeader, SidebarFooter, SidebarContent, SidebarGroup } from './ui/sidebar'

export const Sidebar: React.FC<{}> = () => {
  return (
    <Side>
      <SidebarHeader>Tallywise</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          Dashboard
        </SidebarGroup>
        <SidebarGroup>
          Transactions
        </SidebarGroup>
      </SidebarContent>
    </Side>
  )
}