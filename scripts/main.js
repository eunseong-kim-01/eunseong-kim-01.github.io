document.addEventListener('DOMContentLoaded', () => {
    // Select all elements that should trigger a modal (project-card and project-btn)
    const modalTriggers = document.querySelectorAll('.project-card[data-modal-target], .project-btn[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-btn');

    // Show modal when a trigger element is clicked
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            // Prevent default link behavior for anchor tags
            event.preventDefault(); 
            // Stop event from propagating to parent elements
            event.stopPropagation(); 

            const modalId = trigger.getAttribute('data-modal-target');
            document.querySelector(modalId).style.display = 'block';
        });
    });

    // Close modal with 'X' button
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleButton = document.getElementById('sidebar-toggle');

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
        mainContent.classList.toggle('shifted');
    });

 // Find all buttons that are external links (like the GitHub button)
    const externalLinkButtons = document.querySelectorAll('.project-btn[target="_blank"]');

    // Add a click listener to each of them
    externalLinkButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Stop the click from bubbling up to the parent .project-card
            // This prevents the modal from opening, allowing the link to work correctly
            event.stopPropagation();
        });
    });
});