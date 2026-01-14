import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const Popover = ({ isOpen, onClose, anchorEl, children, className = "" }) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;

            let top = rect.bottom + scrollY + 4;
            let left = rect.left + scrollX;

            // Basic viewport checking (simplified)
            if (left + 200 > window.innerWidth) {
                left = rect.right + scrollX - 200; // Align right if typical width
            }

            setPosition({ top, left });
        }
    }, [isOpen, anchorEl]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (anchorEl && anchorEl.contains(event.target)) return;
            // If click is inside the popover content, don't close (handled by child click propagation stop)
            // But we need a ref updates.
        };

        // We'll rely on a backdrop or global click handler
        if (isOpen) {
            document.addEventListener('click', handleGlobalClick, true); // Capture
        }
        return () => {
            document.removeEventListener('click', handleGlobalClick, true);
        };
    }, [isOpen]);

    const handleGlobalClick = (e) => {
        // Logic handled in specific components usually, but here:
        // If we click outside, close.
        // We need a ref to the popover content.
    };

    if (!isOpen) return null;

    return createPortal(
        <>
            <div
                className="fixed inset-0 z-[1900] bg-transparent"
                onClick={onClose}
            />
            <div
                className={`fixed z-[2000] bg-white dark:bg-[#22272b] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-border-light dark:border-border-dark ${className}`}
                style={{ top: position.top, left: position.left }}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </>,
        document.body
    );
};

export default Popover;
