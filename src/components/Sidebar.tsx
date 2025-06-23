import React from 'react';

import {
  Sidebar as Side,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from './ui/sidebar';

export const Sidebar: React.FC<{}> = () => {
  return (
    <Side>
      <SidebarHeader>Tallywise</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>Dashboard</SidebarGroup>
        <SidebarGroup>Transactions</SidebarGroup>
      </SidebarContent>
      <SidebarFooter>This is where acc details go</SidebarFooter>
    </Side>
  );
};
