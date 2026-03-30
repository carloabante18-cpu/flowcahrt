// --- CHART SYSTEM ---
let bookingChart = null;
let currentChartType = 'line';

// Initialize booking chart
function initializeBookingChart() {
    const ctx = document.getElementById('bookingChart');
    if (!ctx) return;

    // Sample data for weekly bookings
    const chartData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Bookings',
            data: [12, 19, 15, 25, 22, 30, 28],
            borderColor: '#f3961c',
            backgroundColor: currentChartType === 'line' ? 'rgba(243, 150, 28, 0.1)' : 'rgba(243, 150, 28, 0.6)',
            borderWidth: 2,
            fill: currentChartType === 'line',
            tension: 0.4
        }, {
            label: 'Revenue (₱1000s)',
            data: [18, 24, 20, 35, 30, 45, 42],
            borderColor: '#3b141c',
            backgroundColor: currentChartType === 'line' ? 'rgba(59, 20, 28, 0.1)' : 'rgba(59, 20, 28, 0.6)',
            borderWidth: 2,
            fill: currentChartType === 'line',
            tension: 0.4
        }]
    };

    const config = {
        type: currentChartType,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(59, 20, 28, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#f3961c',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.datasetIndex === 1) {
                                    label += '₱' + context.parsed.y + 'K';
                                } else {
                                    label += context.parsed.y + ' bookings';
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };

    // Destroy existing chart if it exists
    if (bookingChart) {
        bookingChart.destroy();
    }

    // Create new chart
    bookingChart = new Chart(ctx, config);
    console.log('Booking chart initialized with type:', currentChartType);
}

// Change chart type
function changeChartType(type) {
    currentChartType = type;
    
    // Update button styles
    const lineBtn = document.getElementById('line-chart-btn');
    const barBtn = document.getElementById('bar-chart-btn');
    
    if (type === 'line') {
        lineBtn.style.background = '#f3961c';
        lineBtn.style.color = 'white';
        barBtn.style.background = '#e9ecef';
        barBtn.style.color = '#666';
    } else {
        barBtn.style.background = '#f3961c';
        barBtn.style.color = 'white';
        lineBtn.style.background = '#e9ecef';
        lineBtn.style.color = '#666';
    }
    
    // Reinitialize chart with new type
    initializeBookingChart();
}

// Update chart with real data (this can be called when new bookings are made)
function updateBookingChart() {
    if (!bookingChart) return;
    
    // Get actual booking data from localStorage
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const today = new Date();
    const weekData = [0, 0, 0, 0, 0, 0, 0];
    
    // Count bookings for each day of the current week
    reservations.forEach(reservation => {
        const bookingDate = new Date(reservation.date);
        const dayOfWeek = bookingDate.getDay();
        const daysDiff = Math.floor((today - bookingDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0 && daysDiff < 7) {
            weekData[dayOfWeek] += 1;
        }
    });
    
    // Update chart data
    bookingChart.data.datasets[0].data = weekData;
    bookingChart.update();
    
    console.log('Chart updated with real booking data');
}

// --- GUEST SEARCH FUNCTIONALITY ---
function searchGuests(searchTerm) {
    clearGuestHighlights(); // Always clear previous highlights first

    if (!searchTerm.trim()) {
        return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const tableBody = document.getElementById('confirmed-guests-table-body');

    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    let foundGuest = null;

    // Find the first matching guest only
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const nameCell = row.cells[0]?.textContent?.toLowerCase();
        const emailCell = row.cells[1]?.textContent?.toLowerCase();
        const phoneCell = row.cells[2]?.textContent?.toLowerCase();
        const roomTypeCell = row.cells[3]?.textContent?.toLowerCase();

        if (nameCell?.includes(searchTermLower) ||
            emailCell?.includes(searchTermLower) ||
            phoneCell?.includes(searchTermLower) ||
            roomTypeCell?.includes(searchTermLower)) {
            foundGuest = row;
            break; // Stop after finding first match
        }
    }

    // Apply highlight and scroll to the found guest
    if (foundGuest) {
        highlightGuest(foundGuest, searchTerm);
        setTimeout(() => {
            foundGuest.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            showGuestSearchResult(foundGuest, searchTerm);
        }, 100);
    } else {
        showNoGuestResults(searchTerm);
    }
}

function highlightGuest(guestRow, searchTerm) {
    // Add highlight class
    guestRow.classList.add('guest-search-highlight');
    
    // Apply subtle floating highlight styles
    guestRow.style.position = 'relative';
    guestRow.style.zIndex = '10';
    guestRow.style.backgroundColor = 'rgba(243, 150, 28, 0.08)'; // Very subtle orange background
    guestRow.style.border = '1px solid rgba(243, 150, 28, 0.3)'; // Light orange border
    guestRow.style.boxShadow = '0 4px 12px rgba(243, 150, 28, 0.15)'; // Subtle shadow
    guestRow.style.transform = 'translateY(-2px)'; // Slight lift effect
    guestRow.style.transition = 'all 0.3s ease';
    
    // Highlight only the guest name cell
    const nameCell = guestRow.cells[0];
    if (nameCell) {
        nameCell.style.backgroundColor = 'rgba(243, 150, 28, 0.2)';
        nameCell.style.color = '#3b141c';
        nameCell.style.fontWeight = 'bold';
        nameCell.style.borderRadius = '4px';
        nameCell.style.padding = '4px 8px';
    }
    
    // Subtle pulse animation
    let pulses = 0;
    const pulseInterval = setInterval(() => {
        if (pulses >= 3) {
            clearInterval(pulseInterval);
            return;
        }
        
        if (pulses % 2 === 0) {
            guestRow.style.boxShadow = '0 6px 16px rgba(243, 150, 28, 0.25)';
            guestRow.style.transform = 'translateY(-3px)';
        } else {
            guestRow.style.boxShadow = '0 4px 12px rgba(243, 150, 28, 0.15)';
            guestRow.style.transform = 'translateY(-2px)';
        }
        pulses++;
    }, 600);
}

function clearGuestHighlights() {
    const highlightedRows = document.querySelectorAll('.guest-search-highlight');
    
    highlightedRows.forEach(row => {
        row.classList.remove('guest-search-highlight');
        row.style.position = '';
        row.style.zIndex = '';
        row.style.backgroundColor = '';
        row.style.border = '';
        row.style.boxShadow = '';
        row.style.transform = '';
        
        // Clear guest name cell highlight
        const nameCell = row.cells[0];
        if (nameCell) {
            nameCell.style.backgroundColor = '';
            nameCell.style.color = '';
            nameCell.style.fontWeight = '';
            nameCell.style.borderRadius = '';
            nameCell.style.padding = '';
        }
    });
}

function showGuestSearchResult(guestRow, searchTerm) {
    const guestName = guestRow.cells[0]?.textContent;
    const email = guestRow.cells[1]?.textContent;
    const roomType = guestRow.cells[3]?.textContent;
    
    Swal.fire({
        icon: 'success',
        title: 'Guest Found!',
        html: `
            <div style="text-align: left;">
                <div style="margin-bottom: 8px;"><strong>Name:</strong> ${guestName}</div>
                <div style="margin-bottom: 8px;"><strong>Email:</strong> ${email}</div>
                <div style="margin-bottom: 8px;"><strong>Room Type:</strong> ${roomType}</div>
                <div style="font-size: 0.9rem; color: #666; margin-top: 10px;">Guest highlighted below 👇</div>
            </div>
        `,
        timer: 2500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
}

function showNoGuestResults(searchTerm) {
    Swal.fire({
        icon: 'warning',
        title: 'No Guest Found',
        text: `No guest matching "${searchTerm}" was found`,
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
}

// Add Enter key support for guest search
document.addEventListener('DOMContentLoaded', function() {
    const guestSearchBar = document.getElementById('guest-search-bar');
    if (guestSearchBar) {
        guestSearchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchGuests(this.value);
            }
        });
    }
});

// --- ROOM SEARCH FUNCTIONALITY ---
function searchRooms(searchTerm) {
    clearRoomHighlights(); // Always clear previous highlights first

    if (!searchTerm.trim()) {
        return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const tableBody = document.getElementById('rooms-table-body');

    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    let foundRoom = null;

    // Find the first matching room only
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const roomNoCell = row.cells[0]?.textContent?.toLowerCase();
        const roomTypeCell = row.cells[1]?.textContent?.toLowerCase();
        const guestNameCell = row.cells[5]?.textContent?.toLowerCase();

        if (roomNoCell?.includes(searchTermLower) ||
            roomTypeCell?.includes(searchTermLower) ||
            guestNameCell?.includes(searchTermLower)) {
            foundRoom = row;
            break; // Stop after finding first match
        }
    }

    // Apply highlight and scroll to the found room
    if (foundRoom) {
        highlightRoom(foundRoom, searchTerm);
        setTimeout(() => {
            foundRoom.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            showRoomSearchResult(foundRoom, searchTerm);
        }, 100);
    } else {
        showNoRoomResults(searchTerm);
    }
}

function highlightRoom(roomRow, searchTerm) {
    // Add highlight class
    roomRow.classList.add('room-search-highlight');
    
    // Apply subtle floating highlight styles
    roomRow.style.position = 'relative';
    roomRow.style.zIndex = '10';
    roomRow.style.backgroundColor = 'rgba(243, 150, 28, 0.08)'; // Very subtle orange background
    roomRow.style.border = '1px solid rgba(243, 150, 28, 0.3)'; // Light orange border
    roomRow.style.boxShadow = '0 4px 12px rgba(243, 150, 28, 0.15)'; // Subtle shadow
    roomRow.style.transform = 'translateY(-2px)'; // Slight lift effect
    roomRow.style.transition = 'all 0.3s ease';
    
    // Highlight only the room number cell
    const roomNoCell = roomRow.cells[0];
    if (roomNoCell) {
        roomNoCell.style.backgroundColor = 'rgba(243, 150, 28, 0.2)';
        roomNoCell.style.color = '#3b141c';
        roomNoCell.style.fontWeight = 'bold';
        roomNoCell.style.borderRadius = '4px';
        roomNoCell.style.padding = '4px 8px';
    }
    
    // Subtle pulse animation
    let pulses = 0;
    const pulseInterval = setInterval(() => {
        if (pulses >= 3) {
            clearInterval(pulseInterval);
            return;
        }
        
        if (pulses % 2 === 0) {
            roomRow.style.boxShadow = '0 6px 16px rgba(243, 150, 28, 0.25)';
            roomRow.style.transform = 'translateY(-3px)';
        } else {
            roomRow.style.boxShadow = '0 4px 12px rgba(243, 150, 28, 0.15)';
            roomRow.style.transform = 'translateY(-2px)';
        }
        pulses++;
    }, 600);
}

function clearRoomHighlights() {
    const highlightedRows = document.querySelectorAll('.room-search-highlight');
    
    highlightedRows.forEach(row => {
        row.classList.remove('room-search-highlight');
        row.style.position = '';
        row.style.zIndex = '';
        row.style.backgroundColor = '';
        row.style.border = '';
        row.style.boxShadow = '';
        row.style.transform = '';
        
        // Clear room number cell highlight
        const roomNoCell = row.cells[0];
        if (roomNoCell) {
            roomNoCell.style.backgroundColor = '';
            roomNoCell.style.color = '';
            roomNoCell.style.fontWeight = '';
            roomNoCell.style.borderRadius = '';
            roomNoCell.style.padding = '';
        }
    });
}

function showRoomSearchResult(roomRow, searchTerm) {
    const roomNo = roomRow.cells[0]?.textContent;
    const roomType = roomRow.cells[1]?.textContent;
    const status = roomRow.cells[4]?.textContent;
    
    Swal.fire({
        icon: 'success',
        title: 'Room Found!',
        html: `
            <div style="text-align: left;">
                <div style="margin-bottom: 8px;"><strong>Room:</strong> ${roomNo}</div>
                <div style="margin-bottom: 8px;"><strong>Type:</strong> ${roomType}</div>
                <div style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: ${getStatusColor(status)}">${status}</span></div>
                <div style="font-size: 0.9rem; color: #666; margin-top: 10px;">Room highlighted below 👇</div>
            </div>
        `,
        timer: 2500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
}

function showNoRoomResults(searchTerm) {
    Swal.fire({
        icon: 'warning',
        title: 'No Room Found',
        text: `No room matching "${searchTerm}" was found`,
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
}

function getStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'available': return '#28a745';
        case 'occupied': return '#dc3545';
        case 'under maintenance': return '#ffc107';
        default: return '#666';
    }
}

// Add Enter key support for room search
document.addEventListener('DOMContentLoaded', function() {
    const roomSearchBar = document.getElementById('room-search-bar');
    if (roomSearchBar) {
        roomSearchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchRooms(this.value);
            }
        });
    }
});

// --- TEST FUNCTION FOR DEBUGGING ---
window.testGcashPayment = function() {
    console.log('🧪 Testing GCash payment flow...');
    
    const testFormData = {
        name: 'Test GCash User',
        email: 'test@gcash.com',
        phone: '09123456789',
        room: 'Standard Room - ₱1,500 / night',
        date: '2026-03-28',
        departure: '2026-03-30',
        days: '2',
        total: '₱3,000',
        breakdown: '2 night(s) × ₱1,500/night'
    };
    
    // Simulate GCash payment with test receipt
    showGcashWithUpload(testFormData);
    
    console.log('✅ GCash payment test initiated!');
    console.log('💡 Upload any image when prompted to test the full flow.');
    
    Swal.fire({
        title: 'GCash Test Started!',
        text: 'A test GCash payment form has been opened. Upload any image to test the complete flow.',
        icon: 'info',
        confirmButtonText: 'OK'
    });
};

// Auto-add test button when admin is logged in
const addTestButton = () => {
    // Test button removed - GCash payment is now working properly
    console.log('🎉 GCash payment system is ready!');
};

// --- MOBILE DETECTION & AUTO-OPTIMIZATION ---
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768 && 'ontouchstart' in window);
}

// Apply mobile optimizations automatically
function applyMobileOptimizations() {
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
        
        // Optimize images for mobile
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
            if (img.width > 300) {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            }
        });
        
        // Optimize animations for mobile
        const animatedElements = document.querySelectorAll('[class*="animation"], [class*="float"]');
        animatedElements.forEach(el => {
            el.style.animationDuration = '0.3s';
        });
        
        // Add touch-friendly interactions
        const clickableElements = document.querySelectorAll('button, .nav-link, .room-card, .gallery-item');
        clickableElements.forEach(el => {
            el.style.minHeight = '44px';
            el.style.minWidth = '44px';
        });
        
        console.log('📱 Mobile optimizations applied');
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
    applyMobileOptimizations();
    
    // Initialize contact form on home page
    initializeContactForm();
    
    // Initialize notification system
    console.log('Page loaded - initializing contact form and notifications...');
    updateNotificationBadge();
    
    // Add test button for debugging (remove in production)
    setTimeout(() => {
        if (document.getElementById('notification-badge')) {
            console.log('Notification system ready! You can test by typing testNotification() in console.');
        }
    }, 1000);
});

// Run on resize
window.addEventListener('resize', () => {
    setTimeout(applyMobileOptimizations, 100);
});

// --- SELECTORS ---
const showPopupBtn = document.querySelector(".login-btn");
const formPopup = document.querySelector(".form-popup");
const hidePopupBtn = document.querySelector(".form-popup .close-btn");
const loginSignupLinks = document.querySelectorAll(".form-box .bottom-link a");
const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

// Slider & Admin Selectors
const slider = document.getElementById('testimonial-slider');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');
const loginForm = document.querySelector(".login form");
const mainContent = document.querySelector("main");
const header = document.querySelector("header");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logout-btn");

