import React, { useState, useEffect, useRef } from "react";

interface PopoverProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
}

const Popover: React.FC<PopoverProps> = ({
  children,
  trigger,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null); // Reference to the popover

  const togglePopover = () => setIsOpen(!isOpen);

  // Close popover when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close popover on escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <div onClick={togglePopover}>{trigger}</div>
      {isOpen && <div className={`absolute ${className}`}>{children}</div>}
    </div>
  );
};

export default Popover;
