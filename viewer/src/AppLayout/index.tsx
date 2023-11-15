// https://www.patternfly.org/components/page#multiple-sidebar-body

import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";

import {
  Page,
  Masthead,
  MastheadToggle,
  MastheadMain,
  MastheadBrand,
  MastheadContent,
  PageSidebar,
  PageSidebarBody,
  PageSection,
  PageSectionVariants,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon';

const MyPage: FunctionComponent = ({ children }) => {

  
  const headerToolbar = (
    <Toolbar id="multiple-sidebar-body-toolbar">
    <ToolbarContent>
    <ToolbarItem>header-tools</ToolbarItem>
    </ToolbarContent>
    </Toolbar>
  );
    
  const header = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton
          variant="plain"
          aria-label="Global navigation"
          id="sidebar-nav-toggle"
          >
        <BarsIcon />
      </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>
        <MastheadBrand href="https://patternfly.org" target="_blank">
          Logo
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>{headerToolbar}</MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar id="sidebar">
      <PageSidebarBody usePageInsets>First sidebar body (with insets)</PageSidebarBody>
      <PageSidebarBody isFilled={true}>Second sidebar body (with fill)</PageSidebarBody>
      <PageSidebarBody isFilled={false} usePageInsets>
      Third sidebar body (with insets and no fill)
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <Page header={header} sidebar={sidebar} isManagedSidebar>
        { children }

      <div style={{width: "100%"}}>
      </div>
    </Page>
  );
};

export default MyPage;