// --- LIGHTBOX DYNAMIC SETUP ---
let lightbox = document.getElementById("lightbox");
if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <span class="close-lightbox">&times;</span>
        <img class="lightbox-content" id="lightbox-img" src="">
    `;
    document.body.appendChild(lightbox);
}
const lightboxImg = document.getElementById("lightbox-img");

// --- POPUP DISPLAY LOGIC ---
if (showPopupBtn) {
    showPopupBtn.addEventListener("click", () => document.body.classList.add("show-popup"));
}
if (hidePopupBtn) {
    hidePopupBtn.addEventListener("click", () => {
        document.body.classList.remove("show-popup");
        if(formPopup) formPopup.classList.remove("show-signup");
    });
}
loginSignupLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        link.id === "signup-link" ? formPopup.classList.add("show-signup") : formPopup.classList.remove("show-signup");
    });
});

// --- PAGE STATE PERSISTENCE ---
function savePageState(state) {
    localStorage.setItem('jopats_page_state', JSON.stringify(state));
}

function loadPageState() {
    const savedState = localStorage.getItem('jopats_page_state');
    return savedState ? JSON.parse(savedState) : null;
}

function clearPageState() {
    localStorage.removeItem('jopats_page_state');
}

// --- ADMIN LOGIN ---
if(loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const usernameInput = loginForm.querySelector("input[type='text']").value;
        const passwordInput = loginForm.querySelector("input[type='password']").value;
        const formContent = loginForm.closest(".form-content");

        if (usernameInput === "carlo" && passwordInput === "carlo") {
            // Save admin state before showing dashboard
            savePageState({
                isAdmin: true,
                currentPage: 'dashboard',
                timestamp: new Date().toISOString()
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Welcome Back, Admin Carlo!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            setTimeout(() => {
                document.body.classList.remove("show-popup");
                if(header) header.style.display = "none";
                if(mainContent) mainContent.style.display = "none";
                if(dashboard) {
                    dashboard.style.display = "flex";
                    document.body.style.overflow = "hidden"; 
                    
                    // Initialize dashboard state - show dashboard section and highlight nav
                    initializeDashboardState();
                    
                    // Add test button for debugging
                    addTestButton();
                }
            }, 2000);
        } else {
            if (formContent) {
                formContent.classList.add("shake-error");
                setTimeout(() => formContent.classList.remove("shake-error"), 500);
            }
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Invalid Username or Password!' });
        }
    });
}

// --- INITIALIZE DASHBOARD STATE ---
function initializeDashboardState() {
    // Hide all admin sections first
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show dashboard section
    const dashboardSection = document.getElementById('section-dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
    }
    
    // Reset all nav items to default state
    document.querySelectorAll('.admin-nav-item').forEach(nav => {
        nav.style.background = 'transparent';
        nav.style.color = 'white';
        nav.classList.remove('active');
    });
    
    // Highlight dashboard nav item
    const dashboardNav = document.getElementById('nav-dashboard');
    if (dashboardNav) {
        dashboardNav.style.background = '#f3961c';
        dashboardNav.style.color = '#3b141c';
        dashboardNav.classList.add('active');
    }
    
    // Update counters and notifications
    updateReservationCounter();
    updateDashboardRoomStatistics();
    updateDashboardBookingStatistics();
    startDashboardClock();
    
    // Refresh notification system now that admin is logged in
    console.log('Admin logged in - refreshing notifications...');
    updateNotificationBadge();
    updateNotificationList();
    
    // Initialize booking chart
    setTimeout(() => {
        initializeBookingChart();
    }, 500);
}

// --- LOGOUT ---
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b141c',
            confirmButtonText: 'Yes, Logout!'
        }).then((result) => { 
            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Logging out...',
                    html: '<div style="display: flex; align-items: center; justify-content: center;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b141c;"></i><span style="margin-left: 10px;">Please wait...</span></div>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });

                // Simulate logout process with validation
                setTimeout(() => {
                    // Clear admin state before reloading
                    clearPageState();
                    
                    // Additional validation checks
                    console.log('Performing logout validation...');
                    console.log('Clearing session data...');
                    console.log('Resetting user permissions...');
                    
                    // Show success message briefly before redirecting
                    Swal.fire({
                        title: 'Logged Out Successfully!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        timerProgressBar: true
                    }).then(() => {
                        // Reload to go to home page
                        window.location.reload(); 
                    });
                }, 2000); // 2 second loading time
            }
        });
    });
}

// --- MOBILE MENU ---
if (menuOpenButton) menuOpenButton.addEventListener("click", () => document.body.classList.toggle("show-mobile-menu"));
if (menuCloseButton) menuCloseButton.addEventListener("click", () => document.body.classList.remove("show-mobile-menu"));

// --- TESTIMONIAL SLIDER ---
const scrollAmount = 380; 
if(nextBtn && prevBtn && slider) {
    nextBtn.addEventListener('click', () => slider.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
    prevBtn.addEventListener('click', () => slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
}

// --- GALLERY LIGHTBOX ---
document.addEventListener("pointerup", (e) => {
    const clickedImg = e.target.closest(".gallery-item img");
    if (clickedImg) {
        lightbox.style.display = "flex";
        lightboxImg.src = clickedImg.src;
        document.body.style.overflow = "hidden"; 
        setTimeout(() => lightbox.classList.add("active"), 10);
        return;
    }
    if (e.target.classList.contains("close-lightbox") || e.target.id === "lightbox") {
        lightbox.classList.remove("active");
        setTimeout(() => {
            lightbox.style.display = "none";
            if (dashboard && dashboard.style.display !== "flex") document.body.style.overflow = "auto";
        }, 300);
    }
});

// --- GALLERY NAVIGATION ARROWS ---
document.addEventListener('DOMContentLoaded', function() {
    const galleryWrapper = document.querySelector('.gallery-wrapper');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    
    if (galleryWrapper && prevBtn && nextBtn) {
        // Scroll amount (width of one gallery item + gap)
        const scrollAmount = 340; // 320px width + 20px gap
        
        prevBtn.addEventListener('click', () => {
            // Pause any ongoing animation
            galleryWrapper.style.animationPlayState = 'paused';
            
            // Scroll left
            galleryWrapper.scrollBy({ 
                left: -scrollAmount, 
                behavior: 'smooth' 
            });
            
            // Resume animation after 3 seconds
            setTimeout(() => {
                galleryWrapper.style.animationPlayState = 'running';
            }, 3000);
        });
        
        nextBtn.addEventListener('click', () => {
            // Pause any ongoing animation
            galleryWrapper.style.animationPlayState = 'paused';
            
            // Scroll right
            galleryWrapper.scrollBy({ 
                left: scrollAmount, 
                behavior: 'smooth' 
            });
            
            // Resume animation after 3 seconds
            setTimeout(() => {
                galleryWrapper.style.animationPlayState = 'running';
            }, 3000);
        });
        
        // Show/hide arrows based on scroll position
        function updateArrowVisibility() {
            const maxScroll = galleryWrapper.scrollWidth - galleryWrapper.clientWidth;
            
            // Hide prev arrow if at start
            if (galleryWrapper.scrollLeft <= 0) {
                prevBtn.style.opacity = '0.5';
                prevBtn.style.pointerEvents = 'none';
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
            }
            
            // Hide next arrow if at end
            if (galleryWrapper.scrollLeft >= maxScroll - 1) {
                nextBtn.style.opacity = '0.5';
                nextBtn.style.pointerEvents = 'none';
            } else {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
            }
        }
        
        // Initial check
        updateArrowVisibility();
        
        // Update on scroll
        galleryWrapper.addEventListener('scroll', updateArrowVisibility);
        
        // Update on window resize
        window.addEventListener('resize', updateArrowVisibility);
        
        // Pause animation when hovering over gallery
        galleryWrapper.addEventListener('mouseenter', () => {
            galleryWrapper.style.animationPlayState = 'paused';
        });
        
        // Resume animation when mouse leaves
        galleryWrapper.addEventListener('mouseleave', () => {
            galleryWrapper.style.animationPlayState = 'running';
        });
    }
});

// --- CALCULATION FUNCTION FOR RESERVATION ---
function calculateDaysAndTotal() {
    const arrivalDate = document.getElementById('res-date');
    const departureDate = document.getElementById('res-departure');
    const daysField = document.getElementById('res-days');
    const totalField = document.getElementById('res-total');
    const breakdownField = document.getElementById('res-breakdown');
    const roomSelect = document.getElementById('res-room');
    
    // Calculate days
    if (arrivalDate.value && departureDate.value) {
        const arrival = new Date(arrivalDate.value);
        const departure = new Date(departureDate.value);
        const timeDiff = departure - arrival;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 0) {
            daysField.value = daysDiff;
        } else {
            daysField.value = 0;
            totalField.textContent = '₱0';
            breakdownField.textContent = 'Departure must be after arrival';
            return;
        }
    } else {
        daysField.value = 0;
        totalField.textContent = '₱0';
        breakdownField.textContent = 'Select dates and room';
        return;
    }
    
    // Calculate total
    const days = parseInt(daysField.value) || 0;
    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    const pricePerNight = parseInt(selectedOption?.dataset?.price) || 0;
    const roomName = selectedOption?.value || '';
    
    if (days > 0 && pricePerNight > 0) {
        const total = days * pricePerNight;
        totalField.textContent = `₱${total.toLocaleString()}`;
        breakdownField.textContent = `${days} night(s) × ₱${pricePerNight.toLocaleString()}/night`;
    } else {
        totalField.textContent = '₱0';
        breakdownField.textContent = days > 0 ? 'Select a room' : 'Select dates and room';
    }
}

// Make function globally accessible for SweetAlert2
window.calculateDaysAndTotal = calculateDaysAndTotal;

// --- ROOM AVAILABILITY DISPLAY FOR RESERVATION FORM ---
function displayRoomAvailability() {
    const rooms = loadRooms();
    const availabilityInfo = document.getElementById('room-availability-info');
    const roomSelect = document.getElementById('res-room');
    
    if (!availabilityInfo || !roomSelect) return;
    
    // Calculate room statistics by type
    const roomStats = {
        'Standard Room': { total: 0, available: 0, occupied: 0, maintenance: 0 },
        'Deluxe Room': { total: 0, available: 0, occupied: 0, maintenance: 0 },
        'Dormitory Room': { total: 0, available: 0, occupied: 0, maintenance: 0 }
    };
    
    rooms.forEach(room => {
        if (roomStats[room.type]) {
            roomStats[room.type].total++;
            if (room.status === 'Available') {
                roomStats[room.type].available++;
            } else if (room.status === 'Occupied') {
                roomStats[room.type].occupied++;
            } else if (room.status === 'Under Maintenance') {
                roomStats[room.type].maintenance++;
            }
        }
    });
    
    // Create availability display HTML
    let availabilityHTML = '<div style="font-weight: bold; margin-bottom: 8px; color: #3b141c;">🏠 Room Availability:</div>';
    
    Object.keys(roomStats).forEach(roomType => {
        const stats = roomStats[roomType];
        const availabilityColor = stats.available > 0 ? '#28a745' : '#dc3545';
        const roomIcon = roomType === 'Standard Room' ? '🛏️' : roomType === 'Deluxe Room' ? '🏨' : '🏠';
        
        availabilityHTML += `
            <div style="margin-bottom: 6px; padding: 6px 8px; background: white; border-radius: 4px; border-left: 3px solid ${availabilityColor};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 500;">${roomIcon} ${roomType}</span>
                    <span style="color: ${availabilityColor}; font-weight: bold;">${stats.available} vacant / ${stats.total} total</span>
                </div>
                ${stats.available === 0 ? '<div style="color: #dc3545; font-size: 0.75rem; margin-top: 2px;">❌ No vacant rooms available</div>' : ''}
                ${stats.available > 0 && stats.available <= 2 ? '<div style="color: #ffc107; font-size: 0.75rem; margin-top: 2px;">⚠️ Only ' + stats.available + ' room(s) left!</div>' : ''}
            </div>
        `;
    });
    
    availabilityInfo.innerHTML = availabilityHTML;
    
    // Update room select options based on availability
    const options = roomSelect.querySelectorAll('option');
    options.forEach(option => {
        if (option.value) {
            const roomType = option.value;
            const availableCount = roomStats[roomType]?.available || 0;
            
            if (availableCount === 0) {
                option.disabled = true;
                option.style.color = '#999';
                option.textContent = `${option.textContent.split('(')[0].trim()} (UNAVAILABLE)`;
            } else {
                option.disabled = false;
                option.style.color = '';
                const originalText = option.textContent.split('(')[0].trim();
                option.textContent = `${originalText} (${availableCount} available)`;
            }
        }
    });
}

// --- ENHANCED RESERVATION SYSTEM ---
const reserveBtn = document.getElementById("reserve-now-btn");

if (reserveBtn) {
    reserveBtn.addEventListener("click", async () => {
        const { value: formValues } = await Swal.fire({
            title: '<h2 style="color: #3b141c; margin-bottom: 0;">🌊 Jopat\'s Resort</h2><p style="font-size: 0.8rem; color: #777;">Complete Reservation Details</p>',
            width: '700px',
            height: '600px',
            heightAuto: false,
            scrollbarPadding: true,
            showConfirmButton: true,
            showCloseButton: true,
            html: `
                <style>
                    @keyframes slideInFromTop {
                        from { opacity: 0; transform: translateY(-20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes slideInFromLeft {
                        from { opacity: 0; transform: translateX(-20px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes slideInFromRight {
                        from { opacity: 0; transform: translateX(20px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes fadeInScale {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                        20%, 40%, 60%, 80% { transform: translateX(5px); }
                    }
                    @keyframes buttonGlow {
                        0% { box-shadow: 0 0 5px rgba(243, 150, 28, 0.5); }
                        50% { box-shadow: 0 0 20px rgba(243, 150, 28, 0.8), 0 0 30px rgba(243, 150, 28, 0.4); }
                        100% { box-shadow: 0 0 5px rgba(243, 150, 28, 0.5); }
                    }
                    
                    .form-field-animated {
                        animation: slideInFromTop 0.6s ease-out forwards;
                        opacity: 0;
                    }
                    
                    .form-field-left {
                        animation: slideInFromLeft 0.6s ease-out forwards;
                        opacity: 0;
                    }
                    
                    .form-field-right {
                        animation: slideInFromRight 0.6s ease-out forwards;
                        opacity: 0;
                    }
                    
                    .form-field-scale {
                        animation: fadeInScale 0.5s ease-out forwards;
                        opacity: 0;
                    }
                    
                    .swal2-input:focus, .swal2-textarea:focus, .swal2-select:focus {
                        border-color: #f3961c !important;
                        box-shadow: 0 0 0 3px rgba(243, 150, 28, 0.1) !important;
                        transform: translateY(-2px);
                        transition: all 0.3s ease;
                    }
                    
                    .swal2-input:hover, .swal2-textarea:hover, .swal2-select:hover {
                        border-color: #3b141c !important;
                        transform: translateY(-1px);
                        transition: all 0.3s ease;
                    }
                    
                    .animated-total-section {
                        animation: fadeInScale 0.8s ease-out 0.5s forwards;
                        opacity: 0;
                    }
                    
                    .pulse-animation {
                        animation: pulse 2s infinite;
                    }
                    
                    .animated-confirm-btn {
                        animation: buttonGlow 2s infinite;
                        transition: all 0.3s ease;
                    }
                    
                    .animated-confirm-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(59, 20, 28, 0.3);
                    }
                    
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                </style>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; padding: 10px; max-height: 450px; overflow-y: auto; padding-right: 10px;" id="reservation-form-container">
                    <div style="grid-column: span 2;" class="form-field-animated" style="animation-delay: 0.1s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">Full Name</label>
                        <input id="res-name" class="swal2-input" placeholder="Juan Dela Cruz" style="margin: 5px 0 0 0; width: 100%;">
                    </div>
                    <div class="form-field-left" style="animation-delay: 0.2s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">Email Address</label>
                        <input id="res-email" type="email" class="swal2-input" placeholder="juan@email.com" style="margin: 5px 0 0 0; width: 100%;">
                    </div>
                    <div class="form-field-right" style="animation-delay: 0.3s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">Phone Number</label>
                        <input id="res-phone" type="tel" class="swal2-input" placeholder="09xxxxxxxxx" style="margin: 5px 0 0 0; width: 100%;">
                    </div>
                    <div style="grid-column: span 2;" class="form-field-animated" style="animation-delay: 0.4s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">Home Address</label>
                        <input id="res-address" class="swal2-input" placeholder="Street, Brgy, City, Province" style="margin: 5px 0 0 0; width: 100%;">
                    </div>
                    <div class="form-field-left" style="animation-delay: 0.5s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">Arrival Date</label>
                        <input id="res-date" type="date" class="swal2-input" style="margin: 5px 0 0 0; width: 100%;" onchange="calculateDaysAndTotal()">
                    </div>
                    <div class="form-field-right" style="animation-delay: 0.6s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">Departure Date</label>
                        <input id="res-departure" type="date" class="swal2-input" style="margin: 5px 0 0 0; width: 100%;" onchange="calculateDaysAndTotal()">
                    </div>
                    <div class="form-field-left" style="animation-delay: 0.7s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">No. of Guests</label>
                        <input id="res-guests" type="number" class="swal2-input" placeholder="0" min="1" style="margin: 5px 0 0 0; width: 100%;">
                    </div>
                    <div class="form-field-right" style="animation-delay: 0.8s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">Number of Days</label>
                        <input id="res-days" type="text" class="swal2-input" placeholder="0" readonly style="margin: 5px 0 0 0; width: 100%; background: #f8f9fa; color: #3b141c; font-weight: bold;">
                    </div>
                    <div style="grid-column: span 2;" class="form-field-scale" style="animation-delay: 0.9s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">Select Room Type</label>
                        <div id="room-availability-info" style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 0.8rem;">
                            <!-- Room availability will be displayed here -->
                        </div>
                        <select id="res-room" class="swal2-input" style="margin: 5px 0 0 0; width: 100%;" onchange="calculateDaysAndTotal()">
                            <option value="" disabled selected>Choose a room...</option>
                            <option value="Standard Room" data-price="1500">Standard Room P1,500 (3 available)</option>
                            <option value="Deluxe Room" data-price="2500">Deluxe Room P2,500 (3 available)</option>
                            <option value="Dormitory Room" data-price="10000">Dormitory Room P10,000 (2 available)</option>
                        </select>
                    </div>
                    <div style="grid-column: span 2; background: linear-gradient(135deg, #3b141c, #5a1f2a); padding: 15px; border-radius: 8px; margin-top: 10px;" class="animated-total-section">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="color: #fff; font-size: 0.85rem; opacity: 0.9;">Total Amount:</div>
                                <div id="res-total" style="color: #f3961c; font-size: 1.5rem; font-weight: bold;" class="pulse-animation">₱0</div>
                            </div>
                            <div style="text-align: right;">
                                <div id="res-breakdown" style="color: #fff; font-size: 0.8rem; opacity: 0.8;">Select dates and room</div>
                            </div>
                        </div>
                    </div>
                    <div style="grid-column: span 2;" class="form-field-animated" style="animation-delay: 1.0s;">
                        <label style="font-weight: bold; font-size: 0.85rem;">Special Requests / Notes</label>
                        <textarea id="res-notes" class="swal2-textarea" placeholder="Any special requests? (Optional)" style="margin: 5px 0 0 0; width: 100%; height: 80px;"></textarea>
                    </div>
                </div>
            `,
            confirmButtonText: 'Proceed to Payment →',
            confirmButtonColor: '#3b141c',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            },
            customClass: {
                confirmButton: 'animated-confirm-btn',
                input: 'animated-input'
            },
            didOpen: () => {
                // Display room availability when form opens
                displayRoomAvailability();
            },
            preConfirm: () => {
                const results = {
                    name: document.getElementById('res-name').value,
                    email: document.getElementById('res-email').value,
                    phone: document.getElementById('res-phone').value,
                    address: document.getElementById('res-address').value,
                    date: document.getElementById('res-date').value,
                    departure: document.getElementById('res-departure').value,
                    days: document.getElementById('res-days').value,
                    guests: document.getElementById('res-guests').value,
                    room: document.getElementById('res-room').value,
                    total: document.getElementById('res-total').textContent,
                    notes: document.getElementById('res-notes').value
                };
                
                // Add validation animation for empty fields
                const emptyFields = [];
                if (!results.name) {
                    document.getElementById('res-name').style.animation = 'shake 0.5s';
                    document.getElementById('res-name').style.borderColor = '#dc3545';
                    emptyFields.push('Full Name');
                }
                if (!results.email) {
                    document.getElementById('res-email').style.animation = 'shake 0.5s';
                    document.getElementById('res-email').style.borderColor = '#dc3545';
                    emptyFields.push('Email Address');
                }
                if (!results.phone) {
                    document.getElementById('res-phone').style.animation = 'shake 0.5s';
                    document.getElementById('res-phone').style.borderColor = '#dc3545';
                    emptyFields.push('Phone Number');
                }
                if (!results.date) {
                    document.getElementById('res-date').style.animation = 'shake 0.5s';
                    document.getElementById('res-date').style.borderColor = '#dc3545';
                    emptyFields.push('Arrival Date');
                }
                if (!results.departure) {
                    document.getElementById('res-departure').style.animation = 'shake 0.5s';
                    document.getElementById('res-departure').style.borderColor = '#dc3545';
                    emptyFields.push('Departure Date');
                }
                if (!results.room) {
                    document.getElementById('res-room').style.animation = 'shake 0.5s';
                    document.getElementById('res-room').style.borderColor = '#dc3545';
                    emptyFields.push('Room Type');
                } else {
                    // Check if selected room type has available rooms
                    const rooms = loadRooms();
                    const availableRooms = rooms.filter(r => r.type === results.room && r.status === 'Available');
                    
                    if (availableRooms.length === 0) {
                        document.getElementById('res-room').style.animation = 'shake 0.5s';
                        document.getElementById('res-room').style.borderColor = '#dc3545';
                        Swal.showValidationMessage(`❌ No vacant ${results.room} available. Please choose a different room type.`);
                        return false;
                    }
                }
                
                if (emptyFields.length > 0) {
                    Swal.showValidationMessage(`Please complete: ${emptyFields.join(', ')}`);
                    
                    // Reset animations after they complete
                    setTimeout(() => {
                        document.querySelectorAll('.swal2-input, .swal2-select, .swal2-textarea').forEach(field => {
                            field.style.animation = '';
                            field.style.borderColor = '';
                        });
                    }, 500);
                    
                    return false;
                }
                
                return results;
            }
        });

        if (formValues) {
            const { value: paymentChoice } = await Swal.fire({
                title: 'Select Payment Method',
                text: `Amount to Pay: ${formValues.total}`,
                showDenyButton: true,
                confirmButtonText: 'GCash / Online',
                denyButtonText: 'Pay at Resort',
                confirmButtonColor: '#0066cc',
                denyButtonColor: '#495057',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });

            if (paymentChoice) {
                showGcashWithUpload(formValues);
            } else if (paymentChoice === false) { 
                // Show loading state
                Swal.fire({
                    title: 'Sending Reservation...',
                    html: '<div style="display: flex; align-items: center; justify-content: center;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b141c;"></i><span style="margin-left: 10px;">Please wait...</span></div>',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Simulate sending process
                setTimeout(() => {
                    saveReservation(formValues, 'Pay at Resort');
                    Swal.fire({
                        title: '🎉 Reservation Successful!',
                        html: `
                            <div style="text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 15px;">✅</div>
                                <h3 style="color: #3b141c; margin-bottom: 10px;">Your reservation has been sent!</h3>
                                <p style="color: #666; margin-bottom: 20px;">We look forward to welcoming you to Jopat's Resort</p>
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: left; margin-top: 20px;">
                                    <h4 style="color: #3b141c; margin-bottom: 10px;">Reservation Details:</h4>
                                    <p><strong>Name:</strong> ${formValues.name}</p>
                                    <p><strong>Room:</strong> ${formValues.room}</p>
                                    <p><strong>Check-in:</strong> ${formValues.date}</p>
                                    <p><strong>Check-out:</strong> ${formValues.departure}</p>
                                    <p><strong>Total:</strong> ${formValues.total}</p>
                                </div>
                            </div>
                        `,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3b141c'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            resetForm();
                        }
                    });
                }, 2000); // 2 second loading time
            }
        }
    });
}

// --- GCASH FUNCTION ---
function showGcashWithUpload(formValues) {
    Swal.fire({
        title: '💳 GCash Payment',
        html: `
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideInFromBottom {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .payment-info-box {
                    animation: slideInFromBottom 0.6s ease-out;
                    background: linear-gradient(135deg, #f4f4f4, #e9ecef);
                    padding: 20px;
                    border-radius: 15px;
                    margin-bottom: 20px;
                    border: 2px solid #007dff;
                    box-shadow: 0 5px 15px rgba(0, 125, 255, 0.1);
                }
                .upload-area {
                    animation: slideInFromBottom 0.8s ease-out 0.2s both;
                    border: 2px dashed #007dff;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    background: rgba(0, 125, 255, 0.05);
                    transition: all 0.3s ease;
                }
                .upload-area:hover {
                    background: rgba(0, 125, 255, 0.1);
                    transform: translateY(-2px);
                }
                .animated-qr-code {
                    animation: pulse 2s infinite;
                    margin: 10px auto;
                    display: block;
                }
            </style>
            <div class="payment-info-box">
                <p style="margin: 0; color: #555; font-weight: bold;">Total Amount:</p>
                <h2 style="margin: 5px 0; color: #3b141c; font-size: 1.8rem;">${formValues.total}</h2>
                <hr style="margin: 10px 0; border: 1px solid #ddd;">
                <p style="margin: 10px 0 0; font-size: 0.9rem; color: #666;">Send payment to:</p>
                <h3 style="margin: 5px 0; color: #007dff; font-size: 1.2rem;">📱 0912 345 6789 (CARLO A.)</h3>
                <div style="text-align: center; margin: 15px 0;">
                    <div style="width: 120px; height: 120px; background: #fff; border: 2px solid #007dff; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto;" class="animated-qr-code">
                        <span style="font-size: 3rem;">📷</span>
                    </div>
                    <p style="font-size: 0.8rem; color: #666; margin-top: 5px;">Scan QR Code or send to number above</p>
                </div>
            </div>
            <div class="upload-area">
                <p style="font-size: 0.9rem; color: #007dff; font-weight: bold; margin-bottom: 10px;">📸 Upload Payment Receipt:</p>
                <input type="file" id="receipt-file" class="swal2-file" accept="image/*" style="width: 100%;">
                <p style="font-size: 0.8rem; color: #666; margin-top: 10px;">Please upload a clear screenshot of your payment confirmation</p>
            </div>
        `,
        confirmButtonText: 'Submit Receipt →',
        confirmButtonColor: '#0066cc',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        },
        preConfirm: () => {
            const fileInput = document.getElementById('receipt-file');
            if (!fileInput.files[0]) {
                Swal.showValidationMessage('Please upload your payment receipt screenshot!');
                return null;
            }
            
            // Convert image to base64 for storage
            const file = fileInput.files[0];
            console.log('📁 File selected:', file);
            
            if (!file) {
                Swal.showValidationMessage('No file selected!');
                return null;
            }
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('✅ File read successfully');
                    resolve({
                        receiptImage: e.target.result,
                        receiptName: file.name
                    });
                };
                reader.onerror = (error) => {
                    console.error('❌ Error reading file:', error);
                    reject(error);
                };
                reader.readAsDataURL(file);
            });
        }
    }).then((result) => {
        console.log('🔍 First result:', result);
        
        if (result.isConfirmed) {
            console.log('✅ User confirmed receipt upload');
            console.log('📄 Receipt data:', result.value);
            
            // Show confirmation before submitting
            Swal.fire({
                title: 'Confirm Payment Submission',
                text: 'Are you sure you want to submit this payment receipt?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#0066cc',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, Submit Payment',
                cancelButtonText: 'Cancel'
            }).then((confirmResult) => {
                console.log('🔍 Confirm result:', confirmResult);
                
                if (confirmResult.isConfirmed) {
                    console.log('✅ User confirmed payment submission');
                    console.log('💾 Saving reservation with data:', {
                        formValues,
                        receiptData: result.value
                    });
                    
                    // Save with receipt image but status remains Pending
                    saveReservationWithReceipt(formValues, 'GCash', result.value.receiptImage, result.value.receiptName);
                    
                    console.log('📝 Reservation saved, showing success message...');
                    
                    Swal.fire({
                        title: '🎉 GCash Payment Sent!',
                        html: `
                            <div style="text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 15px;">✅</div>
                                <h3 style="color: #3b141c; margin-bottom: 10px;">Your GCash payment has been sent!</h3>
                                <p style="color: #666; margin-bottom: 20px;">We look forward to welcoming you to Jopat's Resort</p>
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: left; margin-top: 20px;">
                                    <h4 style="color: #3b141c; margin-bottom: 10px;">Reservation Details:</h4>
                                    <p><strong>Name:</strong> ${formValues.name}</p>
                                    <p><strong>Room:</strong> ${formValues.room}</p>
                                    <p><strong>Check-in:</strong> ${formValues.date}</p>
                                    <p><strong>Check-out:</strong> ${formValues.departure}</p>
                                    <p><strong>Total:</strong> ${formValues.total}</p>
                                    <p><strong>Payment:</strong> GCash (Receipt Uploaded)</p>
                                </div>
                                <div style="background: #d4edda; padding: 10px; border-radius: 8px; margin-top: 15px;">
                                    <p style="margin: 0; color: #155724; font-size: 0.9rem;">📧 We will verify your payment and confirm your reservation shortly.</p>
                                </div>
                            </div>
                        `,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3b141c'
                    }).then((finalResult) => {
                        console.log('🔍 Final result:', finalResult);
                        if (finalResult.isConfirmed) {
                            console.log('🔄 Resetting form...');
                            resetForm();
                        }
                    });
                } else {
                    console.log('❌ User cancelled payment submission');
                }
            });
        } else {
            console.log('❌ User cancelled receipt upload');
        }
    }).catch((error) => {
        console.error('❌ Error in GCash payment flow:', error);
        Swal.fire({
            title: 'Error',
            text: 'Something went wrong with the payment process. Please try again.',
            icon: 'error',
            confirmButtonColor: '#3b141c'
        });
    });
}


// --- ADMIN SIDEBAR NAVIGATION ---
const adminNavItems = document.querySelectorAll(".admin-nav-item");
adminNavItems.forEach(item => {
    item.addEventListener("click", () => {
        adminNavItems.forEach(i => {
            i.classList.remove("active-nav");
            i.style.background = "transparent";
            i.style.color = "white";
        });
        item.classList.add("active-nav");
        item.style.background = "#f3961c";
        item.style.color = "#3b141c";
    });
});


// --- ADMIN SIGNUP VALIDATION ---
const signupForm = document.querySelector("#signup-form");
const SECRET_ADMIN_CODE = "JOPATS2026"; // Ang iyong secret code

if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const adminCodeInput = document.getElementById("admin-code").value;
        const policyCheckbox = document.getElementById("policy");
        const formPopup = document.querySelector(".form-popup"); // Reference sa main popup

        // 1. Check kung naka-check ang Terms & Conditions
        if (!policyCheckbox.checked) {
            Swal.fire({
                icon: 'warning',
                title: 'Wait!',
                text: 'Please agree to the Terms & Conditions.'
            });
            return;
        }

        // 2. I-verify ang Admin Secret Code
        if (adminCodeInput === SECRET_ADMIN_CODE) {
            Swal.fire({
                icon: 'success',
                title: 'Authorized!',
                text: 'Admin account has been successfully registered.',
                confirmButtonColor: '#3b141c'
            }).then(() => {
                // Ibalik sa login view pagkatapos mag-signup
                if (formPopup) formPopup.classList.remove("show-signup");
                signupForm.reset(); // I-clear ang form
            });
        } else {
            // Pag mali ang code
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: 'Invalid Admin Secret Code!'
            });
            
            // Shake effect para sa error
            const formContent = signupForm.closest(".form-content");
            if (formContent) {
                formContent.classList.add("shake-error");
                setTimeout(() => formContent.classList.remove("shake-error"), 500);
            }
        }
    });
}

// 1. SIDEBAR NAVIGATION LOGIC (Dashboard vs Settings)
document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', function() {
        // Itago lahat ng main sections (.admin-section)
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });

        // Ipakita ang section na tumutugma sa ID (e.g., nav-settings -> section-settings)
        const targetId = this.id.replace('nav-', 'section-');
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Update dashboard statistics when dashboard is shown
            if (targetId === 'section-dashboard') {
                updateDashboardRoomStatistics();
                updateDashboardBookingStatistics();
            }
            
            // Display reservations when bookings section is shown
            if (targetId === 'section-bookings') {
                displayReservations();
            }
            
            // Display confirmed guests when guests section is shown
            if (targetId === 'section-guests') {
                displayConfirmedGuests();
            }
            
            // Display rooms when rooms section is shown
            if (targetId === 'section-rooms') {
                displayRooms();
            }
            
            // Initialize analytics charts when Business Analytics section is shown
            if (targetId === 'section-reports') {
                initializeAnalyticsCharts();
            }
        }

        // Alisin ang 'active' class sa lahat at ilipat sa clinick mong item
        document.querySelectorAll('.admin-nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Save current admin section state
        savePageState({
            isAdmin: true,
            currentPage: targetId,
            timestamp: new Date().toISOString()
        });
    });
});

// 2. SETTINGS SUB-TABS LOGIC (Resort Info, User Mgmt, etc.)
function openTab(tabName) {
    // Itago lahat ng tab content sa loob ng Settings
    var contents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < contents.length; i++) {
        contents[i].style.display = "none";
    }

    // Reset styles ng mga tab buttons
    var buttons = document.getElementsByClassName("tab-btn");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].style.borderBottom = "none";
        buttons[i].style.color = "#666";
    }

    // Ipakita ang piniling tab at lagyan ng kulay ang button
    document.getElementById(tabName).style.display = "block";
    
    // Gamitin ang event.currentTarget para siguradong tama ang maba-bagong style
    if (event && event.currentTarget) {
        event.currentTarget.style.borderBottom = "3px solid #f3961c";
        event.currentTarget.style.color = "#3b141c";
    }
}

// --- STAFF DATA PERSISTENCE ---
function saveStaffData() {
    const staffTableBody = document.getElementById('staff-table-body');
    if (staffTableBody) {
        localStorage.setItem('jopats_staff_list', staffTableBody.innerHTML);
        console.log('Staff data saved to localStorage');
    }
}

function loadStaffData() {
    const savedStaff = localStorage.getItem('jopats_staff_list');
    if (savedStaff) {
        const staffTableBody = document.getElementById('staff-table-body');
        if (staffTableBody) {
            staffTableBody.innerHTML = savedStaff;
            console.log('Staff data loaded from localStorage');
        }
    }
}

function toggleStaffModal(show) {
    document.getElementById('staffModal').style.display = show ? 'block' : 'none';
    if(!show) { // Reset fields kapag sinara
        document.getElementById('newStaffName').value = '';
        document.getElementById('newStaffAge').value = '';
        document.getElementById('newStaffAddress').value = '';
        document.getElementById('newStaffRole').value = 'Frontdesk';
        document.getElementById('newStaffPhoto').value = '';
    }
}

// STAFF MANAGEMENT (Add/Delete) - Cleaned up version
function saveNewStaff() {
    const name = document.getElementById('newStaffName').value;
    const age = document.getElementById('newStaffAge').value;
    const address = document.getElementById('newStaffAddress').value;
    const role = document.getElementById('newStaffRole').value;
    const photoInput = document.getElementById('newStaffPhoto');
    
    if(!name || !age || !address) return alert("Please fill up all required fields");
    
    // Handle photo upload
    if (photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            addStaffToTable(name, age, address, role, e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        addStaffToTable(name, age, address, role, null);
    }
}

function addStaffToTable(name, age, address, role, photoData) {
    const rowId = 'staff-' + Date.now();
    const photoCell = photoData ? 
        `<td style="padding: 10px; border-bottom: 1px solid #eee;">
            <img src="${photoData}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; cursor: pointer;" 
                 onclick="viewStaffPhoto('${photoData}', '${name}')" title="View ${name}'s photo">
        </td>` :
        `<td style="padding: 10px; border-bottom: 1px solid #eee;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: #f4f4f4; display: flex; align-items: center; justify-content: center; color: #666;">
                <i class="fas fa-user"></i>
            </div>
        </td>`;
    
    const newRow = `
        <tr id="${rowId}">
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${age}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${address}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><span style="color: #1e7e34; font-weight: bold;">${role}</span></td>
            ${photoCell}
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <i class="fas fa-eye" onclick="viewStaffPhoto('${photoData || 'null'}', '${name}')" style="cursor:pointer; color:#007bff; margin-right: 10px;" title="View Photo"></i>
                <i class="fas fa-trash-alt" onclick="deleteStaff('${rowId}')" style="cursor:pointer; color:#d9534f;" title="Delete Staff"></i>
            </td>
        </tr>`;
    
    document.getElementById('staff-table-body').insertAdjacentHTML('beforeend', newRow);
    
    // Clear form
    document.getElementById('newStaffName').value = '';
    document.getElementById('newStaffAge').value = '';
    document.getElementById('newStaffAddress').value = '';
    document.getElementById('newStaffRole').value = 'Frontdesk';
    document.getElementById('newStaffPhoto').value = '';
    
    toggleStaffModal(false);
    saveStaffData(); // Save staff data immediately
}

function deleteStaff(id) {
    if(confirm("Remove this staff?")) {
        document.getElementById(id).remove();
        saveStaffData(); // Auto-save after deletion
    }
}

function toggleStaffModal(show) {
    document.getElementById('staffModal').style.display = show ? 'block' : 'none';
}

function viewStaffPhoto(photoData, staffName) {
    if (!photoData || photoData === 'null') {
        Swal.fire({
            icon: 'info',
            title: 'No Photo',
            text: `${staffName} doesn't have a photo uploaded.`,
            confirmButtonColor: '#3b141c'
        });
        return;
    }
    
    Swal.fire({
        title: `${staffName}'s Photo`,
        html: `
            <div style="text-align: center;">
                <img src="${photoData}" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 2px solid #ddd;" alt="${staffName}">
                <p style="margin-top: 15px; color: #666;">${staffName}</p>
            </div>
        `,
        confirmButtonColor: '#3b141c',
        confirmButtonText: 'Close',
        width: '500px'
    });
}

// --- SYSTEM SETTINGS FUNCTIONS ---
function saveSystemSettings() {
    const settings = {
        resortName: document.getElementById('config-resort-name').value,
        contact: document.getElementById('config-contact').value,
        address: document.getElementById('config-address').value,
        vat: document.getElementById('config-vat').value,
        serviceCharge: document.getElementById('config-service-charge').value,
        adminEmail: document.getElementById('config-admin-email').value,
        notifyBooking: document.getElementById('notify-booking').checked
    };
    
    localStorage.setItem('jopats_system_settings', JSON.stringify(settings));
    Swal.fire('Saved!', 'System settings have been saved successfully.', 'success');
}

function loadSystemSettings() {
    const savedConfig = localStorage.getItem('jopats_config');

    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        document.getElementById('config-resort-name').value = config.resortName || 'Jopat\'s Resort & Hotel';
        document.getElementById('config-contact').value = config.contact || '';
        document.getElementById('config-address').value = config.address || 'Sitio Batuhan, Brgy. Poblacion, Oriental Mindoro';
        document.getElementById('config-vat').value = config.vat || '12';
        document.getElementById('config-service-charge').value = config.serviceCharge || '5';
        document.getElementById('config-admin-email').value = config.adminEmail || '';
        document.getElementById('notify-booking').checked = config.notifyBooking !== undefined ? config.notifyBooking : true;
    }

    // Load staff data using the dedicated function
    loadStaffData();
}

function openTab(tabName) {
    // Hide all tab contents
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => tab.style.display = 'none');
    
    // Remove active class from all tabs
    const allTabBtns = document.querySelectorAll('.tab-btn');
    allTabBtns.forEach(btn => btn.classList.remove('active-tab'));
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Add active class to selected tab button
    const selectedBtn = document.querySelector(`[onclick*="openTab('${tabName}')"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active-tab');
    }
}

// --- ROOM MANAGEMENT FUNCTIONS ---
let rooms = [];

function initializeRooms() {
    const savedRooms = localStorage.getItem('jopats_rooms');
    if (savedRooms) {
        rooms = JSON.parse(savedRooms);
    } else {
        // Initialize with sample data
        rooms = [
            { id: 1, number: '101', type: 'Standard', capacity: 4, currentOccupancy: 2, status: 'Available', guestName: '' },
            { id: 2, number: '102', type: 'Standard', capacity: 4, currentOccupancy: 1, status: 'Occupied', guestName: 'Maria Santos' },
            { id: 3, number: '103', type: 'Deluxe', capacity: 2, currentOccupancy: 2, status: 'Occupied', guestName: 'Juan Dela Cruz' },
            { id: 4, number: '104', type: 'Standard', capacity: 4, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 5, number: '105', type: 'Deluxe', capacity: 2, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 6, number: '201', type: 'Dormitory', capacity: 10, currentOccupancy: 8, status: 'Occupied', guestName: 'Family Group' },
            { id: 7, number: '202', type: 'Dormitory', capacity: 10, currentOccupancy: 0, status: 'Under Maintenance', guestName: '' },
            { id: 8, number: '203', type: 'Standard', capacity: 4, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 9, number: '204', type: 'Deluxe', capacity: 2, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 10, number: '205', type: 'Dormitory', capacity: 10, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 11, number: '206', type: 'Standard', capacity: 4, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 12, number: '207', type: 'Dormitory', capacity: 10, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 13, number: '208', type: 'Standard', capacity: 4, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 14, number: '209', type: 'Deluxe', capacity: 2, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 15, number: '210', type: 'Dormitory', capacity: 10, currentOccupancy: 0, status: 'Available', guestName: '' },
            { id: 16, number: '211', type: 'Standard', capacity: 4, currentOccupancy: 0, status: 'Available', guestName: '' }
        ];
        saveRooms();
    }
    displayRooms();
}

function saveRooms() {
    localStorage.setItem('jopats_rooms', JSON.stringify(rooms));
}

function displayRooms() {
    const tbody = document.getElementById('rooms-table-body');
    tbody.innerHTML = '';
    
    rooms.forEach(room => {
        const statusColor = room.status === 'Available' ? '#28a745' : 
                           room.status === 'Occupied' ? '#dc3545' : 
                           room.status === 'Under Maintenance' ? '#ffc107' : '#6c757d';
        
        const row = `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${room.number}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${room.type}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${room.capacity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${room.currentOccupancy}/${room.capacity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                    <span style="background: ${statusColor}; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem;">${room.status}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${room.guestName || '-'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                    <button onclick="editRoom(${room.id})" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteRoom(${room.id})" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    updateRoomStatistics();
    updateDashboardRoomStatistics();
    updateDashboardBookingStatistics();
}

function updateRoomStatistics() {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => r.status === 'Available').length;
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'Under Maintenance').length;
    
    document.getElementById('total-rooms').textContent = totalRooms;
    document.getElementById('available-rooms').textContent = availableRooms;
    document.getElementById('occupied-rooms').textContent = occupiedRooms;
    document.getElementById('maintenance-rooms').textContent = maintenanceRooms;
}

function addNewRoom() {
    Swal.fire({
        title: 'Add New Room',
        html: `
            <div style="text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Room Number:</label>
                <input type="text" id="new-room-number" placeholder="e.g., 101" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Room Type:</label>
                <select id="new-room-type" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Dormitory">Dormitory</option>
                </select>
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Capacity:</label>
                <input type="number" id="new-room-capacity" placeholder="e.g., 4" min="1" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
        `,
        confirmButtonText: 'Add Room',
        confirmButtonColor: '#2ca136',
        preConfirm: () => {
            const number = document.getElementById('new-room-number').value;
            const type = document.getElementById('new-room-type').value;
            const capacity = parseInt(document.getElementById('new-room-capacity').value);
            
            if (!number || !type || !capacity || capacity < 1) {
                Swal.showValidationMessage('Please fill in all required fields with valid capacity!');
                return false;
            }
            
            return { number, type, capacity };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newRoom = {
                id: Date.now(),
                number: result.value.number,
                type: result.value.type,
                capacity: result.value.capacity,
                currentOccupancy: 0,
                status: 'Available',
                guestName: ''
            };
            
            rooms.push(newRoom);
            saveRooms();
            displayRooms();
            
            Swal.fire('Added!', 'Room has been added successfully.', 'success');
        }
    });
}

function editRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    
    Swal.fire({
        title: 'Edit Room',
        html: `
            <div style="text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Room Number:</label>
                <input type="text" id="edit-room-number" value="${room.number}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Room Type:</label>
                <select id="edit-room-type" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                    <option value="Standard" ${room.type === 'Standard' ? 'selected' : ''}>Standard</option>
                    <option value="Deluxe" ${room.type === 'Deluxe' ? 'selected' : ''}>Deluxe</option>
                    <option value="Dormitory" ${room.type === 'Dormitory' ? 'selected' : ''}>Dormitory</option>
                </select>
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Capacity:</label>
                <input type="number" id="edit-room-capacity" value="${room.capacity}" min="1" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Status:</label>
                <select id="edit-room-status" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                    <option value="Available" ${room.status === 'Available' ? 'selected' : ''}>Available</option>
                    <option value="Occupied" ${room.status === 'Occupied' ? 'selected' : ''}>Occupied</option>
                    <option value="Under Maintenance" ${room.status === 'Under Maintenance' ? 'selected' : ''}>Under Maintenance</option>
                </select>
            </div>
        `,
        confirmButtonText: 'Update Room',
        confirmButtonColor: '#007bff',
        preConfirm: () => {
            const number = document.getElementById('edit-room-number').value;
            const type = document.getElementById('edit-room-type').value;
            const capacity = parseInt(document.getElementById('edit-room-capacity').value);
            const status = document.getElementById('edit-room-status').value;
            
            if (!number || !type || !capacity || capacity < 1) {
                Swal.showValidationMessage('Please fill in all required fields with valid capacity!');
                return false;
            }
            
            return { number, type, capacity, status };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const roomIndex = rooms.findIndex(r => r.id === id);
            if (roomIndex !== -1) {
                rooms[roomIndex] = {
                    ...rooms[roomIndex],
                    number: result.value.number,
                    type: result.value.type,
                    capacity: result.value.capacity,
                    status: result.value.status
                };
                
                saveRooms();
                displayRooms();
                
                Swal.fire('Updated!', 'Room has been updated successfully.', 'success');
            }
        }
    });
}

function deleteRoom(id) {
    Swal.fire({
        title: 'Delete Room?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            rooms = rooms.filter(r => r.id !== id);
            saveRooms();
            displayRooms();
            
            Swal.fire('Deleted!', 'Room has been deleted.', 'success');
        }
    });
}

function refreshRooms() {
    displayRooms();
    Swal.fire('Refreshed!', 'Room inventory has been updated.', 'success');
}




// --- RESERVATION SEARCH FUNCTIONALITY ---
function searchReservations(searchTerm) {
    clearReservationHighlights(); // Always clear previous highlights first

    if (!searchTerm.trim()) {
        displayReservations();
        return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const reservations = loadReservations();
    const tbody = document.getElementById('reservations-table-body');

    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Filter reservations based on search term
    const filteredReservations = reservations.filter(reservation => {
        return reservation.name.toLowerCase().includes(searchTermLower) ||
               reservation.email.toLowerCase().includes(searchTermLower) ||
               reservation.phone.includes(searchTerm) ||
               reservation.room.toLowerCase().includes(searchTermLower) ||
               reservation.status.toLowerCase().includes(searchTermLower);
    });

    if (filteredReservations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" style="text-align: center; padding: 20px;">No reservations found matching "${searchTerm}"</td></tr>`;
        return;
    }

    // Display filtered reservations
    filteredReservations.reverse().forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6; font-weight: 500;">${highlightSearchTerm(reservation.name, searchTerm)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${highlightSearchTerm(reservation.email, searchTerm)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${highlightSearchTerm(reservation.phone, searchTerm)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <span style="padding: 3px 8px; border-radius: 12px; font-size: 0.8rem;">${highlightSearchTerm(reservation.room, searchTerm)}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6; text-align: center;">${reservation.guests || '1'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${reservation.date}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${reservation.departure || 'Not set'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6; text-align: center; font-weight: bold;">${reservation.days || '0'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6; font-weight: bold; color: #2ca136;">${reservation.total || '₱0'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <span style="background: ${reservation.paymentMethod === 'GCash' ? '#0066cc' : '#495057'}; color: ${reservation.paymentMethod === 'GCash' ? '#ffffff' : '#ffffff'}; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem;">${reservation.paymentMethod || 'Unknown'}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <span style="background: ${reservation.status === 'Confirmed' ? '#e6f4ea' : '#dc3545'}; color: ${reservation.status === 'Confirmed' ? '#1e7e34' : '#ffffff'}; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem;">${reservation.status || 'Pending'}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button onclick="viewReservationDetails(${reservation.id})" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="View Details">👁️</button>
                    ${reservation.status === 'Pending' ? `<button onclick="confirmReservation(${reservation.id})" style="background: #2ca136; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="Confirm Reservation">✅</button>` : ''}
                    ${reservation.paymentMethod === 'GCash' && reservation.receiptImage ? `<button onclick="viewReceipt('${reservation.id}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="View Receipt">🧾</button>` : ''}
                    <button onclick="deleteReservation(${reservation.id})" style="background: #d9534f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="Delete Reservation">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Show search results summary
    Swal.fire({
        icon: 'success',
        title: 'Search Results',
        text: `Found ${filteredReservations.length} reservation(s) matching "${searchTerm}"`,
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
}

function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark style="background: #fff3cd; padding: 2px; border-radius: 2px;">$1</mark>');
}

function clearReservationHighlights() {
    const highlightedElements = document.querySelectorAll('mark');
    highlightedElements.forEach(element => {
        const parent = element.parentNode;
        parent.replaceChild(document.createTextNode(element.textContent), element);
        parent.normalize();
    });
}

function clearReservationSearch() {
    document.getElementById('reservation-search-bar').value = '';
    displayReservations();
    
    Swal.fire({
        icon: 'info',
        title: 'Search Cleared',
        text: 'Showing all reservations',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
}

// Add Enter key support for reservation search
document.addEventListener('DOMContentLoaded', function() {
    const reservationSearchBar = document.getElementById('reservation-search-bar');
    if (reservationSearchBar) {
        reservationSearchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchReservations(this.value);
            }
        });
    }
});

// --- RESERVATION STORAGE FUNCTIONS ---
function saveReservation(formData, paymentMethod) {
    const reservations = JSON.parse(localStorage.getItem('jopats_reservations') || '[]');
    
    const reservation = {
        id: Date.now(),
        ...formData,
        paymentMethod: paymentMethod,
        status: paymentMethod === 'Pay at Resort' ? 'Pending' : 'Pending', // All start as Pending now
        timestamp: new Date().toISOString()
    };
    
    reservations.push(reservation);
    localStorage.setItem('jopats_reservations', JSON.stringify(reservations));
    
    // Update counter if admin is logged in
    updateReservationCounter();
    
    // Update booking chart if it exists
    updateBookingChart();
}

function saveReservationWithReceipt(formData, paymentMethod, receiptImage, receiptName) {
    console.log('💾 saveReservationWithReceipt called with:', {
        paymentMethod,
        hasReceiptImage: !!receiptImage,
        receiptName,
        formData
    });
    
    const reservations = JSON.parse(localStorage.getItem('jopats_reservations') || '[]');
    
    const reservation = {
        id: Date.now(),
        ...formData,
        paymentMethod: paymentMethod,
        status: 'Pending', // Always start as Pending
        receiptImage: 'RECEIPT_UPLOADED', // Don't store actual image data
        receiptName: receiptName,
        timestamp: new Date().toISOString()
    };
    
    console.log('📝 Creating reservation:', reservation);
    
    reservations.push(reservation);
    
    try {
        localStorage.setItem('jopats_reservations', JSON.stringify(reservations));
        console.log('✅ Reservation saved successfully!');
        console.log('📊 Total reservations now:', reservations.length);
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
        // If storage is full, clear old reservations and try again
        if (error.name === 'QuotaExceededError') {
            console.log('🧹 Storage full, clearing old reservations...');
            localStorage.removeItem('jopats_reservations');
            // Try saving again with only recent reservations
            const recentReservations = reservations.slice(-5); // Keep only last 5
            localStorage.setItem('jopats_reservations', JSON.stringify(recentReservations));
            console.log('✅ Saved recent reservations only');
        }
    }
    
    // Update counter if admin is logged in
    updateReservationCounter();
    
    // Update booking chart if it exists
    updateBookingChart();
    
    // If admin is logged in, refresh the display
    if (document.getElementById('dashboard').style.display === 'flex') {
        displayReservations();
    }
}

function loadReservations() {
    return JSON.parse(localStorage.getItem('jopats_reservations') || '[]');
}

function loadConfirmedGuests() {
    return JSON.parse(localStorage.getItem('jopats_confirmed_guests') || '[]');
}

function saveConfirmedGuest(guest) {
    const confirmedGuests = loadConfirmedGuests();
    confirmedGuests.push(guest);
    localStorage.setItem('jopats_confirmed_guests', JSON.stringify(confirmedGuests));
}

function updateReservationCounter() {
    const reservations = loadReservations();
    const counter = document.querySelector('#nav-bookings span');
    if (counter) {
        counter.textContent = 'Reservation';
    }
    
    // Update confirmed guests counter
    const confirmedGuests = loadConfirmedGuests();
    const guestCounter = document.querySelector('#nav-guests span');
    if (guestCounter) {
        guestCounter.textContent = 'Guest Relation';
    }
    
    // Also update dashboard booking statistics
    updateDashboardBookingStatistics();
}

function displayReservations() {
    console.log('🔄 displayReservations() called');
    const reservations = loadReservations();
    const tbody = document.getElementById('reservations-table-body');
    
    console.log('📊 Found reservations:', reservations.length);
    console.log('📋 Reservations data:', reservations);
    
    if (!tbody) {
        console.error('❌ reservations-table-body not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (reservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; padding: 20px;">No reservations yet</td></tr>';
        console.log('📭 No reservations to display');
        return;
    }
    
    reservations.reverse().forEach(reservation => {
        console.log('🔍 Processing reservation:', reservation);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6; font-weight: 500;">${reservation.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${reservation.email}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${reservation.phone}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <span style="padding: 3px 8px; border-radius: 12px; font-size: 0.8rem;">${reservation.room}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6; text-align: center;">${reservation.guests || '1'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${reservation.date}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${reservation.departure || 'Not set'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6; text-align: center; font-weight: bold;">${reservation.days || '0'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6; font-weight: bold; color: #2ca136;">${reservation.total || '₱0'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <span style="background: ${reservation.paymentMethod === 'GCash' ? '#0066cc' : '#495057'}; color: ${reservation.paymentMethod === 'GCash' ? '#ffffff' : '#ffffff'}; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem;">${reservation.paymentMethod || 'Unknown'}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <span style="background: ${reservation.status === 'Confirmed' ? '#e6f4ea' : '#dc3545'}; color: ${reservation.status === 'Confirmed' ? '#1e7e34' : '#ffffff'}; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem;">${reservation.status || 'Pending'}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    <button onclick="viewReservationDetails(${reservation.id})" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="View Details">👁️</button>
                    ${reservation.status === 'Pending' ? `<button onclick="confirmReservation(${reservation.id})" style="background: #2ca136; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="Confirm Reservation">✅</button>` : ''}
                    ${reservation.paymentMethod === 'GCash' && reservation.receiptImage ? `<button onclick="viewReceipt('${reservation.id}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="View Receipt">🧾</button>` : ''}
                    <button onclick="deleteReservation(${reservation.id})" style="background: #d9534f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="Delete Reservation">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log('✅ Reservations displayed successfully');
}

function viewReservationDetails(id) {
    const reservations = loadReservations();
    const reservation = reservations.find(r => r.id === id);
    
    if (!reservation) return;
    
    const statusColor = reservation.status === 'Confirmed' ? '#28a745' : '#ffc107';
    const paymentColor = reservation.paymentMethod === 'GCash' ? '#007bff' : '#6c757d';
    const checkInDate = new Date(reservation.date);
    const checkOutDate = reservation.departure ? new Date(reservation.departure) : null;
    const bookedDate = new Date(reservation.timestamp);
    
    Swal.fire({
        title: '📋 Complete Reservation Details',
        width: '650px',
        html: `
            <div style="text-align: left;">
                <!-- Guest Information -->
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b141c;">
                    <h4 style="margin: 0 0 10px 0; color: #3b141c; font-size: 1rem;">👤 Guest Information</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div><strong>Name:</strong> ${reservation.name}</div>
                        <div><strong>Email:</strong> ${reservation.email}</div>
                        <div><strong>Phone:</strong> ${reservation.phone}</div>
                        <div><strong>Address:</strong> ${reservation.address || 'Not provided'}</div>
                    </div>
                </div>
                
                <!-- Booking Details -->
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f3961c;">
                    <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 1rem;">🏨 Booking Details</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div><strong>Room Type:</strong> <span style="padding: 3px 8px; border-radius: 12px; font-size: 0.8rem;">${reservation.room}</span></div>
                        <div><strong>Number of Guests:</strong> ${reservation.guests || '1'}</div>
                        <div><strong>Check-in Date:</strong> ${checkInDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                        <div><strong>Check-out Date:</strong> ${checkOutDate ? checkOutDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set'}</div>
                        <div><strong>Number of Nights:</strong> ${reservation.days || '0'}</div>
                        <div><strong>Total Amount:</strong> <span style="font-weight: bold; color: #2ca136; font-size: 1.1rem;">${reservation.total || '₱0'}</span></div>
                    </div>
                </div>
                
                <!-- Payment & Status -->
                <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #17a2b8;">
                    <h4 style="margin: 0 0 10px 0; color: #0c5460; font-size: 1rem;">💳 Payment & Status</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div><strong>Payment Method:</strong> <span style="background: ${paymentColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem;">${reservation.paymentMethod || 'Unknown'}</span></div>
                        <div><strong>Status:</strong> <span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem;">${reservation.status || 'Pending'}</span></div>
                        <div><strong>Booked on:</strong> ${bookedDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <div><strong>Reservation ID:</strong> #${reservation.id}</div>
                    </div>
                </div>
                
                <!-- Special Requests -->
                ${reservation.notes ? `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #6c757d;">
                    <h4 style="margin: 0 0 10px 0; color: #495057; font-size: 1rem;">📝 Special Requests / Notes</h4>
                    <p style="margin: 0; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #6c757d;">${reservation.notes}</p>
                </div>
                ` : ''}
            </div>
        `,
        confirmButtonColor: '#3b141c',
        confirmButtonText: 'Close',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    });
}

function viewReceipt(id) {
    console.log('Viewing receipt for ID:', id);
    const reservations = loadReservations();
    const reservation = reservations.find(r => r.id == id); // Use == instead of === for string comparison
    
    console.log('Found reservation:', reservation);
    
    if (!reservation) {
        console.error('Reservation not found with ID:', id);
        Swal.fire('Error', 'Reservation not found.', 'error');
        return;
    }
    
    if (!reservation.receiptImage) {
        console.error('No receipt image for reservation:', reservation);
        Swal.fire('Error', 'No receipt image found for this reservation.', 'error');
        return;
    }
    
    // Check if receipt image is stored as actual data or just a flag
    if (reservation.receiptImage === 'RECEIPT_UPLOADED') {
        // Image was not stored due to storage limitations
        Swal.fire({
            title: 'GCash Receipt',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📸</div>
                    <h3 style="color: #3b141c; margin-bottom: 15px;">Receipt Uploaded Successfully</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <p><strong>Reservation ID:</strong> ${reservation.id}</p>
                        <p><strong>Guest Name:</strong> ${reservation.name}</p>
                        <p><strong>Receipt File:</strong> ${reservation.receiptName}</p>
                        <p><strong>Upload Date:</strong> ${new Date(reservation.timestamp).toLocaleString()}</p>
                    </div>
                    <div style="background: #d4edda; padding: 10px; border-radius: 8px; margin-top: 15px;">
                        <p style="margin: 0; color: #155724; font-size: 0.9rem;">✅ Receipt was uploaded and is being processed for verification.</p>
                    </div>
                </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3b141c'
        });
        return;
    }
    
    // Original code for when actual image is stored
    console.log('Receipt image data type:', typeof reservation.receiptImage);
    console.log('Receipt image starts with data:image?', reservation.receiptImage && reservation.receiptImage.startsWith('data:image/'));
    console.log('Receipt image length:', reservation.receiptImage ? reservation.receiptImage.length : 'N/A');
    
    // Create a test image element to validate
    const testImg = new Image();
    testImg.onload = function() {
        console.log('Image validation successful');
        showReceiptModal(reservation);
    };
    testImg.onerror = function() {
        console.error('Image validation failed');
        Swal.fire('Error', 'The receipt image could not be loaded. It may be corrupted.', 'error');
    };
    testImg.src = reservation.receiptImage;
}

function showReceiptModal(reservation) {
    // Try to display the image with multiple methods
    const imageHtml = `
        <div style="border: 2px solid #ddd; border-radius: 8px; padding: 10px; background: white;">
            <img id="receipt-img" src="${reservation.receiptImage}" 
                 style="max-width: 100%; max-height: 500px; width: auto; height: auto; display: block; margin: 0 auto;" 
                 alt="GCash Receipt">
            <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
                <small style="color: #856404;">
                    <strong>Debug Info:</strong><br>
                    Image Data Length: ${reservation.receiptImage.length}<br>
                    Image Type: ${reservation.receiptImage.substring(0, 50)}...<br>
                    <button onclick="window.open('${reservation.receiptImage}', '_blank')" style="margin-top: 5px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                        Open Image in New Tab
                    </button>
                </small>
            </div>
        </div>
    `;
    
    Swal.fire({
        title: `GCash Receipt - ${reservation.name}`,
        html: `
            <div style="text-align: center;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 0 0 5px 0;"><strong>Guest:</strong> ${reservation.name}</p>
                    <p style="margin: 0 0 5px 0;"><strong>Amount:</strong> ${reservation.room.split(' - ')[1]}</p>
                    <p style="margin: 0 0 5px 0;"><strong>Payment Method:</strong> ${reservation.paymentMethod}</p>
                    <p style="margin: 0;"><strong>Receipt File:</strong> ${reservation.receiptName}</p>
                </div>
                ${imageHtml}
                <p style="margin-top: 15px; font-size: 0.85rem; color: #666;">
                    <strong>Uploaded on:</strong> ${new Date(reservation.timestamp).toLocaleString()}
                </p>
            </div>
        `,
        confirmButtonColor: '#3b141c',
        confirmButtonText: 'Close',
        width: '800px',
        showCloseButton: true,
        didOpen: () => {
            // Double-check image after modal opens
            const img = document.getElementById('receipt-img');
            if (img) {
                img.onload = () => console.log('Modal image loaded successfully');
                img.onerror = () => {
                    console.error('Modal image failed to load');
                    img.style.display = 'none';
                    const errorMsg = document.createElement('div');
                    errorMsg.innerHTML = '<p style="color: red; padding: 20px;">Image failed to load. Click "Open Image in New Tab" to view.</p>';
                    img.parentNode.appendChild(errorMsg);
                };
            }
        }
    });
}

function deleteReservation(id) {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    
    let reservations = loadReservations();
    reservations = reservations.filter(r => r.id !== id);
    localStorage.setItem('jopats_reservations', JSON.stringify(reservations));
    
    displayReservations();
    updateReservationCounter();
    
    Swal.fire('Deleted!', 'Reservation has been removed.', 'success');
}

function confirmReservation(id) {
    if (!confirm('Are you sure you want to confirm this reservation? Payment will be marked as received.')) return;
    
    let reservations = loadReservations();
    const reservationIndex = reservations.findIndex(r => r.id === id);
    
    if (reservationIndex === -1) return;
    
    const reservation = reservations[reservationIndex];
    
    // Add to confirmed guests with confirmed timestamp
    const confirmedGuest = {
        ...reservation,
        confirmedAt: new Date().toISOString(),
        originalReservationId: reservation.id
    };
    
    saveConfirmedGuest(confirmedGuest);
    
    // Remove from pending reservations
    reservations.splice(reservationIndex, 1);
    localStorage.setItem('jopats_reservations', JSON.stringify(reservations));
    
    displayReservations();
    displayConfirmedGuests();
    updateReservationCounter();
    
    Swal.fire('Confirmed!', 'Reservation has been confirmed and guest moved to Guest Relations.', 'success');
}

function displayConfirmedGuests() {
    const confirmedGuests = loadConfirmedGuests();
    const tbody = document.getElementById('confirmed-guests-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (confirmedGuests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No confirmed guests yet</td></tr>';
        return;
    }
    
    confirmedGuests.reverse().forEach(guest => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${guest.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${guest.email}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${guest.phone}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${guest.room}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${guest.date}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${guest.departure || 'N/A'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${new Date(guest.confirmedAt).toLocaleDateString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <button onclick="viewGuestDetails(${guest.originalReservationId})" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">View</button>
                <button onclick="removeGuest(${guest.originalReservationId})" style="background: #d9534f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-left: 5px;">Remove</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewGuestDetails(id) {
    const confirmedGuests = loadConfirmedGuests();
    const guest = confirmedGuests.find(g => g.originalReservationId === id);
    
    if (!guest) return;
    
    Swal.fire({
        title: 'Confirmed Guest Details',
        html: `
            <div style="text-align: left;">
                <p><strong>Name:</strong> ${guest.name}</p>
                <p><strong>Email:</strong> ${guest.email}</p>
                <p><strong>Phone:</strong> ${guest.phone}</p>
                <p><strong>Address:</strong> ${guest.address}</p>
                <p><strong>Arrival Date:</strong> ${guest.date}</p>
                <p><strong>Departure Date:</strong> ${guest.departure || 'N/A'}</p>
                <p><strong>Guests:</strong> ${guest.guests}</p>
                <p><strong>Room:</strong> ${guest.room}</p>
                <p><strong>Payment:</strong> ${guest.paymentMethod}</p>
                <p><strong>Status:</strong> <span style="color: #2ca136; font-weight: bold;">Confirmed</span></p>
                <p><strong>Notes:</strong> ${guest.notes || 'None'}</p>
                <p><strong>Booked on:</strong> ${new Date(guest.timestamp).toLocaleString()}</p>
                <p><strong>Confirmed on:</strong> ${new Date(guest.confirmedAt).toLocaleString()}</p>
            </div>
        `,
        confirmButtonColor: '#3b141c'
    });
}

function removeGuest(id) {
    if (!confirm('Are you sure you want to remove this guest from the system?')) return;
    
    let confirmedGuests = loadConfirmedGuests();
    confirmedGuests = confirmedGuests.filter(g => g.originalReservationId !== id);
    localStorage.setItem('jopats_confirmed_guests', JSON.stringify(confirmedGuests));
    
    displayConfirmedGuests();
    updateReservationCounter();
    
    Swal.fire('Removed!', 'Guest has been removed from the system.', 'success');
}

function exportReservations() {
    const reservations = loadReservations();
    
    if (reservations.length === 0) {
        Swal.fire('No Data', 'No reservations to export.', 'info');
        return;
    }
    
    let csv = 'Name,Email,Phone,Address,Arrival Date,Guests,Room,Payment Method,Status,Notes,Booked On\n';
    
    reservations.forEach(reservation => {
        csv += `"${reservation.name}","${reservation.email}","${reservation.phone}","${reservation.address}","${reservation.date}","${reservation.guests}","${reservation.room}","${reservation.paymentMethod}","${reservation.status}","${reservation.notes || ''}","${new Date(reservation.timestamp).toLocaleString()}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `jopats_reservations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    Swal.fire('Exported!', 'Reservations exported successfully.', 'success');
}

function exportConfirmedGuests() {
    const confirmedGuests = loadConfirmedGuests();
    
    if (confirmedGuests.length === 0) {
        Swal.fire('No Data', 'No confirmed guests to export.', 'info');
        return;
    }
    
    let csv = 'Name,Email,Phone,Address,Arrival Date,Guests,Room,Payment Method,Status,Notes,Booked On,Confirmed On\n';
    
    confirmedGuests.forEach(guest => {
        csv += `"${guest.name}","${guest.email}","${guest.phone}","${guest.address}","${guest.date}","${guest.guests}","${guest.room}","${guest.paymentMethod}","Confirmed","${guest.notes || ''}","${new Date(guest.timestamp).toLocaleString()}","${new Date(guest.confirmedAt).toLocaleString()}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `jopats_confirmed_guests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    Swal.fire('Exported!', 'Confirmed guests exported successfully.', 'success');
}

// --- ROOM MANAGEMENT FUNCTIONS ---
function initializeRooms() {
    const savedRooms = localStorage.getItem('jopats_rooms');
    if (!savedRooms) {
        // Initialize with default rooms if none exist
        const defaultRooms = [
            // Standard Rooms (101-110)
            { id: 101, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 102, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 103, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 104, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 105, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 106, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 107, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 108, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 109, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 110, type: 'Standard Room', capacity: 2, status: 'Available', currentOccupancy: 0, guestName: '' },
            
            // Deluxe Rooms (201-205)
            { id: 201, type: 'Deluxe Room', capacity: 4, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 202, type: 'Deluxe Room', capacity: 4, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 203, type: 'Deluxe Room', capacity: 4, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 204, type: 'Deluxe Room', capacity: 4, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 205, type: 'Deluxe Room', capacity: 4, status: 'Available', currentOccupancy: 0, guestName: '' },
            
            // Dormitory Rooms (301-302)
            { id: 301, type: 'Dormitory Room', capacity: 10, status: 'Available', currentOccupancy: 0, guestName: '' },
            { id: 302, type: 'Dormitory Room', capacity: 10, status: 'Available', currentOccupancy: 0, guestName: '' }
        ];
        localStorage.setItem('jopats_rooms', JSON.stringify(defaultRooms));
    }
}

function loadRooms() {
    return JSON.parse(localStorage.getItem('jopats_rooms') || '[]');
}

function saveRooms(rooms) {
    localStorage.setItem('jopats_rooms', JSON.stringify(rooms));
}

function displayRooms() {
    const rooms = loadRooms();
    const tbody = document.getElementById('rooms-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No rooms found</td></tr>';
        return;
    }
    
    rooms.sort((a, b) => a.id - b.id).forEach(room => {
        const row = document.createElement('tr');
        
        let statusColor, statusText, occupancyText;
        switch(room.status) {
            case 'Available':
                statusColor = '#28a745';
                statusText = 'Available';
                occupancyText = '0/' + room.capacity;
                break;
            case 'Occupied':
                statusColor = '#dc3545';
                statusText = 'Occupied';
                occupancyText = room.currentOccupancy + '/' + room.capacity;
                break;
            case 'Cleaning':
                statusColor = '#ffc107';
                statusText = 'Cleaning';
                occupancyText = '0/' + room.capacity;
                break;
            case 'Maintenance':
                statusColor = '#6c757d';
                statusText = 'Under Maintenance';
                occupancyText = '0/' + room.capacity;
                break;
            default:
                statusColor = '#6c757d';
                statusText = 'Unknown';
                occupancyText = '0/' + room.capacity;
        }
        
        row.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6; font-weight: bold;">${room.id}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${room.type}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${room.capacity} Pax</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${occupancyText}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <span style="background: ${statusColor}; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">${statusText}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">${room.guestName || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f4f7f6;">
                <button onclick="editRoom(${room.id})" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-right: 5px;">Edit</button>
                <button onclick="manageRoom(${room.id})" style="background: #3b141c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Manage</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateRoomStatistics();
    updateDashboardRoomStatistics();
    updateDashboardBookingStatistics();
}

function updateRoomStatistics() {
    const rooms = loadRooms();
    const stats = {
        total: rooms.length,
        available: rooms.filter(r => r.status === 'Available').length,
        occupied: rooms.filter(r => r.status === 'Occupied').length,
        maintenance: rooms.filter(r => r.status === 'Maintenance' || r.status === 'Cleaning').length
    };
    
    document.getElementById('total-rooms').textContent = stats.total;
    document.getElementById('available-rooms').textContent = stats.available;
    document.getElementById('occupied-rooms').textContent = stats.occupied;
    document.getElementById('maintenance-rooms').textContent = stats.maintenance;
}

// Update dashboard room statistics
function updateDashboardRoomStatistics() {
    const rooms = loadRooms();
    const stats = {
        total: rooms.length,
        available: rooms.filter(r => r.status === 'Available').length,
        occupied: rooms.filter(r => r.status === 'Occupied').length,
        maintenance: rooms.filter(r => r.status === 'Maintenance' || r.status === 'Cleaning').length
    };
    
    // Update dashboard statistics
    const totalRoomsEl = document.getElementById('dashboard-total-rooms');
    const availableRoomsEl = document.getElementById('dashboard-available-rooms');
    const occupiedRoomsEl = document.getElementById('dashboard-occupied-rooms');
    const maintenanceRoomsEl = document.getElementById('dashboard-maintenance-rooms');
    
    if (totalRoomsEl) totalRoomsEl.textContent = stats.total;
    if (availableRoomsEl) availableRoomsEl.textContent = stats.available;
    if (occupiedRoomsEl) occupiedRoomsEl.textContent = stats.occupied;
    if (maintenanceRoomsEl) maintenanceRoomsEl.textContent = stats.maintenance;
}

// Update dashboard booking statistics
function updateDashboardBookingStatistics() {
    const reservations = loadReservations();
    const confirmedGuests = loadConfirmedGuests();
    const rooms = loadRooms();
    
    // Calculate total bookings (pending reservations + confirmed guests)
    const totalBookings = reservations.length + confirmedGuests.length;
    
    // Calculate actual active guests based on room occupancy
    const activeGuestsCount = rooms
        .filter(room => room.status === 'Occupied')
        .reduce((total, room) => total + (room.currentOccupancy || 0), 0);
    
    // Calculate today's revenue based on occupied rooms and their prices
    const todayRevenue = calculateTodayRevenue(rooms);
    
    // Update dashboard booking count
    const totalBookingsEl = document.getElementById('dashboard-total-bookings');
    if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
    
    // Update active guests count (actual people in rooms)
    const activeGuestsEl = document.getElementById('dashboard-active-guests');
    if (activeGuestsEl) activeGuestsEl.textContent = activeGuestsCount;
    
    // Update today's revenue
    const revenueEl = document.getElementById('dashboard-today-revenue');
    if (revenueEl) revenueEl.textContent = `₱${todayRevenue.toLocaleString()}`;
}

// Calculate today's revenue based on occupied rooms
function calculateTodayRevenue(rooms) {
    const roomPrices = {
        'Standard Room': 1500,
        'Deluxe Room': 2500,
        'Dormitory Room': 20000
    };
    
    let totalRevenue = 0;
    
    rooms
        .filter(room => room.status === 'Occupied')
        .forEach(room => {
            const price = roomPrices[room.type] || 0;
            totalRevenue += price;
        });
    
    return totalRevenue;
}

// Dashboard Clock Function
function startDashboardClock() {
    function updateClock() {
        const now = new Date();
        const clockElement = document.getElementById('dashboard-clock');
        const dateElement = document.getElementById('dashboard-date');
        
        if (clockElement) {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
        
        if (dateElement) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }
    
    // Update immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
}

function editRoom(roomId) {
    const rooms = loadRooms();
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) return;
    
    Swal.fire({
        title: `Edit Room ${roomId}`,
        html: `
            <div style="text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Room Type:</label>
                <select id="edit-room-type" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                    <option value="Standard Room" ${room.type === 'Standard Room' ? 'selected' : ''}>Standard Room</option>
                    <option value="Deluxe Room" ${room.type === 'Deluxe Room' ? 'selected' : ''}>Deluxe Room</option>
                    <option value="Dormitory Room" ${room.type === 'Dormitory Room' ? 'selected' : ''}>Dormitory Room</option>
                </select>
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Capacity:</label>
                <input type="number" id="edit-room-capacity" value="${room.capacity}" min="1" max="20" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Status:</label>
                <select id="edit-room-status" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                    <option value="Available" ${room.status === 'Available' ? 'selected' : ''}>Available</option>
                    <option value="Occupied" ${room.status === 'Occupied' ? 'selected' : ''}>Occupied</option>
                    <option value="Cleaning" ${room.status === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
                    <option value="Maintenance" ${room.status === 'Maintenance' ? 'selected' : ''}>Under Maintenance</option>
                </select>
            </div>
        `,
        confirmButtonText: 'Save Changes',
        confirmButtonColor: '#3b141c',
        preConfirm: () => {
            const type = document.getElementById('edit-room-type').value;
            const capacity = parseInt(document.getElementById('edit-room-capacity').value);
            const status = document.getElementById('edit-room-status').value;
            
            if (!capacity || capacity < 1) {
                Swal.showValidationMessage('Please enter a valid capacity!');
                return false;
            }
            
            return { type, capacity, status };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const roomIndex = rooms.findIndex(r => r.id === roomId);
            if (roomIndex !== -1) {
                rooms[roomIndex] = {
                    ...rooms[roomIndex],
                    type: result.value.type,
                    capacity: result.value.capacity,
                    status: result.value.status
                };
                saveRooms(rooms);
                displayRooms();
                Swal.fire('Updated!', `Room ${roomId} has been updated.`, 'success');
            }
        }
    });
}

function manageRoom(roomId) {
    const rooms = loadRooms();
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) return;
    
    let actions = '';
    
    if (room.status === 'Available') {
        actions = `
            <button onclick="occupyRoom(${roomId})" style="padding: 10px 20px; margin: 5px; background: #3b141c; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Occupy Room
            </button>
            <button onclick="setRoomStatus(${roomId}, 'Cleaning')" style="padding: 10px 20px; margin: 5px; background: #ffc107; color: #212529; border: none; border-radius: 6px; cursor: pointer;">
                Set to Cleaning
            </button>
            <button onclick="setRoomStatus(${roomId}, 'Maintenance')" style="padding: 10px 20px; margin: 5px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Set to Maintenance
            </button>
        `;
    } else if (room.status === 'Cleaning') {
        actions = `
            <button onclick="setRoomStatus(${roomId}, 'Available')" style="padding: 10px 20px; margin: 5px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Set to Ready
            </button>
        `;
    } else if (room.status === 'Maintenance') {
        actions = `
            <button onclick="setRoomStatus(${roomId}, 'Available')" style="padding: 10px 20px; margin: 5px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Set to Available
            </button>
        `;
    } else if (room.status === 'Occupied') {
        actions = `
            <button onclick="checkOutGuest(${roomId})" style="padding: 10px 20px; margin: 5px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Check Out Guest
            </button>
        `;
    }
    
    Swal.fire({
        title: `Manage Room ${roomId} - ${room.type}`,
        html: `
            <div style="text-align: center;">
                <p style="margin-bottom: 20px;"><strong>Current Status:</strong> <span style="color: #3b141c;">${room.status}</span></p>
                <p style="margin-bottom: 20px;"><strong>Current Occupancy:</strong> ${room.currentOccupancy}/${room.capacity}</p>
                ${room.guestName ? `<p style="margin-bottom: 20px;"><strong>Guest:</strong> ${room.guestName}</p>` : ''}
                <div style="margin-top: 20px;">
                    ${actions}
                </div>
            </div>
        `,
        confirmButtonText: 'Close',
        confirmButtonColor: '#3b141c'
    });
}

function setRoomStatus(roomId, newStatus) {
    const rooms = loadRooms();
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex !== -1) {
        rooms[roomIndex] = {
            ...rooms[roomIndex],
            status: newStatus,
            currentOccupancy: newStatus === 'Available' ? 0 : rooms[roomIndex].currentOccupancy,
            guestName: newStatus === 'Available' ? '' : rooms[roomIndex].guestName
        };
        saveRooms(rooms);
        displayRooms();
        updateRoomStatistics();
        updateDashboardRoomStatistics();
        updateDashboardBookingStatistics();
        Swal.fire('Status Updated!', `Room ${roomId} status changed to ${newStatus}.`, 'success');
    }
}

function checkOutGuest(roomId) {
    const rooms = loadRooms();
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex !== -1) {
        const room = rooms[roomIndex];
        Swal.fire({
            title: 'Check Out Guest',
            text: `Check out ${room.guestName} from Room ${roomId}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Yes, Check Out'
        }).then((result) => {
            if (result.isConfirmed) {
                rooms[roomIndex] = {
                    ...rooms[roomIndex],
                    status: 'Cleaning',
                    currentOccupancy: 0,
                    guestName: ''
                };
                saveRooms(rooms);
                displayRooms();
                updateRoomStatistics();
                updateDashboardRoomStatistics();
                updateDashboardBookingStatistics();
                Swal.fire('Checked Out!', `${room.guestName} has been checked out. Room set to cleaning.`, 'success');
            }
        });
    }
}

function addNewRoom() {
    Swal.fire({
        title: 'Add New Room',
        html: `
            <div style="text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Room Number:</label>
                <input type="number" id="new-room-number" placeholder="e.g., 103" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Room Type:</label>
                <select id="new-room-type" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                    <option value="Standard Room">Standard Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Dormitory Room">Dormitory Room</option>
                </select>
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Capacity:</label>
                <input type="number" id="new-room-capacity" placeholder="Number of guests" min="1" max="20" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
            </div>
        `,
        confirmButtonText: 'Add Room',
        confirmButtonColor: '#2ca136',
        preConfirm: () => {
            const number = parseInt(document.getElementById('new-room-number').value);
            const type = document.getElementById('new-room-type').value;
            const capacity = parseInt(document.getElementById('new-room-capacity').value);
            
            if (!number || !capacity || capacity < 1) {
                Swal.showValidationMessage('Please fill in all fields correctly!');
                return false;
            }
            
            return { number, type, capacity };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const rooms = loadRooms();
            const newRoom = {
                id: result.value.number,
                type: result.value.type,
                capacity: result.value.capacity,
                status: 'Available',
                currentOccupancy: 0,
                guestName: ''
            };
            rooms.push(newRoom);
            saveRooms(rooms);
            displayRooms();
            Swal.fire('Added!', `Room ${result.value.number} has been added.`, 'success');
        }
    });
}

function occupyRoom(roomId) {
    const rooms = loadRooms();
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) return;
    
    Swal.fire({
        title: `Occupy Room ${roomId} - ${room.type}`,
        html: `
            <div style="text-align: left;">
                <p style="margin-bottom: 15px;"><strong>Room Capacity:</strong> ${room.capacity} Pax</p>
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Guest Name:</label>
                <input type="text" id="occupy-guest-name" placeholder="Enter guest full name" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Number of Guests:</label>
                <input type="number" id="occupy-guest-count" min="1" max="${room.capacity}" value="1" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
                
                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Notes (Optional):</label>
                <textarea id="occupy-notes" placeholder="Any special requests or notes..." style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px; height: 80px;"></textarea>
            </div>
        `,
        confirmButtonText: 'Occupy Room',
        confirmButtonColor: '#3b141c',
        preConfirm: () => {
            const guestName = document.getElementById('occupy-guest-name').value;
            const guestCount = parseInt(document.getElementById('occupy-guest-count').value);
            const notes = document.getElementById('occupy-notes').value;
            
            if (!guestName || guestName.trim() === '') {
                Swal.showValidationMessage('Please enter guest name!');
                return false;
            }
            
            if (!guestCount || guestCount < 1 || guestCount > room.capacity) {
                Swal.showValidationMessage(`Please enter valid guest count (1-${room.capacity})!`);
                return false;
            }
            
            return { guestName: guestName.trim(), guestCount, notes };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const roomIndex = rooms.findIndex(r => r.id === roomId);
            if (roomIndex !== -1) {
                rooms[roomIndex] = {
                    ...rooms[roomIndex],
                    status: 'Occupied',
                    currentOccupancy: result.value.guestCount,
                    guestName: result.value.guestName,
                    notes: result.value.notes,
                    occupiedAt: new Date().toISOString()
                };
                saveRooms(rooms);
                displayRooms();
                updateRoomStatistics();
                updateDashboardRoomStatistics();
                updateDashboardBookingStatistics();
                Swal.fire('Room Occupied!', `${result.value.guestName} has been checked in to Room ${roomId}.`, 'success');
            }
        }
    });
}

function refreshRooms() {
    displayRooms();
    Swal.fire('Refreshed!', 'Room inventory has been updated.', 'success');
}
// --- RESTORE ADMIN STATE ON PAGE LOAD ---
function restoreAdminState() {
    const savedState = loadPageState();
    
    if (savedState && savedState.isAdmin) {
        // Check if the state is recent (within 24 hours)
        const stateTime = new Date(savedState.timestamp);
        const now = new Date();
        const hoursDiff = (now - stateTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            // Restore admin dashboard
            if(header) header.style.display = "none";
            if(mainContent) mainContent.style.display = "none";
            if(dashboard) {
                dashboard.style.display = "flex";
                document.body.style.overflow = "hidden";
                
                // Add test button for debugging
                addTestButton();
                
                // Hide all admin sections first
                document.querySelectorAll('.admin-section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Determine which section to show
                const targetSectionId = savedState.currentPage || 'section-dashboard';
                const targetSection = document.getElementById(targetSectionId);
                
                if (targetSection) {
                    targetSection.style.display = 'block';
                } else {
                    // Fallback to dashboard if section not found
                    const dashboardSection = document.getElementById('section-dashboard');
                    if (dashboardSection) {
                        dashboardSection.style.display = 'block';
                    }
                }
                
                // Reset all nav items to default state
                document.querySelectorAll('.admin-nav-item').forEach(nav => {
                    nav.style.background = 'transparent';
                    nav.style.color = 'white';
                    nav.classList.remove('active');
                });
                
                // Highlight the correct nav item
                const targetNavId = targetSectionId.replace('section-', 'nav-');
                const targetNav = document.getElementById(targetNavId);
                if (targetNav) {
                    targetNav.style.background = '#f3961c';
                    targetNav.style.color = '#3b141c';
                    targetNav.classList.add('active');
                } else {
                    // Fallback to dashboard nav
                    const dashboardNav = document.getElementById('nav-dashboard');
                    if (dashboardNav) {
                        dashboardNav.style.background = '#f3961c';
                        dashboardNav.style.color = '#3b141c';
                        dashboardNav.classList.add('active');
                    }
                }
                
                // Initialize dashboard components
                initializeRooms();
                loadSystemSettings();
                updateReservationCounter();
                displayReservations();
                displayConfirmedGuests();
                displayRooms();
                updateDashboardRoomStatistics();
                updateDashboardBookingStatistics();
                startDashboardClock();
                
                // Initialize dark mode
                initializeDarkMode();
                
                // Initialize admin components (search bar, etc.)
                initializeAdminComponents();
            }
            return true;
        } else {
            // State is too old, clear it
            clearPageState();
        }
    }
    return false;
}

// INITIALIZE ON LOAD
window.onload = function() {
    // Try to restore admin state first
    const adminRestored = restoreAdminState();
    
    if (!adminRestored) {
        // Normal initialization if not admin
        initializeRooms();
        loadSystemSettings();
        updateReservationCounter();
        displayReservations();
        displayConfirmedGuests();
        displayRooms();
    }
    
    // Initialize dark mode toggle
    initializeDarkMode();
    
    // Initialize admin components if dashboard is visible
    if (document.getElementById('dashboard') && document.getElementById('dashboard').style.display !== 'none') {
        initializeAdminComponents();
    }
};

// Admin Dark Mode Functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('admin-dark-mode-toggle');
    const dashboard = document.getElementById('dashboard');
    
    if (darkModeToggle && dashboard) {
        // Load saved preference
        const savedDarkMode = localStorage.getItem('adminDarkMode') === 'true';
        darkModeToggle.checked = savedDarkMode;
        
        // Apply saved preference
        if (savedDarkMode) {
            dashboard.classList.add('admin-dark-mode');
        }
        
        // Add event listener
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                dashboard.classList.add('admin-dark-mode');
                localStorage.setItem('adminDarkMode', 'true');
            } else {
                dashboard.classList.remove('admin-dark-mode');
                localStorage.setItem('adminDarkMode', 'false');
            }
        });
    }
}

// Function to manually toggle dark mode (can be called from other functions)
function toggleAdminDarkMode() {
    const dashboard = document.getElementById('dashboard');
    const darkModeToggle = document.getElementById('admin-dark-mode-toggle');
    
    if (dashboard && darkModeToggle) {
        const isDarkMode = dashboard.classList.contains('admin-dark-mode');
        
        if (isDarkMode) {
            dashboard.classList.remove('admin-dark-mode');
            darkModeToggle.checked = false;
            localStorage.setItem('adminDarkMode', 'false');
        } else {
            dashboard.classList.add('admin-dark-mode');
            darkModeToggle.checked = true;
            localStorage.setItem('adminDarkMode', 'true');
        }
    }
}

// Admin Search Bar Functionality
function initializeAdminSearch() {
    const searchBar = document.querySelector('.admin-search-bar');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchBar && searchBtn) {
        // Search on button click
        searchBtn.addEventListener('click', function() {
            performAdminSearch(searchBar.value);
        });
        
        // Search on Enter key
        searchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performAdminSearch(searchBar.value);
            }
        });
    }
}

function performAdminSearch(query) {
    if (!query.trim()) {
        Swal.fire({
            icon: 'info',
            title: 'Search',
            text: 'Please enter a search term',
            confirmButtonColor: '#f3961c'
        });
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    let allResults = [];
    
    // Search in reservations
    const reservations = JSON.parse(localStorage.getItem('jopats_reservations') || '[]');
    const reservationResults = reservations.filter(reservation => 
        reservation.name?.toLowerCase().includes(searchTerm) ||
        reservation.email?.toLowerCase().includes(searchTerm) ||
        reservation.phone?.includes(searchTerm) ||
        reservation.room?.toLowerCase().includes(searchTerm)
    );
    
    // Search in confirmed guests
    const confirmedGuests = JSON.parse(localStorage.getItem('jopats_confirmed_guests') || '[]');
    const guestResults = confirmedGuests.filter(guest =>
        guest.name?.toLowerCase().includes(searchTerm) ||
        guest.email?.toLowerCase().includes(searchTerm) ||
        guest.phone?.includes(searchTerm) ||
        guest.roomType?.toLowerCase().includes(searchTerm)
    );
    
    // Search in contact messages
    const contactMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const messageResults = contactMessages.filter(message =>
        message.name?.toLowerCase().includes(searchTerm) ||
        message.email?.toLowerCase().includes(searchTerm) ||
        message.message?.toLowerCase().includes(searchTerm)
    );
    
    // Search in staff (if exists)
    const staffResults = [];
    const staffTableBody = document.getElementById('staff-table-body');
    if (staffTableBody) {
        const staffRows = staffTableBody.querySelectorAll('tr');
        staffRows.forEach((row, index) => {
            const name = row.cells[0]?.textContent?.toLowerCase();
            const role = row.cells[3]?.textContent?.toLowerCase();
            if (name?.includes(searchTerm) || role?.includes(searchTerm)) {
                staffResults.push({
                    name: row.cells[0]?.textContent,
                    role: row.cells[3]?.textContent,
                    type: 'Staff'
                });
            }
        });
    }
    
    // Combine all results
    allResults = [
        ...reservationResults.map(r => ({...r, type: 'Reservation'})),
        ...guestResults.map(g => ({...g, type: 'Guest'})),
        ...messageResults.map(m => ({...m, type: 'Message'})),
        ...staffResults
    ];
    
    // Display results
    displaySearchResults(allResults, searchTerm);
}

function displaySearchResults(results, searchTerm) {
    if (results.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Results',
            text: `No results found for "${searchTerm}"`,
            confirmButtonColor: '#f3961c'
        });
        return;
    }
    
    let resultsHtml = '<div style="max-height: 400px; overflow-y: auto;">';
    
    // Group results by type
    const groupedResults = {};
    results.forEach(result => {
        if (!groupedResults[result.type]) {
            groupedResults[result.type] = [];
        }
        groupedResults[result.type].push(result);
    });
    
    // Display each group
    Object.keys(groupedResults).forEach(type => {
        resultsHtml += `<h4 style="color: #3b141c; margin: 15px 0 10px 0;">${type}s (${groupedResults[type].length})</h4>`;
        
        groupedResults[type].forEach((result, index) => {
            let itemHtml = '<div style="background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 6px; border-left: 3px solid #f3961c; cursor: pointer;" onclick="navigateToResult(\'' + type + '\', ' + index + ', \'' + searchTerm + '\')">';
            
            if (type === 'Reservation' || type === 'Guest') {
                itemHtml += `
                    <div style="font-weight: bold; color: #3b141c;">${highlightText(result.name, searchTerm)}</div>
                    <div style="font-size: 0.9rem; color: #666;">📧 ${highlightText(result.email, searchTerm)} | 📱 ${highlightText(result.phone, searchTerm)}</div>
                    ${result.room ? `<div style="font-size: 0.9rem; color: #666;">🏠 ${highlightText(result.room, searchTerm)}</div>` : ''}
                    ${result.date ? `<div style="font-size: 0.9rem; color: #666;">📅 ${result.date}</div>` : ''}
                `;
            } else if (type === 'Message') {
                itemHtml += `
                    <div style="font-weight: bold; color: #3b141c;">${highlightText(result.name, searchTerm)}</div>
                    <div style="font-size: 0.9rem; color: #666;">📧 ${highlightText(result.email, searchTerm)}</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">💬 ${highlightText(result.message.substring(0, 100), searchTerm)}${result.message.length > 100 ? '...' : ''}</div>
                    <div style="font-size: 0.8rem; color: #999;">📅 ${result.date}</div>
                `;
            } else if (type === 'Staff') {
                itemHtml += `
                    <div style="font-weight: bold; color: #3b141c;">${highlightText(result.name, searchTerm)}</div>
                    <div style="font-size: 0.9rem; color: #666;">👤 ${highlightText(result.role, searchTerm)}</div>
                `;
            }
            
            itemHtml += '<div style="font-size: 0.8rem; color: #f3961c; margin-top: 5px;">👁️ Click to view & highlight</div>';
            itemHtml += '</div>';
            resultsHtml += itemHtml;
        });
    });
    
    resultsHtml += '</div>';
    
    Swal.fire({
        icon: 'success',
        title: `Found ${results.length} results for "${searchTerm}"`,
        html: resultsHtml,
        confirmButtonColor: '#f3961c',
        width: '600px',
        showCloseButton: true
    });
}

// Highlight search term in text
function highlightText(text, searchTerm) {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark style="background: #fff3cd; color: #856404; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

// Navigate to specific result and highlight it
function navigateToResult(type, index, searchTerm) {
    // Close the search results popup
    Swal.close();
    
    // Clear previous highlights
    document.querySelectorAll('.search-result-highlight').forEach(el => {
        el.classList.remove('search-result-highlight');
        el.style.backgroundColor = '';
        el.style.border = '';
        el.style.boxShadow = '';
    });
    
    let targetElement = null;
    
    if (type === 'Reservation') {
        // Navigate to Reservations section
        showSection('bookings');
        
        // Wait for section to load, then find and highlight the specific reservation
        setTimeout(() => {
            const reservations = JSON.parse(localStorage.getItem('jopats_reservations') || '[]');
            const targetReservation = reservations[index];
            
            // Find the row in the table
            const tableBody = document.getElementById('reservations-table-body');
            if (tableBody) {
                const rows = tableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const nameCell = row.cells[0]?.textContent;
                    if (nameCell === targetReservation.name) {
                        targetElement = row;
                    }
                });
            }
        }, 500);
        
    } else if (type === 'Guest') {
        // Navigate to Guest Relations section
        showSection('guests');
        
        setTimeout(() => {
            const guests = JSON.parse(localStorage.getItem('jopats_confirmed_guests') || '[]');
            const targetGuest = guests[index];
            
            // Find the row in the guests table
            const tableBody = document.getElementById('guests-table-body');
            if (tableBody) {
                const rows = tableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const nameCell = row.cells[0]?.textContent;
                    if (nameCell === targetGuest.name) {
                        targetElement = row;
                    }
                });
            }
        }, 500);
        
    } else if (type === 'Message') {
        // Navigate to dashboard and show notification dropdown
        showSection('dashboard');
        
        setTimeout(() => {
            // Find the message in notification list
            const notificationList = document.getElementById('notification-list');
            if (notificationList) {
                const notifications = notificationList.querySelectorAll('[onclick*="viewMessage"]');
                notifications.forEach(notification => {
                    const nameElement = notification.querySelector('.font-weight-bold');
                    if (nameElement && nameElement.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                        targetElement = notification;
                    }
                });
            }
        }, 500);
        
    } else if (type === 'Staff') {
        // Navigate to Settings section
        showSection('settings');
        
        setTimeout(() => {
            // Open Staff Management tab
            openTab('staff-management');
            
            // Find the staff row
            setTimeout(() => {
                const tableBody = document.getElementById('staff-table-body');
                if (tableBody) {
                    const rows = tableBody.querySelectorAll('tr');
                    rows.forEach(row => {
                        const nameCell = row.cells[0]?.textContent;
                        if (nameCell && nameCell.toLowerCase().includes(searchTerm.toLowerCase())) {
                            targetElement = row;
                        }
                    });
                }
            }, 300);
        }, 500);
    }
    
    // Highlight and scroll to the target element
    setTimeout(() => {
        if (targetElement) {
            // Apply highlight styles
            targetElement.classList.add('search-result-highlight');
            targetElement.style.backgroundColor = '#fff3cd';
            targetElement.style.border = '2px solid #f3961c';
            targetElement.style.boxShadow = '0 0 10px rgba(243, 150, 28, 0.5)';
            
            // Smooth scroll to element
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Flash effect
            let flashes = 0;
            const flashInterval = setInterval(() => {
                if (flashes >= 6) {
                    clearInterval(flashInterval);
                    return;
                }
                
                if (flashes % 2 === 0) {
                    targetElement.style.backgroundColor = '#ffeaa7';
                    targetElement.style.boxShadow = '0 0 20px rgba(243, 150, 28, 0.8)';
                } else {
                    targetElement.style.backgroundColor = '#fff3cd';
                    targetElement.style.boxShadow = '0 0 10px rgba(243, 150, 28, 0.5)';
                }
                flashes++;
            }, 300);
            
            // Show success message
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Found!',
                    text: `Highlighted ${type} record for "${searchTerm}"`,
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
            }, 1000);
        }
    }, 1000);
}

// Helper function to show admin section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update navigation
    document.querySelectorAll('.admin-nav-item').forEach(nav => {
        nav.style.background = 'transparent';
        nav.style.color = 'white';
        nav.classList.remove('active');
    });
    
    const targetNav = document.getElementById(`nav-${sectionName}`);
    if (targetNav) {
        targetNav.style.background = '#f3961c';
        targetNav.style.color = '#3b141c';
        targetNav.classList.add('active');
    }
}

// Initialize search when admin dashboard loads
function initializeAdminComponents() {
    initializeAdminSearch();
    initializeContactForm();
}

// Contact Us Form Integration
function initializeContactForm() {
    const contactForm = document.getElementById('contact-us-form');
    if (contactForm) {
        console.log('Contact form found, adding event listener...');
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Contact form submitted!');
            
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            
            console.log('Form data:', { name, email, message }); // Debug log
            
            // Validate form
            if (!name || !email || !message) {
                console.log('Form validation failed');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Please fill in all fields.',
                    confirmButtonColor: '#f3961c'
                });
                return;
            }
            
            // Create new message object
            const newMessage = {
                name: name,
                email: email,
                phone: 'Not provided',
                message: message,
                date: new Date().toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                }),
                status: 'unread',
                id: Date.now().toString() // unique ID
            };
            
            console.log('Creating message:', newMessage); // Debug log
            
            // Save to localStorage
            saveMessageToStorage(newMessage);
            
            // Show success message to user
            Swal.fire({
                icon: 'success',
                title: 'Message Sent!',
                text: 'Thank you for contacting us. We will get back to you soon.',
                confirmButtonColor: '#f3961c'
            });
            
            // Clear form
            contactForm.reset();
            console.log('Form reset completed');
        });
    } else {
        console.log('Contact form not found!');
    }
}

// Save message to localStorage
function saveMessageToStorage(message) {
    console.log('Saving message:', message); // Debug log
    
    // Get existing messages from localStorage
    let existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    // Add new message
    existingMessages.unshift(message); // Add to beginning
    
    // Save back to localStorage
    localStorage.setItem('contactMessages', JSON.stringify(existingMessages));
    console.log('Messages saved:', existingMessages); // Debug log
    
    // Update notification badge if admin dashboard is open
    updateNotificationBadge();
    
    // Update notification list if dropdown is visible
    updateNotificationList();
    
    // Show success notification to admin
    showAdminNotification(message.name);
}

// Show admin notification for new message
function showAdminNotification(senderName) {
    console.log('Showing admin notification for:', senderName); // Debug log
    
    // Always show notification regardless of which page we're on
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f3961c;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: bold;
        animation: slideIn 0.3s ease-out;
        font-family: "Poppins", sans-serif;
        min-width: 300px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-bell"></i>
            <div>
                <div style="font-size: 14px; margin-bottom: 2px;">New Message Received!</div>
                <div style="font-size: 12px; opacity: 0.9;">From: ${senderName}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    console.log('Notification added to page'); // Debug log
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                    console.log('Notification removed'); // Debug log
                }
            }, 300);
        }
    }, 5000);
}

// Get messages from localStorage
function getMessagesFromStorage() {
    return JSON.parse(localStorage.getItem('contactMessages') || '[]');
}

// --- NOTIFICATION SYSTEM FUNCTIONS ---

// Add event listener for notification bell - try multiple approaches
function initializeNotificationBell() {
    console.log('Initializing notification bell...');
    
    // Method 1: Try getElementById
    let notificationBell = document.getElementById('notification-bell');
    if (notificationBell) {
        console.log('Found bell via ID');
        notificationBell.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Bell clicked via ID method');
            toggleNotificationPanel();
        });
        return;
    }
    
    // Method 2: Try querySelector
    notificationBell = document.querySelector('#notification-bell');
    if (notificationBell) {
        console.log('Found bell via querySelector');
        notificationBell.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Bell clicked via querySelector method');
            toggleNotificationPanel();
        });
        return;
    }
    
    // Method 3: Try by class or attribute
    notificationBell = document.querySelector('div[style*="cursor: pointer"]');
    if (notificationBell && notificationBell.querySelector('.fa-bell')) {
        console.log('Found bell via style search');
        notificationBell.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Bell clicked via style search method');
            toggleNotificationPanel();
        });
        return;
    }
    
    console.error('Could not find notification bell element!');
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initializeNotificationBell);

// Also try to initialize after a delay (in case DOM is not ready)
setTimeout(initializeNotificationBell, 1000);

// Also try to initialize when admin dashboard is shown
const originalShowSection = window.showSection;
if (originalShowSection) {
    window.showSection = function(sectionId) {
        originalShowSection(sectionId);
        setTimeout(initializeNotificationBell, 500);
    };
}

// Toggle notification panel (original function)
function toggleNotificationPanel() {
    console.log('Notification bell clicked!'); // Debug log
    const dropdown = document.getElementById('notification-dropdown');
    console.log('Dropdown element:', dropdown); // Debug log
    
    if (!dropdown) {
        console.error('Notification dropdown not found!');
        return;
    }
    
    const isVisible = dropdown.style.display === 'block';
    console.log('Current visibility:', isVisible); // Debug log
    
    if (isVisible) {
        dropdown.style.display = 'none';
        console.log('Hiding dropdown'); // Debug log
    } else {
        dropdown.style.display = 'block';
        console.log('Showing dropdown'); // Debug log
        // Update notification list when opening
        updateNotificationList();
    }
}

// Toggle notification dropdown
function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    const isVisible = dropdown.style.display === 'block';
    
    if (isVisible) {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
        // Update notification list when opening
        updateNotificationList();
    }
}

// Close notification dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notification-dropdown');
    const bellButton = event.target.closest('button[onclick="toggleNotifications()"]');
    
    if (!bellButton && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Update notification list display
function updateNotificationList() {
    console.log('Updating notification list...'); // Debug log
    const messages = getMessagesFromStorage();
    const notificationList = document.getElementById('notification-list');
    
    console.log('Notification list element:', notificationList); // Debug log
    console.log('Messages from storage:', messages); // Debug log
    
    if (!notificationList) {
        console.error('Notification list element not found!');
        return;
    }
    
    if (messages.length === 0) {
        console.log('No messages to display'); // Debug log
        notificationList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; color: #ccc;"></i>
                <div>No new notifications</div>
            </div>
        `;
        return;
    }
    
    console.log('Displaying', messages.length, 'messages'); // Debug log
    let html = '';
    messages.slice(0, 10).forEach((message, index) => {
        const timeAgo = getTimeAgo(new Date(message.date));
        const iconColor = message.status === 'unread' ? '#f3961c' : '#6c757d';
        const bgColor = message.status === 'unread' ? '#fff3e0' : '#f8f9fa';
        
        console.log('Processing message:', message); // Debug log
        
        html += `
            <div style="padding: 15px; border-bottom: 1px solid #f4f7f6; cursor: pointer; transition: 0.2s; background: ${bgColor};" 
                 onmouseover="this.style.background='#f8f9fa'" 
                 onmouseout="this.style.background='${bgColor}'" 
                 onclick="viewMessage('${message.id}')">
                <div style="display: flex; align-items: start; gap: 10px;">
                    <div style="background: ${message.status === 'unread' ? '#fff3e0' : '#e9ecef'}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-envelope" style="color: ${iconColor};"></i>
                    </div>
                    <div style="flex-grow: 1;">
                        <div style="font-weight: bold; color: #3b141c; margin-bottom: 2px;">${message.name}</div>
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">Sent you a message from contact form</div>
                        <div style="font-size: 0.75rem; color: #999;">${timeAgo}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    console.log('Setting notification list HTML'); // Debug log
    notificationList.innerHTML = html;
    console.log('Notification list updated successfully'); // Debug log
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return Math.floor(seconds / 604800) + ' weeks ago';
}

// View message details
function viewMessage(messageId) {
    console.log('Viewing message:', messageId); // Debug log
    const messages = getMessagesFromStorage();
    const message = messages.find(msg => msg.id === messageId);
    
    console.log('Found message:', message); // Debug log
    if (!message) {
        console.error('Message not found!');
        return;
    }
    
    const messageDetails = document.getElementById('messageDetails');
    if (!messageDetails) {
        console.error('Message details element not found!');
        return;
    }
    
    messageDetails.innerHTML = `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #666;">Name:</span>
                <span style="color: #3b141c; font-weight: 500;">${message.name}</span>
            </div>
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #666;">Email:</span>
                <span style="color: #3b141c;">${message.email}</span>
            </div>
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #666;">Phone:</span>
                <span style="color: #3b141c;">${message.phone}</span>
            </div>
            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px;">
                <span style="font-weight: bold; color: #666;">Date:</span>
                <span style="color: #3b141c;">${message.date}</span>
            </div>
        </div>
        
        <div style="margin-bottom: 15px;">
            <h4 style="margin-bottom: 10px; color: #3b141c;">Message:</h4>
            <div style="background: white; padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; line-height: 1.6;">
                ${message.message}
            </div>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="markAsRead('${message.id}')" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">
                <i class="fas fa-check"></i> Mark as Read
            </button>
            <button onclick="deleteMessage('${message.id}')" style="padding: 8px 15px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    // Show modal with flex display for centering
    const modal = document.getElementById('messageModal');
    modal.style.display = 'flex';
    console.log('Modal shown with flex display'); // Debug log
    
    // Close notification dropdown
    document.getElementById('notification-dropdown').style.display = 'none';
    
    // Mark as read
    message.status = 'read';
    saveMessagesToStorage(messages);
    updateNotificationBadge();
    updateNotificationList();
    console.log('Message marked as read'); // Debug log
}

// Save messages array to localStorage
function saveMessagesToStorage(messages) {
    localStorage.setItem('contactMessages', JSON.stringify(messages));
}

// Close message modal
function closeMessageModal() {
    document.getElementById('messageModal').style.display = 'none';
}

// Mark message as read
function markAsRead(messageId) {
    const messages = getMessagesFromStorage();
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
        message.status = 'read';
        saveMessagesToStorage(messages);
        updateNotificationBadge();
        updateNotificationList();
        closeMessageModal();
        
        Swal.fire({
            icon: 'success',
            title: 'Message Marked as Read',
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: '#f3961c'
        });
    }
}

// Delete message
function deleteMessage(messageId) {
    Swal.fire({
        title: 'Delete Message',
        text: 'Are you sure you want to delete this message?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            const messages = getMessagesFromStorage();
            const filteredMessages = messages.filter(msg => msg.id !== messageId);
            saveMessagesToStorage(filteredMessages);
            updateNotificationBadge();
            updateNotificationList();
            closeMessageModal();
            
            Swal.fire({
                icon: 'success',
                title: 'Message Deleted',
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: '#f3961c'
            });
        }
    });
}

// Reply to message
function replyToMessage() {
    Swal.fire({
        icon: 'info',
        title: 'Reply Feature',
        text: 'Email client would open here to reply to the sender.',
        confirmButtonColor: '#3b141c'
    });
}

// Delete message
function deleteMessage() {
    Swal.fire({
        title: 'Delete Message',
        text: 'Are you sure you want to delete this message?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Get current messages
            let messages = getMessagesFromStorage();
            
            // Find and remove the message (this is a simplified approach)
            // In a real app, you'd track the current message ID
            messages = messages.filter(msg => msg.status !== 'deleted');
            
            // Save updated messages
            saveMessagesToStorage(messages);
            
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Message has been deleted.',
                confirmButtonColor: '#f3961c'
            });
            closeMessageModal();
            updateNotificationBadge();
            updateNotificationList();
        }
    });
}

// Mark as read
function markAsRead() {
    Swal.fire({
        icon: 'success',
        title: 'Marked as Read',
        text: 'Message has been marked as read.',
        confirmButtonColor: '#f3961c'
    });
    closeMessageModal();
    updateNotificationBadge();
}

// Clear all notifications
function clearAllNotifications() {
    Swal.fire({
        title: 'Clear All Notifications',
        text: 'Are you sure you want to clear all notifications?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Clear All',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear all messages
            localStorage.removeItem('contactMessages');
            
            // Update UI
            updateNotificationBadge();
            updateNotificationList();
            
            Swal.fire({
                icon: 'success',
                title: 'Cleared!',
                text: 'All notifications have been cleared.',
                confirmButtonColor: '#f3961c'
            });
        }
    });
}

// Update notification badge count
function updateNotificationBadge() {
    const messages = getMessagesFromStorage();
    const unreadCount = messages.filter(msg => msg.status === 'unread').length;
    const badge = document.getElementById('notification-badge');
    
    console.log('Updating badge - unread count:', unreadCount); // Debug log
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
            console.log('Badge updated with count:', unreadCount);
        } else {
            badge.style.display = 'none';
            console.log('Badge hidden');
        }
    } else {
        console.log('Badge element not found (admin may not be logged in)');
    }
    
    // Also update notification list if dropdown exists
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
        updateNotificationList();
    }
}

// Test function - call this from browser console to test
function testNotification() {
    const testMessage = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '0912-345-6789',
        message: 'This is a test message to verify the notification system is working.',
        date: new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        }),
        status: 'unread',
        id: Date.now().toString()
    };
    
    saveMessageToStorage(testMessage);
    console.log('Test notification sent!');
}

// Initialize notification system when page loads (moved to main DOMContentLoaded above)

// Dynamic Search Functionality
let currentSection = 'dashboard';

function updateSearchPlaceholder(section) {
    const searchInput = document.getElementById('dynamic-search-bar');
    if (!searchInput) return;
    
    currentSection = section;
    switch(section) {
        case 'nav-rooms':
            searchInput.placeholder = 'Search room number...';
            break;
        case 'nav-guests':
            searchInput.placeholder = 'Search guest name...';
            break;
        default:
            searchInput.placeholder = 'Search room number...';
    }
    searchInput.value = ''; // Clear search when switching sections
}

function performSearch() {
    const searchInput = document.getElementById('dynamic-search-bar');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        clearHighlights();
        return;
    }
    
    switch(currentSection) {
        case 'nav-rooms':
            searchAndHighlightRooms(searchTerm);
            break;
        case 'nav-guests':
            searchAndHighlightGuests(searchTerm);
            break;
        default:
            searchAndHighlightRooms(searchTerm);
    }
}

function searchAndHighlightRooms(searchTerm) {
    const tableBody = document.getElementById('rooms-table-body');
    if (!tableBody) return;
    
    const rows = tableBody.getElementsByTagName('tr');
    let foundAny = false;
    
    // Clear previous highlights
    clearHighlights();
    
    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        let found = false;
        
        for (let cell of cells) {
            const text = cell.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                found = true;
                highlightText(cell, searchTerm);
            }
        }
        
        if (found) {
            row.style.backgroundColor = '#fff3cd';
            row.style.border = '2px solid #f3961c';
            foundAny = true;
        } else {
            row.style.opacity = '0.3';
        }
    }
    
    if (!foundAny && searchTerm) {
        showNoResultsMessage('rooms-table-body', 'No rooms found matching "' + searchTerm + '"');
    }
}

function searchAndHighlightGuests(searchTerm) {
    const tableBody = document.getElementById('confirmed-guests-table-body');
    if (!tableBody) return;
    
    const rows = tableBody.getElementsByTagName('tr');
    let foundAny = false;
    
    // Clear previous highlights
    clearHighlights();
    
    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        let found = false;
        
        for (let cell of cells) {
            const text = cell.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                found = true;
                highlightText(cell, searchTerm);
            }
        }
        
        if (found) {
            row.style.backgroundColor = '#fff3cd';
            row.style.border = '2px solid #f3961c';
            foundAny = true;
        } else {
            row.style.opacity = '0.3';
        }
    }
    
    if (!foundAny && searchTerm) {
        showNoResultsMessage('confirmed-guests-table-body', 'No guests found matching "' + searchTerm + '"');
    }
}

function highlightText(element, searchTerm) {
    const text = element.innerHTML;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    element.innerHTML = text.replace(regex, '<mark style="background: #f3961c; color: #3b141c; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

function clearHighlights() {
    // Remove all highlights
    const highlighted = document.querySelectorAll('mark');
    highlighted.forEach(mark => {
        const parent = mark.parentNode;
        parent.innerHTML = parent.innerHTML.replace(mark.outerHTML, mark.textContent);
    });
    
    // Reset row styles
    const tableBodies = ['rooms-table-body', 'confirmed-guests-table-body'];
    tableBodies.forEach(bodyId => {
        const tableBody = document.getElementById(bodyId);
        if (tableBody) {
            const rows = tableBody.getElementsByTagName('tr');
            for (let row of rows) {
                row.style.backgroundColor = '';
                row.style.border = '';
                row.style.opacity = '';
            }
        }
    });
    
    // Remove no results messages
    const noResultsMessages = document.querySelectorAll('.no-results-message');
    noResultsMessages.forEach(msg => msg.remove());
}

function showNoResultsMessage(tableBodyId, message) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;
    
    const noResultsRow = document.createElement('tr');
    noResultsRow.className = 'no-results-message';
    noResultsRow.innerHTML = `<td colspan="7" style="text-align: center; padding: 20px; color: #666; font-style: italic;">${message}</td>`;
    
    tableBody.appendChild(noResultsRow);
}

// Add event listener for search input
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('dynamic-search-bar');
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

// Update navigation functions to change search placeholder
const originalNavFunctions = {
    showSection: window.showSection
};

window.showSection = function(sectionId) {
    // Update search placeholder based on section
    if (sectionId === 'section-rooms') {
        updateSearchPlaceholder('nav-rooms');
    } else if (sectionId === 'section-guests') {
        updateSearchPlaceholder('nav-guests');
    } else {
        updateSearchPlaceholder('dashboard');
    }
    
    // Call original function if it exists
    if (originalNavFunctions.showSection) {
        originalNavFunctions.showSection(sectionId);
    }
};

// --- BUSINESS ANALYTICS CHART SYSTEM ---
let revenueChart = null;
let roomPerformanceChart = null;
let bookingPatternsChart = null;
let demographicsChart = null;
let seasonalTrendsChart = null;

// Initialize all analytics charts when Business Analytics section is opened
function initializeAnalyticsCharts() {
    setTimeout(() => {
        initializeRevenueChart();
        initializeRoomPerformanceChart();
        initializeBookingPatternsChart();
        initializeDemographicsChart();
        initializeSeasonalTrendsChart();
        updateAnalyticsKPIs();
        populateAnalyticsTable();
    }, 300);
}

// Revenue Trend Chart
function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const chartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Revenue',
            data: [180000, 220000, 195000, 245000, 280000, 265000],
            borderColor: '#f3961c',
            backgroundColor: 'rgba(243, 150, 28, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#f3961c',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7
        }, {
            label: 'Target',
            data: [200000, 200000, 200000, 200000, 200000, 200000],
            borderColor: '#3b141c',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 0
        }]
    };

    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(59, 20, 28, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#f3961c',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += '₱' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: { size: 11 },
                        callback: function(value) {
                            return '₱' + (value / 1000) + 'K';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: { size: 11 }
                    }
                }
            }
        }
    };

    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctx, config);
}

// Room Performance Pie Chart
function initializeRoomPerformanceChart() {
    const ctx = document.getElementById('roomPerformanceChart');
    if (!ctx) return;

    const chartData = {
        labels: ['Standard Room', 'Deluxe Room', 'Dormitory'],
        datasets: [{
            data: [45, 35, 20],
            backgroundColor: [
                '#667eea',
                '#f093fb', 
                '#4facfe'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const config = {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            label += context.parsed + '%';
                            return label;
                        }
                    }
                }
            }
        }
    };

    if (roomPerformanceChart) roomPerformanceChart.destroy();
    roomPerformanceChart = new Chart(ctx, config);
}

// Booking Patterns Chart
function initializeBookingPatternsChart() {
    const ctx = document.getElementById('bookingPatternsChart');
    if (!ctx) return;

    const chartData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Check-ins',
            data: [12, 8, 15, 18, 25, 35, 30],
            backgroundColor: '#43e97b',
            borderRadius: 6
        }, {
            label: 'Check-outs',
            data: [10, 12, 14, 16, 20, 28, 32],
            backgroundColor: '#f3961c',
            borderRadius: 6
        }]
    };

    const config = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 10,
                        font: { size: 11 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: { size: 10 }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: { size: 10 }
                    }
                }
            }
        }
    };

    if (bookingPatternsChart) bookingPatternsChart.destroy();
    bookingPatternsChart = new Chart(ctx, config);
}

