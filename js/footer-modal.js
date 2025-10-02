// Footer Modal Management
(function() {
    'use strict';
    
    let isModalOpen = false;
    
    // Initialize
    function init() {
        setupEventListeners();
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        const footerBtn = document.getElementById('footer-info-btn');
        const footerModal = document.getElementById('footer-modal');
        const footerOverlay = document.getElementById('footer-modal-overlay');
        const closeBtn = document.getElementById('footer-modal-close');
        
        if (footerBtn) {
            footerBtn.addEventListener('click', toggleModal);
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        if (footerOverlay) {
            footerOverlay.addEventListener('click', closeModal);
        }
        
        // Tab switching
        document.querySelectorAll('.footer-tab').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        });
    }
    
    // Toggle Modal
    function toggleModal() {
        if (isModalOpen) {
            closeModal();
        } else {
            openModal();
        }
    }
    
    // Open Modal
    function openModal() {
        const modal = document.getElementById('footer-modal');
        const overlay = document.getElementById('footer-modal-overlay');
        const btn = document.getElementById('footer-info-btn');
        
        if (modal && overlay && btn) {
            modal.classList.add('open');
            overlay.classList.add('show');
            btn.style.display = 'none';
            isModalOpen = true;
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close Modal
// Close Modal
function closeModal() {
    const modal = document.getElementById('footer-modal');
    const overlay = document.getElementById('footer-modal-overlay');
    const btn = document.getElementById('footer-info-btn');
    const backToTopBtn = document.getElementById('back-to-top-btn');  // ← AGGIUNGI
    
    if (modal && overlay && btn) {
        modal.classList.remove('open');
        overlay.classList.remove('show');
        
        // Hide back to top button  // ← AGGIUNGI
        if (backToTopBtn) {
            backToTopBtn.classList.remove('show');
        }
        
        // Wait for animation to complete
        setTimeout(() => {
            btn.style.display = 'flex';
        }, 400);
        
        isModalOpen = false;
        
        // Re-enable body scroll
        document.body.style.overflow = '';
    }
}


    // Switch Tab
    function switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.footer-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.footer-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`tab-${tabName}`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
    }
    
	// Setup Event Listeners
function setupEventListeners() {
    const footerBtn = document.getElementById('footer-info-btn');
    const footerModal = document.getElementById('footer-modal');
    const footerOverlay = document.getElementById('footer-modal-overlay');
    const closeBtn = document.getElementById('footer-modal-close');
    const backToTopBtn = document.getElementById('back-to-top-btn');  // ← AGGIUNGI
    const modalContent = document.querySelector('.footer-modal-content');  // ← AGGIUNGI
    
    if (footerBtn) {
        footerBtn.addEventListener('click', toggleModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (footerOverlay) {
        footerOverlay.addEventListener('click', closeModal);
    }
    
    // AGGIUNGI: Back to top functionality
    if (backToTopBtn && modalContent) {
        // Show/hide button on scroll
        modalContent.addEventListener('scroll', () => {
            if (modalContent.scrollTop > 200) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        // Scroll to top on click
        backToTopBtn.addEventListener('click', () => {
            modalContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Tab switching
    document.querySelectorAll('.footer-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    });
}
	
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();