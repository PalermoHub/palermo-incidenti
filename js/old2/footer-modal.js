// Footer Modal Management
(function() {
    'use strict';
    
    let isModalactive = false;
    let activeTooltip = null;
    
    // Initialize
    function init() {
        setupEventListeners();
        initializeTooltips();
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        const footerBtn = document.getElementById('footer-info-btn');
        const footerModal = document.getElementById('footer-modal');
        const footerOverlay = document.getElementById('footer-modal-overlay');
        const closeBtn = document.getElementById('footer-modal-close');
        const backToTopBtn = document.getElementById('back-to-top-btn');
        const modalContent = document.querySelector('.footer-modal-content');
        
        if (footerBtn) {
            footerBtn.addEventListener('click', toggleModal);
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        if (footerOverlay) {
            footerOverlay.addEventListener('click', closeModal);
        }
        
		// In entrambi i modali, aggiungere:
	modal.addEventListener('touchstart', function(e) {
		e.stopPropagation();
	});

	modal.addEventListener('click', function(e) {
		e.stopPropagation();
	});
		
        // Back to top functionality
        if (backToTopBtn && modalContent) {
            // active/hide button on scroll
            modalContent.addEventListener('scroll', () => {
                if (modalContent.scrollTop > 200) {
                    backToTopBtn.classList.add('active');
                } else {
                    backToTopBtn.classList.remove('active');
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
            if (e.key === 'Escape' && isModalactive) {
                closeModal();
            }
            if (e.key === 'Escape' && activeTooltip) {
                closeTooltip();
            }
        });
        
        // Close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (activeTooltip && !e.target.closest('.as-is-term') && !e.target.closest('.as-is-tooltip')) {
                closeTooltip();
            }
        });
    }
    
    // Initialize Tooltips for "as is" terms
    function initializeTooltips() {
        // Find all elements with class "as-is-term" or wrap "as is" text
        const asIsTerms = document.querySelectorAll('.as-is-term');
        
        asIsTerms.forEach(term => {
            term.style.cursor = 'help';
            term.style.textDecoration = 'underline dotted';
            term.style.textDecorationColor = '#666';
            
            term.addEventListener('click', (e) => {
                e.stopPropagation();
                activeTooltip(term);
            });
            
            // Optional: active on hover
            term.addEventListener('mouseenter', () => {
                term.style.textDecorationColor = '#0066cc';
            });
            
            term.addEventListener('mouseleave', () => {
                term.style.textDecorationColor = '#666';
            });
        });
    }
    
    // active Tooltip
    function activeTooltip(element) {
        // Close any existing tooltip
        closeTooltip();
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'as-is-tooltip';
        tooltip.innerHTML = `
            <div class="as-is-tooltip-content">
                <button class="as-is-tooltip-close" aria-label="Chiudi">&times;</button>
                <h4>Cosa significa "as is"?</h4>
                <p>I dati sono forniti <strong>"as is"</strong> (letteralmente "così come sono") significa che:</p>
                <ul>
                    <li>Le informazioni sono presentate nel loro stato attuale, senza modifiche o verifiche aggiuntive</li>
                    <li>Non viene fornita alcuna garanzia sulla loro accuratezza, completezza o aggiornamento</li>
                    <li>L'utente accetta i dati nella loro forma originale e si assume la responsabilità del loro utilizzo</li>
                    <li>Il fornitore non è responsabile per eventuali errori o omissioni nei dati</li>
                </ul>
                <p class="as-is-note">⚠️ Si consiglia sempre di verificare i dati critici prima dell'utilizzo.</p>
            </div>
        `;
        
        // Position tooltip near the element
        document.body.appendChild(tooltip);
        positionTooltip(tooltip, element);
        
        // Add close button listener
        const closeBtn = tooltip.querySelector('.as-is-tooltip-close');
        closeBtn.addEventListener('click', closeTooltip);
        
        // Animate in
        setTimeout(() => {
            tooltip.classList.add('active');
        }, 10);
        
        activeTooltip = tooltip;
    }
    
    // Position Tooltip
    function positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top = rect.bottom + window.scrollY + 10;
        let left = rect.left + window.scrollX;
        
        // Adjust if tooltip goes off screen
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 20;
        }
        
        if (top + tooltipRect.height > window.innerHeight + window.scrollY) {
            top = rect.top + window.scrollY - tooltipRect.height - 10;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }
    
    // Close Tooltip
    function closeTooltip() {
        if (activeTooltip) {
            activeTooltip.classList.remove('active');
            setTimeout(() => {
                if (activeTooltip && activeTooltip.parentNode) {
                    activeTooltip.parentNode.removeChild(activeTooltip);
                }
                activeTooltip = null;
            }, 300);
        }
    }
    
    // Toggle Modal
    function toggleModal() {
        if (isModalactive) {
            closeModal();
        } else {
            activeModal();
        }
    }
    
    // active Modal
    function activeModal() {
        const modal = document.getElementById('footer-modal');
        const overlay = document.getElementById('footer-modal-overlay');
        const btn = document.getElementById('footer-info-btn');
        
        if (modal && overlay && btn) {
            modal.classList.add('active');
            overlay.classList.add('active');
            btn.style.display = 'none';
            isModalactive = true;
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Re-initialize tooltips when modal actives
            setTimeout(initializeTooltips, 100);
        }
		
		 document.body.classList.add('footer-modal-active');
    }
    
    // Close Modal
    function closeModal() {
        const modal = document.getElementById('footer-modal');
        const overlay = document.getElementById('footer-modal-overlay');
        const btn = document.getElementById('footer-info-btn');
        const backToTopBtn = document.getElementById('back-to-top-btn');
        
        if (modal && overlay && btn) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
            
            // Hide back to top button
            if (backToTopBtn) {
                backToTopBtn.classList.remove('active');
            }
            
            // Close any active tooltip
            closeTooltip();
            
            // Wait for animation to complete
            setTimeout(() => {
                btn.style.display = 'flex';
            }, 400);
            
            isModalactive = false;
            
            // Re-enable body scroll
            document.body.style.overflow = '';
        }
		
		document.body.classList.remove('modal-active');
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
        
        // Close any active tooltip when switching tabs
        closeTooltip();
        
        // Scroll to top when changing tab
        const modalContent = document.querySelector('.footer-modal-content');
        if (modalContent) {
            modalContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Re-initialize tooltips for new tab content
        setTimeout(initializeTooltips, 100);
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();