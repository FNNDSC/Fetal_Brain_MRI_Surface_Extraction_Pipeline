import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  MenuToggleElement,
  Page,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon";
import * as React from "preact/compat";
import { Subject } from "../client";

const SubjectDropdown = ({
  subjects,
  selectedSubject,
  onSubjectSelect,
}: {
  subjects: Subject[];
  selectedSubject?: Subject;
  onSubjectSelect: (value: Subject) => any;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: MouseEvent | undefined,
    value: string | undefined,
  ) => {
    setIsOpen(false);
    if (value === undefined) {
      return;
    }
    const selected = subjects.find((subject) => subject.name === value);
    if (selected !== undefined) {
      onSubjectSelect(selected);
    }
  };

  return (
    <>
      <Dropdown
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={onToggleClick}
            isExpanded={isOpen}
          >
            {selectedSubject.name}
          </MenuToggle>
        )}
        onSelect={onSelect}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
        isOpen={isOpen}
        ouiaId="BasicDropdown"
        shouldFocusToggleOnSelect
      >
        <DropdownList>
          {subjects.map((subject) => (
            <DropdownItem
              value={subject.name}
              key={subject.name}
              description={`age: ${ageOf(subject)}`}
            >
              {subject.name}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
    </>
  );
};

function ageOf(subject: Subject): string {
  if (!subject.info) {
    return "unknown";
  }
  const ageKey = Object.keys(subject.info).find(
    (k) => k.toLowerCase() === "age",
  );
  return `${subject.info[ageKey]}`;
}

const MyPage = ({
  subjects,
  selectedSubject,
  onSubjectSelect,
  children,
}: {
  subjects?: Subject[];
  selectedSubject?: Subject;
  onSubjectSelect: (value) => void;
  children: ComponentChildren;
}) => {
  const headerToolbar = (
    <Toolbar>
      <ToolbarContent>
        <ToolbarGroup align={{ default: "alignRight" }}>
          {subjects ? (
            <ToolbarItem>
              <SubjectDropdown
                subjects={subjects}
                selectedSubject={selectedSubject}
                onSubjectSelect={onSubjectSelect}
              />
            </ToolbarItem>
          ) : null}
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );

  const header = (
    <Masthead>
      <MastheadToggle>
        <PageToggleButton variant="plain" aria-label="Global navigation">
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadMain>Fetal Surfaces Viewer</MastheadMain>
      <MastheadContent>{headerToolbar}</MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar id="sidebar">
      <PageSidebarBody usePageInsets>
        First sidebar body (with insets)
      </PageSidebarBody>
      <PageSidebarBody isFilled={true}>
        Second sidebar body (with fill)
      </PageSidebarBody>
      <PageSidebarBody isFilled={false} usePageInsets>
        Third sidebar body (with insets and no fill)
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <Page header={header} sidebar={sidebar} isManagedSidebar>
      {children}
    </Page>
  );
};

export default MyPage;
