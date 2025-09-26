document.addEventListener("DOMContentLoaded", () => {
  const folders = document.querySelectorAll(".folder");
  const popups = document.querySelectorAll(".popup");
  const reloadButton = document.querySelector('.reload-button');

  let highestZIndex = 1000;

  // Function to bring the clicked popup to the top
  function bringToFront(popup) {
    popup.style.zIndex = ++highestZIndex;
  }

  // Function to close all open popups and reset folder states
  function closeAllPopups() {
    popups.forEach(popup => {
      // 1. Close the popup
      popup.classList.remove("show");
      popup.style.display = "none";
      // Optional: Reset translation on close so they open in the center again
      popup.style.transform = "none";

      // 2. Reset the corresponding folder state
      const folderId = popup.id.replace('popup-', '');
      const folder = document.querySelector(`[data-folder="${folderId}"]`);
      if (folder) {
        folder.classList.remove('open');
      }
    });
  }

  // ----------------------------------------------------
  // 1. Open/Close Popup Functionality (INSTANT)
  // ----------------------------------------------------
  folders.forEach(folder => {
    folder.addEventListener("click", () => {
      const targetId = "popup-" + folder.dataset.folder;
      const popup = document.getElementById(targetId);

      bringToFront(popup);

      if (!popup.classList.contains("show")) {
        // INSTANT OPEN
        popup.style.display = "block";
        popup.classList.add("show");
        
        // ✨ NEW: Add 'open' class to the folder
        folder.classList.add('open');
      }
    });
  });

  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const popup = e.target.closest('.popup');
      popup.classList.remove("show");
      // INSTANT CLOSE
      popup.style.display = "none";
      // Optional: Reset translation on close
      popup.style.transform = "none";
      
      // ✨ NEW: Remove 'open' class from the corresponding folder
      const folderId = popup.id.replace('popup-', '');
      const folder = document.querySelector(`[data-folder="${folderId}"]`);
      if (folder) {
        folder.classList.remove('open');
      }
    });
  });

  // ----------------------------------------------------
  // 2. Reload Button Functionality
  // ----------------------------------------------------
  reloadButton.addEventListener('click', (e) => {
    e.preventDefault(); 
    closeAllPopups(); // Calls the updated function which also closes folders
  });


  // ----------------------------------------------------
  // 3. Draggable Functionality (Instant Cursor Tracking)
  // ----------------------------------------------------
  popups.forEach(popup => makeDraggable(popup));

  function makeDraggable(el) {
    let offsetX = 0, offsetY = 0, isDragging = false;
    let currentX = 0, currentY = 0;
    
    el.addEventListener('mousedown', (e) => {
      // Prevent drag when clicking the resize area
      const rect = el.getBoundingClientRect();
      const edgeTolerance = 15;
      
      const isNearRightEdge = rect.right - e.clientX < edgeTolerance;
      const isNearBottomEdge = rect.bottom - e.clientY < edgeTolerance;

      if (isNearRightEdge || isNearBottomEdge || e.target.classList.contains('close-btn')) {
        return; 
      }
      
      // Allow drag only on the popup element itself (or its direct children that aren't the close button)
      // We check if the target is the popup or a child element like the h3/p tag inside
      // A simple check is to ensure we are dragging on the popup itself, not an inner scrollable element if it exists.
      // For simplicity with this current structure, we allow dragging unless it's the close button.
      
      isDragging = true;
      bringToFront(el);

      // Get initial position from CSS transform matrix
      const style = window.getComputedStyle(el);
      const matrix = new DOMMatrix(style.transform);
      currentX = matrix.m41;
      currentY = matrix.m42;

      // Calculate mouse offset (where the mouse is relative to the element's origin)
      offsetX = e.clientX - currentX;
      offsetY = e.clientY - currentY;
      
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragEnd);
    });

    const dragMove = (e) => {
      if (!isDragging) return;

      // Calculate the new instant position
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;

      // Direct update for instant tracking (zero lag)
      el.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    };

    const dragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
    };
  }
});