// Guest Demographics Chart
function initializeDemographicsChart() {
    const ctx = document.getElementById('demographicsChart');
    if (!ctx) return;

    const chartData = {
        labels: ['Families', 'Couples', 'Solo Travelers', 'Groups', 'Business'],
        datasets: [{
            data: [35, 28, 15, 12, 10],
            backgroundColor: [
                '#667eea',
                '#f093fb',
                '#4facfe', 
                '#43e97b',
                '#f3961c'
            ],
            borderWidth: 0
        }]
    };

    const config = {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 10,
                        font: { size: 10 },
                        boxWidth: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            label += context.parsed + '%';
                            return label;
                        }
                    }
                }
            }
        }
    };

    if (demographicsChart) demographicsChart.destroy();
    demographicsChart = new Chart(ctx, config);
}

// Seasonal Trends Chart
function initializeSeasonalTrendsChart() {
    const ctx = document.getElementById('seasonalTrendsChart');
    if (!ctx) return;

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: '2023',
            data: [65, 68, 72, 78, 85, 88, 92, 90, 82, 75, 70, 68],
            borderColor: '#3b141c',
            backgroundColor: 'rgba(59, 20, 28, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        }, {
            label: '2024',
            data: [70, 72, 75, 82, 88, 92, 95, 93, 85, 78, 74, 72],
            borderColor: '#f3961c',
            backgroundColor: 'rgba(243, 150, 28, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        }]
    };

    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += context.parsed.y + '% occupancy';
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: { size: 11 },
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666',
                        font: { size: 11 }
                    }
                }
            }
        }
    };

    if (seasonalTrendsChart) seasonalTrendsChart.destroy();
    seasonalTrendsChart = new Chart(ctx, config);
}

