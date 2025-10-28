document.addEventListener('DOMContentLoaded', () => {

    // --- Global Cache ---
    let projectsDataCache = null;

    // --- Utility Functions ---

    /**
     * Fetches project data from projects.json
     * Uses cache if available.
     */
    async function getProjectsData() {
        if (projectsDataCache) {
            return projectsDataCache;
        }
        try {
            const response = await fetch('projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            projectsDataCache = data;
            return data;
        } catch (error) {
            console.error("Could not fetch projects.json:", error);
            return [];
        }
    }

    /**
     * Creates and inserts project card HTML into the grid container
     */
    async function loadProjectCards() {
        const projects = await getProjectsData();
        const container = document.getElementById('project-grid-container');
        if (!container) {
            console.error('Project grid container not found!');
            return;
        }

        container.innerHTML = '';

        for (const project of projects) {
            const cardHTML = `
                <div class="project-card" data-project-id="${project.id}">
                    <div class="project-header">
                        <span class="tag">${project.tag}</span>
                        <span class="date">${project.date}</span>
                    </div>
                    <h3>${project.title}</h3>
                    <p>${project.summary}</p>
                    <div class="tech-box">${project.tech}</div>
                    <div class="project-buttons">
                        <a href="#" class="project-btn" data-modal-type="details" data-project-id="${project.id}">
                            <span class="btn-icon">📄</span>
                            <span>자세히 보기</span>
                        </a>
                        <a href="#" class="project-btn" data-modal-type="ppt" data-project-id="${project.id}">
                            <span class="btn-icon">📁</span>
                            <span>발표 자료</span>
                        </a>
                        <a href="#" class="project-btn" data-modal-type="video" data-project-id="${project.id}">
                            <span class="btn-icon">📺</span>
                            <span>발표 영상</span>
                        </a>
                        <a href="${project.github_link}" target="_blank" rel="noopener noreferrer" class="project-btn">
                            <span class="btn-icon">🐙</span>
                            <span>Github</span>
                        </a>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        }
    }

    /**
     * Finds the correct modal shell, populates it with project data, and displays it
     */
    async function openProjectModal(projectId, modalType) {
        const projects = await getProjectsData();
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            console.error(`Project with ID ${projectId} not found.`);
            return;
        }

        let modalShell, modalContentHTML;

        switch (modalType) {
            case 'details':
                modalShell = document.getElementById('modal-details-shell');
                const details = project.modal_details;

                // Helper function to create HTML list items from an array
                const createListItems = (items) => items && items.length > 0 ? items.map(item => `<li>${item}</li>`).join('') : '';

                // Build the HTML content for the details modal dynamically
                let rolesHTML = '';
                if (details.roles && details.roles.length > 0) {
                    rolesHTML = `
                        <div class="project-details">
                            <p><strong>역할:</strong></p>
                            <ul>${createListItems(details.roles)}</ul>
                        </div>
                    `;
                }

                let implementationHTML = '';
                if (details.implementations && details.implementations.length > 0) {
                    implementationHTML = `
                        <div class="project-details">
                            <p><strong>주요 구현 내용:</strong></p>
                            <ul>${createListItems(details.implementations)}</ul>
                        </div>
                    `;
                }

                let learningsHTML = '';
                if (details.learnings && details.learnings.length > 0) {
                    learningsHTML = `
                        <div class="project-details">
                            <p><strong>배운 점:</strong></p>
                            <ul>${createListItems(details.learnings)}</ul>
                        </div>
                    `;
                }

                // Combine all parts for the final modal content
                modalContentHTML = `
                    <div class="modal-header">
                        <h2>${details.title}</h2>
                    </div>
                    <div class="modal-body">
                        <div class="summary-container">
                            <strong class="summary-title">요약:</strong>
                            <span class="summary-text">${details.summary}</span>
                        </div>
                        ${rolesHTML}
                        ${implementationHTML}
                        ${learningsHTML}
                    </div>
                `;
                break; // End of case 'details'

            case 'ppt':
                modalShell = document.getElementById('modal-ppt-shell');
                const ppt = project.modal_ppt;
                modalContentHTML = `
                    <div class="modal-header">
                        <h2>${ppt.title}</h2>
                    </div>
                    <div class="modal-body">
                        <div class="pdf-container" style="position: relative; width: 100%; height: 70vh; overflow: hidden;">
                            <iframe src="${ppt.path}" width="100%" height="100%" style="border: none;"></iframe>
                        </div>
                        <p style="text-align: center; margin-top: 1rem;">
                            PDF가 보이지 않는다면 <a href="${ppt.path}" target="_blank">여기</a>를 클릭하여 새 창에서 열어주세요.
                        </p>
                    </div>
                `;
                break;

            case 'video':
                modalShell = document.getElementById('modal-video-shell');
                const video = project.modal_video;
                let videoBody;

                if (video.video_path) {
                    videoBody = `
                        <div class="video-container-local" style="max-width: 100%; margin: auto; background-color: #000;">
                            <video controls width="100%" style="display: block; max-height: 70vh;">
                                <source src="${video.video_path}" type="video/mp4">
                                Your browser does not support the video tag. MP4 video is required.
                            </video>
                        </div>
                    `;
                }
                else if (video.youtube_id) {
                    videoBody = `
                        <div class="video-container">
                            <iframe src="https://www.youtube.com/embed/${video.youtube_id}" frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen></iframe>
                        </div>
                    `;
                }
                else {
                    videoBody = `<p>${video.message || '영상을 준비 중입니다.'}</p>`;
                }

                modalContentHTML = `
                    <div class="modal-header">
                        <h2>${video.title}</h2>
                    </div>
                    <div class="modal-body">
                        ${videoBody}
                    </div>
                `;
                break;

            default:
                console.error(`Unknown modal type: ${modalType}`);
                return;
        }

        if (modalShell) {
            const dynamicContentContainer = modalShell.querySelector('.modal-dynamic-content');
            if (dynamicContentContainer) {
                dynamicContentContainer.innerHTML = modalContentHTML;
                modalShell.style.display = 'block';
            } else {
                 console.error('Dynamic content container not found in modal shell:', modalShell.id);
            }
        } else {
             console.error('Modal shell not found for type:', modalType);
        }
    }


    // --- Event Listeners ---

    // 1. Sidebar Toggle Button - REMOVED
    /*
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleButton = document.getElementById('sidebar-toggle');

    if (toggleButton && sidebar && mainContent) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            mainContent.classList.toggle('shifted');
        });
    } else {
         console.error('Sidebar toggle elements not found.');
    }
    */

    // 2. Project Grid Click Handler (using Event Delegation)
    const gridContainer = document.getElementById('project-grid-container');
    if (gridContainer) {
        gridContainer.addEventListener('click', (event) => {
            const externalBtn = event.target.closest('.project-btn[target="_blank"]');
            if (externalBtn) {
                event.stopPropagation();
                return;
            }

            const modalBtn = event.target.closest('.project-btn[data-project-id][data-modal-type]');
            if (modalBtn) {
                event.preventDefault();
                event.stopPropagation();
                openProjectModal(modalBtn.dataset.projectId, modalBtn.dataset.modalType);
                return;
            }

            const card = event.target.closest('.project-card[data-project-id]');
            if (card) {
                event.preventDefault();
                openProjectModal(card.dataset.projectId, 'details');
            }
        });
    } else {
        console.error('Project grid container not found for event listener setup.');
    }

    // 3. Modal Close Logic
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-btn');

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                const dynamicContent = modal.querySelector('.modal-dynamic-content');
                if (dynamicContent) {
                    const videoElement = dynamicContent.querySelector('video');
                    if (videoElement) {
                        videoElement.pause();
                        videoElement.removeAttribute('src');
                        videoElement.load();
                    }
                    dynamicContent.innerHTML = '';
                }
            }
        });
    });

    window.addEventListener('click', (event) => {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
                const dynamicContent = modal.querySelector('.modal-dynamic-content');
                if (dynamicContent) {
                    const videoElement = dynamicContent.querySelector('video');
                    if (videoElement) {
                        videoElement.pause();
                        videoElement.removeAttribute('src');
                        videoElement.load();
                    }
                    dynamicContent.innerHTML = '';
                }
            }
        });
    });

    // 4. Handle clicks on Research section buttons
    const researchTriggers = document.querySelectorAll('#research .project-btn[data-modal-target]');
    researchTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.querySelector(modalId);
            if(modal) {
                modal.style.display = 'block';
            }
        });
    });

    // --- Initial Page Load ---
    loadProjectCards();

});