"use client";

import { useEffect, useState } from "react";
import { MENUS } from "../model/menuData";
import { MenuDropdown } from "./menuDropdown";

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!activeMenu) return;
    const handler = (e: MouseEvent) => {
      if ((e.target as Element).closest("[data-menu-trigger]")) return;
      setActiveMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeMenu]);

  const handleMenuClick = (
    name: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (activeMenu === name) {
      setActiveMenu(null);
      return;
    }
    setAnchorRect(e.currentTarget.getBoundingClientRect());
    setActiveMenu(name);
  };

  return (
    <>
      <nav className="flex items-center h-full" aria-label="Application menu">
        {Object.keys(MENUS).map((name) => (
          <button
            key={name}
            type="button"
            data-menu-trigger
            aria-haspopup="menu"
            aria-expanded={activeMenu === name}
            onClick={(e) => handleMenuClick(name, e)}
            data-active={activeMenu === name}
            className="menu-bar-btn relative h-full border-0"
            onMouseEnter={(e) => {
              if (activeMenu && activeMenu !== name) {
                setAnchorRect(e.currentTarget.getBoundingClientRect());
                setActiveMenu(name);
              }
            }}
          >
            {name}
          </button>
        ))}
      </nav>
      {activeMenu && anchorRect && MENUS[activeMenu] && (
        <MenuDropdown
          menuName={activeMenu}
          items={MENUS[activeMenu]}
          anchorRect={anchorRect}
          onClose={() => setActiveMenu(null)}
        />
      )}
    </>
  );
}