// Update Analytics KPIs
function updateAnalyticsKPIs() {
    // Calculate from actual reservation data
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filter current month reservations
    const currentMonthReservations = reservations.filter(res => {
        const resDate = new Date(res.date);
        return resDate.getMonth() === currentMonth && resDate.getFullYear() === currentYear;
    });
    
    // Calculate metrics
    const monthlyRevenue = currentMonthReservations.reduce((sum, res) => {
        const amount = parseFloat(res.total?.replace(/[₱,]/g, '') || 0);
        return sum + amount;
    }, 0);
    
    const totalGuests = currentMonthReservations.length;
    const totalRooms = 16;
    const occupiedRooms = Math.min(totalGuests, totalRooms);
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : 0;
    const adr = totalGuests > 0 ? (monthlyRevenue / totalGuests).toFixed(0) : 0;
    
    // Update DOM
    document.getElementById('analytics-monthly-revenue').textContent = '₱' + monthlyRevenue.toLocaleString();
    document.getElementById('analytics-occupancy-rate').textContent = occupancyRate + '%';
    document.getElementById('analytics-adr').textContent = '₱' + parseInt(adr).toLocaleString();
    document.getElementById('analytics-total-guests').textContent = totalGuests;
}

// Populate Analytics Table
function populateAnalyticsTable() {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const roomTypes = ['Standard Room', 'Deluxe Room', 'Dormitory Room'];
    const roomPrices = { 'Standard Room': 1500, 'Deluxe Room': 2500, 'Dormitory Room': 20000 };
    
    const tableBody = document.getElementById('analytics-table-body');
    if (!tableBody) return;
    
    let tableHTML = '';
    let totalBookings = 0;
    let totalRevenue = 0;
    
    roomTypes.forEach(roomType => {
        const roomReservations = reservations.filter(res => res.room?.includes(roomType));
        const bookings = roomReservations.length;
        const revenue = roomReservations.reduce((sum, res) => {
            const amount = parseFloat(res.total?.replace(/[₱,]/g, '') || 0);
            return sum + amount;
        }, 0);
        
        totalBookings += bookings;
        totalRevenue += revenue;
        
        const occupancyRate = bookings > 0 ? ((bookings / 30) * 100).toFixed(1) : 0;
        const avgDailyRate = bookings > 0 ? (revenue / bookings).toFixed(0) : 0;
        const revenueShare = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(1) : 0;
        
        let performance = 'Poor';
        let performanceColor = '#dc3545';
        if (occupancyRate > 70) {
            performance = 'Excellent';
            performanceColor = '#28a745';
        } else if (occupancyRate > 50) {
            performance = 'Good';
            performanceColor = '#ffc107';
        }
        
        tableHTML += `
            <tr>
                <td style="padding: 12px; font-weight: 500;">${roomType}</td>
                <td style="padding: 12px;">${bookings}</td>
                <td style="padding: 12px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="background: #e9ecef; height: 6px; border-radius: 3px; flex: 1; max-width: 60px;">
                            <div style="background: ${occupancyRate > 50 ? '#28a745' : '#ffc107'}; height: 100%; width: ${occupancyRate}%; border-radius: 3px;"></div>
                        </div>
                        <span style="font-size: 0.9rem; font-weight: 500;">${occupancyRate}%</span>
                    </div>
                </td>
                <td style="padding: 12px;">₱${parseInt(avgDailyRate).toLocaleString()}</td>
                <td style="padding: 12px; font-weight: 500;">₱${revenue.toLocaleString()}</td>
                <td style="padding: 12px;">${revenueShare}%</td>
                <td style="padding: 12px;">
                    <span style="background: ${performanceColor}20; color: ${performanceColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 500;">
                        ${performance}
                    </span>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
}

// Update Revenue Chart based on period selection
function updateRevenueChart() {
    const period = document.getElementById('revenue-period').value;
    let labels, data;
    
    switch(period) {
        case '6months':
            labels = ['January', 'February', 'March', 'April', 'May', 'June'];
            data = [180000, 220000, 195000, 245000, 280000, 265000];
            break;
        case '1year':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            data = [180000, 220000, 195000, 245000, 280000, 265000, 290000, 275000, 260000, 240000, 210000, 195000];
            break;
        case 'ytd':
            const currentMonth = new Date().getMonth();
            labels = ['January', 'February', 'March', 'April', 'May', 'June'].slice(0, currentMonth + 1);
            data = [180000, 220000, 195000, 245000, 280000, 265000].slice(0, currentMonth + 1);
            break;
    }
    
    if (revenueChart) {
        revenueChart.data.labels = labels;
        revenueChart.data.datasets[0].data = data;
        revenueChart.data.datasets[1].data = new Array(labels.length).fill(200000);
        revenueChart.update();
    }
}

// Export Analytics Report
function exportAnalyticsReport() {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const reportData = {
        generatedOn: new Date().toLocaleString(),
        summary: {
            totalBookings: reservations.length,
            totalRevenue: reservations.reduce((sum, res) => {
                const amount = parseFloat(res.total?.replace(/[₱,]/g, '') || 0);
                return sum + amount;
            }, 0),
            averageBookingValue: 0
        },
        reservations: reservations
    };
    
    reportData.summary.averageBookingValue = reportData.summary.totalBookings > 0 ? 
        (reportData.summary.totalRevenue / reportData.summary.totalBookings).toFixed(2) : 0;
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    Swal.fire({
        icon: 'success',
        title: 'Report Exported!',
        text: 'Analytics report has been downloaded successfully.',
        timer: 2000,
        showConfirmButton: false
    });
}

// Refresh Analytics Data
function refreshAnalyticsData() {
    // Show loading state
    const tableBody = document.getElementById('analytics-table-body');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Refreshing data...</td></tr>';
    }
    
    // Simulate data refresh
    setTimeout(() => {
        updateAnalyticsKPIs();
        populateAnalyticsTable();
        
        // Refresh charts with new data
        if (revenueChart) revenueChart.update();
        if (roomPerformanceChart) roomPerformanceChart.update();
        if (bookingPatternsChart) bookingPatternsChart.update();
        if (demographicsChart) demographicsChart.update();
        if (seasonalTrendsChart) seasonalTrendsChart.update();
        
        Swal.fire({
            icon: 'success',
            title: 'Data Refreshed!',
            text: 'Analytics data has been updated.',
            timer: 1500,
            showConfirmButton: false
        });
    }, 1000);
}










