// Application State
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || {};
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};
let currentDate = new Date();
let currentViewDate = new Date();
let currentNoteSubject = null;
let pendingNoteQueue = []; // queue of subjectIds when marking multiple presents that require notes

// Chart instances
let trendChart, performanceChart, dailyPatternChart, distributionChart;

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const loginPage = document.getElementById('login-page');
const setupPage = document.getElementById('setup-page');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const setupForm = document.getElementById('setup-form');
const showSetupBtn = document.getElementById('show-setup');
const backToLoginBtn = document.getElementById('back-to-login');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const themeToggle = document.getElementById('theme-toggle');
const logoutBtn = document.getElementById('logout-btn');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const markAttendanceBtn = document.getElementById('mark-attendance-btn');
const addSubjectBtn = document.getElementById('add-subject-btn');
const addSubjectBtn2 = document.getElementById('add-subject-btn-2');
const attendanceModal = document.getElementById('attendance-modal');
const subjectModal = document.getElementById('subject-modal');
const noteModal = document.getElementById('note-modal');
const importModal = document.getElementById('import-modal');
const closeModals = document.querySelectorAll('.close-modal');
const addSubjectForm = document.getElementById('add-subject-form');
const todayClassesList = document.getElementById('today-classes-list');
const activityFeed = document.getElementById('activity-feed');
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthYear = document.getElementById('current-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const subjectFilter = document.getElementById('subject-filter');
const subjectsGrid = document.getElementById('subjects-grid');
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');
const analyticsPeriod = document.getElementById('analytics-period');
const analyticsSubject = document.getElementById('analytics-subject');
const exportDataBtn = document.getElementById('export-data');
const resetDataBtn = document.getElementById('reset-data');
const themeSelect = document.getElementById('theme-select');
const markAllPresentBtn = document.getElementById('mark-all-present');
const saveNoteBtn = document.getElementById('save-note');
const noteText = document.getElementById('note-text');
const noteSubjectName = document.getElementById('note-subject-name');
const exportDataBtn2 = document.getElementById('export-data-btn');
const importDataBtn = document.getElementById('import-data-btn');
const importFile = document.getElementById('import-file');
const confirmImportBtn = document.getElementById('confirm-import');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            checkLoginStatus();
        }, 500);
    }, 2000);

    // Event Listeners
    setupEventListeners();
    
    // Initialize current date display
    updateCurrentDate();
}

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    setupForm.addEventListener('submit', handleSetup);
    showSetupBtn.addEventListener('click', showSetupPage);
    backToLoginBtn.addEventListener('click', showLoginPage);
    menuToggle.addEventListener('click', toggleSidebar);
    themeToggle.addEventListener('click', toggleTheme);
    logoutBtn.addEventListener('click', handleLogout);
    markAttendanceBtn.addEventListener('click', showAttendanceModal);
    addSubjectBtn.addEventListener('click', showSubjectModal);
    addSubjectBtn2.addEventListener('click', showSubjectModal);
    closeModals.forEach(btn => btn.addEventListener('click', closeAllModals));
    addSubjectForm.addEventListener('submit', handleAddSubject);
    // Show/hide theory/practical sections based on selected type
    const subjectTypeSelect = document.getElementById('subject-type');
    const theorySection = document.getElementById('theory-section');
    const practicalSection = document.getElementById('practical-section');
    function toggleSubjectSections() {
        const val = subjectTypeSelect.value;
        if (theorySection) theorySection.style.display = (val === 'theory') ? 'block' : 'none';
        if (practicalSection) practicalSection.style.display = (val === 'practical' || val === 'lab') ? 'block' : 'none';
    }
    if (subjectTypeSelect) {
        subjectTypeSelect.addEventListener('change', toggleSubjectSections);
        // initialize state
        toggleSubjectSections();
    }
    prevMonthBtn.addEventListener('click', goToPreviousMonth);
    nextMonthBtn.addEventListener('click', goToNextMonth);
    subjectFilter.addEventListener('change', renderCalendar);
    togglePassword.addEventListener('click', togglePasswordVisibility);
    analyticsPeriod.addEventListener('change', renderAnalytics);
    analyticsSubject.addEventListener('change', renderAnalytics);
    exportDataBtn.addEventListener('click', exportAllData);
    exportDataBtn2.addEventListener('click', exportAllData);
    resetDataBtn.addEventListener('click', resetAllData);
    themeSelect.addEventListener('change', handleThemeChange);
    markAllPresentBtn.addEventListener('click', markAllPresent);
    saveNoteBtn.addEventListener('click', saveNote);
    importDataBtn.addEventListener('click', showImportModal);
    confirmImportBtn.addEventListener('click', handleImportData);
    // New Data Management controls
    const downloadJsonTemplateBtn = document.getElementById('download-json-template');
    const downloadCsvTemplateBtn = document.getElementById('download-csv-template');
    const fileInputElem = document.getElementById('import-file');
    if (downloadJsonTemplateBtn) downloadJsonTemplateBtn.addEventListener('click', downloadJsonTemplate);
    if (downloadCsvTemplateBtn) downloadCsvTemplateBtn.addEventListener('click', downloadCsvTemplate);
    if (fileInputElem) fileInputElem.addEventListener('change', handleImportFileChange);
    // Settings inline import button (imports the selected file directly)
    const confirmImportSettingsBtn = document.getElementById('confirm-import-settings');
    if (confirmImportSettingsBtn) confirmImportSettingsBtn.addEventListener('click', function() {
        // Use the same handler as the modal import button
        handleImportData();
    });

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.querySelector('a').getAttribute('href');
            showContentSection(target);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Special handling for analytics page
            if (target === '#analytics-view') {
                renderAnalytics();
            }
        });
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) && 
            sidebar.classList.contains('active')) {
            toggleSidebar();
        }
    });
}

function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        showDashboard();
        loadUserData();
    } else {
        showLoginPage();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (users[username] && users[username].password === password) {
        currentUser = users[username];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
        loadUserData();
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid username or password!', 'error');
    }
}

function handleSetup(e) {
    e.preventDefault();
    const fullName = document.getElementById('full-name').value;
    const studentId = document.getElementById('student-id').value;
    const username = document.getElementById('setup-username').value;
    const password = document.getElementById('setup-password').value;
    const course = document.getElementById('course').value;
    const semester = document.getElementById('semester').value;

    console.log('Sending registration data...');

    // Create user data
    const userData = {
        fullName,
        studentId,
        username,
        password,
        course,
        semester
    };

    // Send registration request to backend
    console.log('Registration data:', userData);

    fetch('http://localhost:8001/api/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        console.log('Registration response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Registration response:', data);
        if (data.success) {
            // Save user data to localStorage
            currentUser = {
                ...userData,
                subjects: [],
                _id: data.userId
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showDashboard();
            loadUserData();
            showNotification('Profile setup successful!', 'success');
        } else {
            showNotification(data.message || 'Registration failed!', 'error');
        }
    })
    .catch(error => {
        showNotification('Registration failed! Please try again.', 'error');
        console.error('Registration error:', error);
    });

    // Initialize attendance data for user
    if (!attendanceData[username]) {
        attendanceData[username] = {
            attendance: {},
            stats: {
                present: 0,
                absent: 0,
                percentage: 0,
                currentStreak: 0,
                bestStreak: 0
            },
            notes: {}
        };
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }

    showDashboard();
    loadUserData();
    showNotification('Profile setup successful!', 'success');
}

function handleAddSubject(e) {
    e.preventDefault();
    const subjectName = document.getElementById('subject-name').value;
    const facultyName = document.getElementById('faculty-name').value;
    const classTime = document.getElementById('class-time').value;
    const classDay = document.getElementById('class-day').value;
    const subjectType = document.getElementById('subject-type').value;

    // Read theory/practical specific fields (optional)
    const theoryHours = document.getElementById('theory-hours') ? document.getElementById('theory-hours').value : '';
    const theoryCredits = document.getElementById('theory-credits') ? document.getElementById('theory-credits').value : '';
    const theoryNotes = document.getElementById('theory-notes') ? document.getElementById('theory-notes').value : '';

    const practicalHours = document.getElementById('practical-hours') ? document.getElementById('practical-hours').value : '';
    const practicalLab = document.getElementById('practical-lab') ? document.getElementById('practical-lab').value : '';
    const practicalInstructor = document.getElementById('practical-instructor') ? document.getElementById('practical-instructor').value : '';
    const practicalNotes = document.getElementById('practical-notes') ? document.getElementById('practical-notes').value : '';

    // Build subject object including nested theory/practical sections (saved in JSON)
    const newSubject = {
        id: generateId(),
        name: subjectName,
        faculty: facultyName,
        time: classTime,
        day: classDay,
        type: subjectType,
        theory: {
            hours: theoryHours ? Number(theoryHours) : null,
            credits: theoryCredits ? Number(theoryCredits) : null,
            notes: theoryNotes || ''
        },
        practical: {
            hours: practicalHours ? Number(practicalHours) : null,
            lab: practicalLab || '',
            instructor: practicalInstructor || '',
            notes: practicalNotes || ''
        },
        addedDate: new Date().toISOString()
    };

    // Add subject to user's profile
    currentUser.subjects.push(newSubject);

    // Update user data
    users[currentUser.username] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Update UI
    loadUserData();
    closeAllModals();
    
    // Reset form
    document.getElementById('add-subject-form').reset();
    
    showNotification('Subject added successfully!', 'success');
}

function loadUserData() {
    if (!currentUser) return;

    // Update user info
    document.getElementById('user-name').textContent = currentUser.fullName;
    document.getElementById('user-avatar').textContent = currentUser.fullName.charAt(0).toUpperCase();

    // Populate Settings -> Profile Information with actual user data
    const fullNameEl = document.getElementById('current-full-name');
    const studentIdEl = document.getElementById('current-student-id');
    const courseEl = document.getElementById('current-course');
    const semesterEl = document.getElementById('current-semester');
    if (fullNameEl) fullNameEl.textContent = currentUser.fullName || '';
    if (studentIdEl) studentIdEl.textContent = currentUser.studentId || '';
    if (courseEl) courseEl.textContent = currentUser.course || '';
    if (semesterEl) semesterEl.textContent = currentUser.semester ? `${currentUser.semester}` : '';

    // Update dashboard stats
    updateDashboardStats();

    // Load today's classes
    loadTodaysClasses();

    // Load recent activity
    loadRecentActivity();

    // Load subjects
    loadSubjects();

    // Initialize calendar
    renderCalendar();

    // Update subject filter
    updateSubjectFilter();

    // Update analytics subject filter
    updateAnalyticsSubjectFilter();
}

function updateDashboardStats() {
    const userAttendance = attendanceData[currentUser.username];
    if (!userAttendance) return;

    const stats = userAttendance.stats;
    
    document.getElementById('total-present').textContent = stats.present;
    document.getElementById('total-absent').textContent = stats.absent;
    document.getElementById('attendance-percentage').textContent = `${stats.percentage}%`;
    document.getElementById('best-streak').textContent = stats.bestStreak;
    document.getElementById('current-streak').textContent = `${stats.currentStreak} days`;
}

function loadTodaysClasses() {
    todayClassesList.innerHTML = '';

    if (!currentUser.subjects || currentUser.subjects.length === 0) {
        todayClassesList.innerHTML = '<div class="class-item"><div class="class-info"><p>No subjects added yet. Add subjects to track attendance.</p></div></div>';
        return;
    }

    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];

    const todaysSubjects = currentUser.subjects.filter(subject => 
        subject.day.toLowerCase() === todayName
    );

    if (todaysSubjects.length === 0) {
        todayClassesList.innerHTML = '<div class="class-item"><div class="class-info"><p>No classes scheduled for today.</p></div></div>';
        return;
    }

    todaysSubjects.forEach(subject => {
        const classItem = document.createElement('div');
        classItem.className = 'class-item';

        const todayStr = getLocalDateString(today);
        const userAttendance = attendanceData[currentUser.username];
        let status = 'pending';

        if (userAttendance && userAttendance.attendance[todayStr]) {
            status = userAttendance.attendance[todayStr][subject.id] || 'pending';
        }

        // Render only the applicable attendance control(s):
        // - If present => show Present (disabled/non-actionable)
        // - If absent => show Absent (disabled/non-actionable)
        // - If pending => show both actionable buttons
        let actionsHtml = '';
        if (status === 'present') {
            actionsHtml = `<button class="attendance-btn present" data-subject="${subject.id}" disabled>
                                <i class="fas fa-check"></i> Present
                           </button>`;
        } else if (status === 'absent') {
            actionsHtml = `<button class="attendance-btn absent" data-subject="${subject.id}" disabled>
                                <i class="fas fa-times"></i> Absent
                           </button>`;
        } else {
            actionsHtml = `<button class="attendance-btn present" data-subject="${subject.id}">
                                <i class="fas fa-check"></i> Present
                           </button>
                           <button class="attendance-btn absent" data-subject="${subject.id}">
                                <i class="fas fa-times"></i> Absent
                           </button>`;
        }

        classItem.innerHTML = `
            <div class="class-info">
                <h4>${subject.name}</h4>
                <p>${subject.faculty} • ${getSubjectDisplayType(subject)}</p>
                <p class="class-time">${formatTime(subject.time)}</p>
            </div>
            <div class="attendance-actions">
                ${actionsHtml}
            </div>
        `;

        todayClassesList.appendChild(classItem);
    });

    // Add event listeners only to actionable (non-disabled) buttons inside today's list
    todayClassesList.querySelectorAll('.attendance-actions .attendance-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function() {
            const subjectId = this.getAttribute('data-subject');
            const status = this.classList.contains('present') ? 'present' : 'absent';

            if (status === 'present') {
                showNoteModal(subjectId);
            } else {
                markAttendance(subjectId, status);
            }
        });
    });
}

function loadRecentActivity() {
    activityFeed.innerHTML = '';

    const userAttendance = attendanceData[currentUser.username];
    if (!userAttendance || !userAttendance.attendance) {
        activityFeed.innerHTML = '<div class="activity-item"><div class="activity-info"><p>No recent activity.</p></div></div>';
        return;
    }

    const activities = [];
    const today = getLocalDateString(new Date());

    // Get attendance activities
    Object.entries(userAttendance.attendance).forEach(([date, dayAttendance]) => {
        Object.entries(dayAttendance).forEach(([subjectId, status]) => {
            const subject = currentUser.subjects.find(s => s.id === subjectId);
            if (subject) {
                activities.push({
                    type: status,
                    subject: subject.name,
                    date: date,
                    time: 'Class'
                });
            }
        });
    });

    // Get note activities
    if (userAttendance.notes) {
        Object.entries(userAttendance.notes).forEach(([date, dayNotes]) => {
            Object.entries(dayNotes).forEach(([subjectId, note]) => {
                const subject = currentUser.subjects.find(s => s.id === subjectId);
                if (subject && note) {
                    activities.push({
                        type: 'note',
                        subject: subject.name,
                        date: date,
                        time: 'Note added'
                    });
                }
            });
        });
    }

    // Sort activities by date (newest first) and take latest 5
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivities = activities.slice(0, 5);

    if (recentActivities.length === 0) {
        activityFeed.innerHTML = '<div class="activity-item"><div class="activity-info"><p>No recent activity.</p></div></div>';
        return;
    }

    recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const timeAgo = getTimeAgo(activity.date);
        
        activityItem.innerHTML = `
            <div class="activity-icon activity-${activity.type}">
                <i class="fas fa-${activity.type === 'present' ? 'check' : activity.type === 'absent' ? 'times' : 'sticky-note'}"></i>
            </div>
            <div class="activity-info">
                <h4>${activity.type === 'present' ? 'Present' : activity.type === 'absent' ? 'Absent' : 'Note'} for ${activity.subject}</h4>
                <p>${timeAgo}</p>
                <small class="activity-time">${activity.time}</small>
            </div>
        `;
        
        activityFeed.appendChild(activityItem);
    });
}

function loadSubjects() {
    subjectsGrid.innerHTML = '';

    if (!currentUser.subjects || currentUser.subjects.length === 0) {
        subjectsGrid.innerHTML = '<div class="no-subjects"><p>No subjects added yet. Click "Add Subject" to get started.</p></div>';
        return;
    }

    currentUser.subjects.forEach(subject => {
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-card';
        
        const attendancePercentage = calculateSubjectAttendance(subject.id);

        // Build theory/practical HTML (if present)
        let theoryHtml = '';
        if (subject.theory && (subject.theory.hours || subject.theory.credits || subject.theory.notes)) {
            theoryHtml = `
                <div class="subject-section">
                    <h4>Theory</h4>
                    <p><i class="fas fa-hourglass-half"></i> Hours: ${subject.theory.hours ?? '-'} • Credits: ${subject.theory.credits ?? '-'}</p>
                    ${subject.theory.notes ? `<p><i class="fas fa-sticky-note"></i> ${subject.theory.notes}</p>` : ''}
                </div>
            `;
        }

        let practicalHtml = '';
        if (subject.practical && (subject.practical.hours || subject.practical.lab || subject.practical.instructor || subject.practical.notes)) {
            practicalHtml = `
                <div class="subject-section">
                    <h4>Practical / Lab</h4>
                    <p><i class="fas fa-hourglass-half"></i> Hours: ${subject.practical.hours ?? '-'}</p>
                    ${subject.practical.lab ? `<p><i class="fas fa-map-marker-alt"></i> ${subject.practical.lab}</p>` : ''}
                    ${subject.practical.instructor ? `<p><i class="fas fa-user"></i> ${subject.practical.instructor}</p>` : ''}
                    ${subject.practical.notes ? `<p><i class="fas fa-sticky-note"></i> ${subject.practical.notes}</p>` : ''}
                </div>
            `;
        }

        subjectCard.innerHTML = `
            <div class="subject-header">
                <h3>${subject.name}</h3>
                <span class="attendance-percentage">${attendancePercentage}%</span>
            </div>
            <div class="subject-info">
                <p><i class="fas fa-user-tie"></i> ${subject.faculty}</p>
                <p><i class="fas fa-clock"></i> ${formatTime(subject.time)}</p>
                <p><i class="fas fa-calendar-day"></i> ${capitalizeFirstLetter(subject.day)}</p>
                <p><i class="fas fa-layer-group"></i> ${getSubjectDisplayType(subject)}</p>
            </div>
            ${theoryHtml}
            ${practicalHtml}
        `;

        subjectsGrid.appendChild(subjectCard);
    });
}

function renderCalendar() {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const selectedSubject = subjectFilter.value;
    
    // Update month/year display
    currentMonthYear.textContent = currentViewDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date(year, month, day);
    const dateStr = getLocalDateString(currentDate);
        
        // Check if this is today
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Check attendance status for this day
        const userAttendance = attendanceData[currentUser.username];
        if (userAttendance && userAttendance.attendance[dateStr]) {
            const dayAttendance = userAttendance.attendance[dateStr];
            const hasPresent = Object.values(dayAttendance).includes('present');
            const hasAbsent = Object.values(dayAttendance).includes('absent');
            
            if (hasPresent) {
                dayElement.classList.add('present');
            } else if (hasAbsent) {
                dayElement.classList.add('absent');
            }
        }
        
        // Check if there are notes for this day
        if (userAttendance && userAttendance.notes && userAttendance.notes[dateStr]) {
            const dayNotes = userAttendance.notes[dateStr];
            const hasNotes = Object.values(dayNotes).some(note => note && note.trim() !== '');
            if (hasNotes) {
                dayElement.classList.add('has-note');
            }
        }
        
        // Add click event to show day details
        dayElement.addEventListener('click', () => showDayDetails(dateStr));
        
        calendarGrid.appendChild(dayElement);
    }
}

function updateSubjectFilter() {
    subjectFilter.innerHTML = '<option value="all">All Subjects</option>';
    
    if (currentUser.subjects) {
        currentUser.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            subjectFilter.appendChild(option);
        });
    }
}

function updateAnalyticsSubjectFilter() {
    analyticsSubject.innerHTML = '<option value="all">All Subjects</option>';
    
    if (currentUser.subjects) {
        currentUser.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            analyticsSubject.appendChild(option);
        });
    }
}

// Navigation functions
function showLoginPage() {
    hideAllPages();
    loginPage.classList.add('active');
}

function showSetupPage() {
    hideAllPages();
    setupPage.classList.add('active');
}

function showDashboard() {
    hideAllPages();
    dashboard.classList.add('active');
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

function showContentSection(sectionId) {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    document.querySelector(sectionId).classList.add('active');
}

function toggleSidebar() {
    sidebar.classList.toggle('active');
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
        themeSelect.value = 'dark';
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
        themeSelect.value = 'light';
    }
}

function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    const icon = togglePassword.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginPage();
    
    // Reset forms
    loginForm.reset();
    setupForm.reset();
    
    showNotification('Logged out successfully!', 'success');
}

function showAttendanceModal() {
    attendanceModal.classList.add('active');
    
    // Populate attendance options
    const optionsContainer = document.getElementById('attendance-options');
    optionsContainer.innerHTML = '';
    
    if (!currentUser.subjects || currentUser.subjects.length === 0) {
        optionsContainer.innerHTML = '<p>No subjects added yet. Please add subjects first.</p>';
        return;
    }
    // Only show subjects scheduled for today in the attendance modal
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];

    const todaysSubjects = currentUser.subjects.filter(subject => (subject.day || '').toLowerCase() === todayName);

    if (todaysSubjects.length === 0) {
        optionsContainer.innerHTML = '<p>No classes scheduled for today.</p>';
        return;
    }

    todaysSubjects.forEach(subject => {
        const option = document.createElement('div');
        option.className = 'class-item';
        option.innerHTML = `
            <div class="class-info">
                <h4>${subject.name}</h4>
                <p>${subject.faculty} • ${formatTime(subject.time)}</p>
            </div>
            <div class="attendance-actions">
                <button class="attendance-btn present" data-subject="${subject.id}">
                    <i class="fas fa-check"></i> Present
                </button>
                <button class="attendance-btn absent" data-subject="${subject.id}">
                    <i class="fas fa-times"></i> Absent
                </button>
            </div>
        `;
        optionsContainer.appendChild(option);
    });

    // Add event listeners to attendance buttons inside the modal only
    optionsContainer.querySelectorAll('.attendance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subjectId = this.getAttribute('data-subject');
            const status = this.classList.contains('present') ? 'present' : 'absent';

            if (status === 'present') {
                // Ask for a note before marking present
                showNoteModal(subjectId);
            } else {
                markAttendance(subjectId, status);
            }
        });
    });
}

function showSubjectModal() {
    subjectModal.classList.add('active');
}

function showNoteModal(subjectId) {
    currentNoteSubject = subjectId;
    const subject = currentUser.subjects.find(s => s.id === subjectId);
    if (subject) {
        noteSubjectName.textContent = subject.name;
        noteText.value = '';
        noteModal.classList.add('active');
        // focus the textarea so user can immediately type a note
        setTimeout(() => {
            noteText.focus();
        }, 50);
    }
}

function showImportModal() {
    importModal.classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    currentNoteSubject = null;
    noteText.value = '';
    // If user closed modals manually, cancel any pending batch operations
    pendingNoteQueue = [];
}

function markAttendance(subjectId, status, skipClose = false) {
    const subject = currentUser.subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    const today = getLocalDateString(new Date());
    
    // Initialize user attendance data if not exists
    if (!attendanceData[currentUser.username]) {
        attendanceData[currentUser.username] = {
            attendance: {},
            stats: {
                present: 0,
                absent: 0,
                percentage: 0,
                currentStreak: 0,
                bestStreak: 0
            },
            notes: {}
        };
    }
    
    // Initialize day attendance if not exists
    if (!attendanceData[currentUser.username].attendance[today]) {
        attendanceData[currentUser.username].attendance[today] = {};
    }
    
    // Mark attendance
    attendanceData[currentUser.username].attendance[today][subjectId] = status;
    
    // Update stats
    updateAttendanceStats();
    
    // Save to localStorage
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    
    // Update UI
    updateDashboardStats();
    loadRecentActivity();
    loadTodaysClasses();
    
    // Close modal only when not part of a batched note flow
    if (!skipClose) {
        closeAllModals();
    }

    showNotification(`Marked ${status} for ${subject.name}`, 'success');
}

function markAllPresent() {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today.getDay()];

    const todaysSubjects = currentUser.subjects.filter(subject => 
        (subject.day || '').toLowerCase() === todayName
    );

    if (todaysSubjects.length === 0) {
        showNotification('No classes scheduled for today!', 'warning');
        return;
    }

    // Build a queue of subjects that need notes and start the sequential note flow
    pendingNoteQueue = todaysSubjects.map(s => s.id);

    // Inform the user and start with the first subject's note modal
    showNotification(`You will be prompted to add notes for ${todaysSubjects.length} classes.`, 'info');
    processNextPendingNote();
}

function processNextPendingNote() {
    // Pop next subject from the queue and show note modal. If none left, finish.
    if (!pendingNoteQueue || pendingNoteQueue.length === 0) {
        // Finished processing all notes
        pendingNoteQueue = [];
        // Refresh UI just in case
        updateDashboardStats();
        loadRecentActivity();
        loadTodaysClasses();
        showNotification('All selected classes marked present.', 'success');
        return;
    }

    const nextSubjectId = pendingNoteQueue.shift();
    // Open note modal for this subject
    showNoteModal(nextSubjectId);
}

function saveNote() {
    // Require a subject to be set
    if (!currentNoteSubject) return;

    const subject = currentUser.subjects.find(s => s.id === currentNoteSubject);
    if (!subject) return;

    const today = getLocalDateString(new Date());
    const note = noteText.value.trim();

    // If no note provided, ask user to confirm marking present without a note
    if (!note) {
        const ok = confirm('No note entered. Do you want to mark Present without a note?');
        if (!ok) return; // user cancelled, stay in modal
    }

    // Initialize notes if not exists
    if (!attendanceData[currentUser.username].notes) {
        attendanceData[currentUser.username].notes = {};
    }

    if (!attendanceData[currentUser.username].notes[today]) {
        attendanceData[currentUser.username].notes[today] = {};
    }

    // Save note (may be empty string if user confirmed)
    attendanceData[currentUser.username].notes[today][currentNoteSubject] = note;

    // Persist notes before marking attendance
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));

    // Mark attendance as present but don't close modals (we're in a batched flow)
    markAttendance(currentNoteSubject, 'present', true);

    // Close only the note modal so we can open the next one in the queue (if any)
    const noteModalEl = document.getElementById('note-modal');
    if (noteModalEl) noteModalEl.classList.remove('active');
    currentNoteSubject = null;
    noteText.value = '';

    showNotification(`Marked Present for ${subject.name}${note ? ' — note saved.' : ''}`, 'success');

    // Continue with next subject in the pending queue (if any)
    setTimeout(() => {
        processNextPendingNote();
    }, 150);
}

function updateAttendanceStats() {
    const userAttendance = attendanceData[currentUser.username];
    if (!userAttendance) return;
    
    let present = 0;
    let absent = 0;
    
    // Count present and absent days
    Object.values(userAttendance.attendance).forEach(day => {
        Object.values(day).forEach(status => {
            if (status === 'present') present++;
            if (status === 'absent') absent++;
        });
    });
    
    // Calculate percentage
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    // Calculate streaks (simplified)
    let currentStreak = 0;
    let bestStreak = 0;
    
    // Update stats
    userAttendance.stats.present = present;
    userAttendance.stats.absent = absent;
    userAttendance.stats.percentage = percentage;
    userAttendance.stats.currentStreak = currentStreak;
    userAttendance.stats.bestStreak = bestStreak;
}

function goToPreviousMonth() {
    currentViewDate.setMonth(currentViewDate.getMonth() - 1);
    renderCalendar();
}

function goToNextMonth() {
    currentViewDate.setMonth(currentViewDate.getMonth() + 1);
    renderCalendar();
}

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
}

function handleThemeChange() {
    const theme = themeSelect.value;
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        themeToggle.querySelector('i').className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        themeToggle.querySelector('i').className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        // Auto mode - use system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            themeToggle.querySelector('i').className = 'fas fa-sun';
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            themeToggle.querySelector('i').className = 'fas fa-moon';
        }
        localStorage.setItem('theme', 'auto');
    }
}

function exportAllData() {
    const userData = {
        user: currentUser,
        attendance: attendanceData[currentUser.username],
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edutrack-backup-${currentUser.username}-${getLocalDateString(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data exported successfully!', 'success');
}

function handleImportData() {
    const file = importFile.files[0];
    if (!file) {
        showNotification('Please select a file to import!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Try parse as JSON; keep backward compatibility with full-export backups
            if (file.name.toLowerCase().endsWith('.json')) {
                const importedData = JSON.parse(e.target.result);

                // If it's a full export (contains user + attendance), restore those
                if (importedData.user && importedData.attendance) {
                    users[currentUser.username] = importedData.user;
                    localStorage.setItem('users', JSON.stringify(users));

                    attendanceData[currentUser.username] = importedData.attendance;
                    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));

                    currentUser = importedData.user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    loadUserData();
                    closeAllModals();
                    showNotification('Full backup imported successfully!', 'success');
                    return;
                }

                // Otherwise treat as a timetable JSON (timetable array)
                if (importedData.timetable && Array.isArray(importedData.timetable)) {
                    // Convert timetable entries into subjects and add to user's subjects
                    importedData.timetable.forEach(entry => {
                        const subj = {
                            id: generateId(),
                            name: entry.subject || entry.subjectName || 'Unknown',
                            faculty: entry.faculty || '',
                            day: (entry.day || '').toLowerCase(),
                            // determine type from entry if provided, otherwise from nested objects
                            type: entry.type || (entry.theory ? 'theory' : entry.practical ? 'practical' : ''),
                            time: entry.start || entry.time || '',
                            location: entry.location || entry.room || '',
                            theory: entry.theory || { hours: null, credits: null, notes: '' },
                            practical: entry.practical || { hours: null, lab: '', instructor: '', notes: '' },
                            addedDate: new Date().toISOString()
                        };
                        currentUser.subjects.push(subj);
                    });

                    users[currentUser.username] = currentUser;
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    loadUserData();
                    closeAllModals();
                    showNotification('Timetable imported and added to your subjects.', 'success');
                    return;
                }

                showNotification('JSON does not contain expected structures (user/attendance or timetable).', 'error');
                return;
            }

            // CSV handling: simple timetable import (expects header: Subject,Faculty,Day,Start,End,Location)
            if (file.name.toLowerCase().endsWith('.csv')) {
                const csvText = e.target.result;
                const rows = csvText.split(/\r?\n/).filter(r => r.trim());
                const header = rows.shift().split(',').map(h => h.trim().toLowerCase());
                rows.forEach(r => {
                    const cols = r.split(',');
                    const obj = {};
                    header.forEach((h, i) => obj[h] = (cols[i] || '').trim());
                    currentUser.subjects.push({
                        id: generateId(),
                        name: obj.subject || obj['subject'] || 'Unknown',
                        faculty: obj.faculty || '',
                        day: obj.day || '',
                        time: obj.start || '',
                        location: obj.location || '',
                        addedDate: new Date().toISOString()
                    });
                });

                users[currentUser.username] = currentUser;
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                loadUserData();
                closeAllModals();
                showNotification('CSV timetable imported successfully.', 'success');
                return;
            }
        } catch (error) {
            showNotification('Error reading the file!', 'error');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

// Download template helpers
function downloadJsonTemplate() {
    const sample = {
        timetable: [
            { subject: 'Data Structures', faculty: 'Prof. Singh', day: 'Monday', start: '09:00', end: '10:00', location: 'Room 101', theory: { hours: 3, credits: 3, notes: 'Core theory' } },
            { subject: 'Artificial Intelligence Lab', faculty: 'Prof. Mehta', day: 'Wednesday', start: '11:00', end: '13:00', location: 'Lab 2', practical: { hours: 2, lab: 'Lab 2', instructor: 'Lab Asst' } }
        ]
    };
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable-template.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function downloadCsvTemplate() {
    const lines = [
        'Subject,Faculty,Day,Start,End,Location',
        'Data Structures,Prof. Singh,Monday,09:00,10:00,Room 101',
        'Artificial Intelligence,Prof. Mehta,Wednesday,11:00,12:00,Room 202'
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable-template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function handleImportFileChange(e) {
    const file = e.target.files[0];
    const nameEl = document.getElementById('file-name');
    if (file) {
        nameEl.textContent = file.name;
    } else {
        nameEl.textContent = 'No file selected';
    }
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all your data? This action cannot be undone.')) {
        // Reset user data
        currentUser.subjects = [];
        users[currentUser.username] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Reset attendance data
        attendanceData[currentUser.username] = {
            attendance: {},
            stats: {
                present: 0,
                absent: 0,
                percentage: 0,
                currentStreak: 0,
                bestStreak: 0
            },
            notes: {}
        };
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        
        // Reload UI
        loadUserData();
        showNotification('All data has been reset successfully!', 'success');
    }
}

// Analytics functions (simplified for this example)
function renderAnalytics() {
    // Build attendance analytics charts and smart insights
    if (!currentUser) return;

    const userAttendance = attendanceData[currentUser.username] || { attendance: {}, stats: {}, notes: {} };

    // Helper: last N local date strings
    function lastNDates(n) {
        const arr = [];
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            arr.push(getLocalDateString(d));
        }
        return arr;
    }

    // 1) Attendance trend (last 14 days) - percentage of classes attended each day
    const labels = lastNDates(14);
    const trendData = labels.map(dateStr => {
        const dayAttendance = userAttendance.attendance[dateStr] || {};
        const presentCount = Object.values(dayAttendance).filter(s => s === 'present').length;
        // compute scheduled classes for that weekday
        const d = new Date(dateStr + 'T00:00');
        const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const weekday = dayNames[d.getDay()];
        const scheduled = currentUser.subjects.filter(s => (s.day || '').toLowerCase() === weekday).length;
        const pct = scheduled > 0 ? Math.round((presentCount / scheduled) * 100) : 0;
        return pct;
    });

    // 2) Subject performance (per-subject percentage)
    const subjectLabels = currentUser.subjects.map(s => s.name);
    const subjectData = currentUser.subjects.map(s => calculateSubjectAttendance(s.id));

    // 3) Daily pattern (weekday totals present count)
    const weekdayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weekdayCounts = [0,0,0,0,0,0,0];
    Object.entries(userAttendance.attendance).forEach(([dateStr, dayAttendance]) => {
        const d = new Date(dateStr + 'T00:00');
        const idx = d.getDay();
        weekdayCounts[idx] += Object.values(dayAttendance).filter(s => s === 'present').length;
    });

    // 4) Distribution (present vs absent total)
    let totalPresent = 0, totalAbsent = 0;
    Object.values(userAttendance.attendance).forEach(day => {
        Object.values(day).forEach(s => {
            if (s === 'present') totalPresent++;
            if (s === 'absent') totalAbsent++;
        });
    });

    // Destroy existing charts if present
    try { if (trendChart) trendChart.destroy(); } catch(e){}
    try { if (performanceChart) performanceChart.destroy(); } catch(e){}
    try { if (dailyPatternChart) dailyPatternChart.destroy(); } catch(e){}
    try { if (distributionChart) distributionChart.destroy(); } catch(e){}

    // Create charts
    const trendCtx = document.getElementById('attendance-trend-chart');
    if (trendCtx) {
        trendChart = new Chart(trendCtx.getContext('2d'), {
            type: 'line',
            data: { labels, datasets: [{ label: 'Attendance %', data: trendData, borderColor: 'rgba(75,192,192,1)', backgroundColor: 'rgba(75,192,192,0.2)', fill: true }] },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }

    const perfCtx = document.getElementById('subject-performance-chart');
    if (perfCtx) {
        performanceChart = new Chart(perfCtx.getContext('2d'), {
            type: 'bar',
            data: { labels: subjectLabels, datasets: [{ label: 'Attendance %', data: subjectData, backgroundColor: subjectData.map(v => v >= 75 ? '#4cc9f0' : v >= 50 ? '#f8961e' : '#f72585') }] },
            options: { responsive: true, indexAxis: 'y', scales: { x: { beginAtZero: true, max: 100 } } }
        });
    }

    const dailyCtx = document.getElementById('daily-pattern-chart');
    if (dailyCtx) {
        dailyPatternChart = new Chart(dailyCtx.getContext('2d'), {
            type: 'bar',
            data: { labels: weekdayNames, datasets: [{ label: 'Present count', data: weekdayCounts, backgroundColor: '#4895ef' }] },
            options: { responsive: true }
        });
    }

    const distCtx = document.getElementById('attendance-distribution-chart');
    if (distCtx) {
        distributionChart = new Chart(distCtx.getContext('2d'), {
            type: 'doughnut',
            data: { labels: ['Present','Absent'], datasets: [{ data: [totalPresent, totalAbsent], backgroundColor: ['#4cc9f0','#f72585'] }] },
            options: { responsive: true }
        });
    }

    // Smart Insights: top/bottom subjects and quick tips
    const insightsContainer = document.getElementById('insights-container');
    if (insightsContainer) {
        // Compute top subject
        let top = null, bottom = null;
        currentUser.subjects.forEach(s => {
            const pct = calculateSubjectAttendance(s.id);
            if (!top || pct > top.pct) top = { subject: s.name, pct };
            if (!bottom || pct < bottom.pct) bottom = { subject: s.name, pct };
        });

        const tips = [];
        if (top) tips.push(`<div class="insight-card success"><h4>Top Subject</h4><p>${top.subject} — ${top.pct}% attendance</p></div>`);
        if (bottom) tips.push(`<div class="insight-card danger"><h4>Needs Attention</h4><p>${bottom.subject} — ${bottom.pct}% attendance</p></div>`);
        tips.push(`<div class="insight-card warning"><h4>Overall</h4><p>${totalPresent} presents vs ${totalAbsent} absents recorded</p></div>`);

        insightsContainer.innerHTML = tips.join('\n');
    }
}

function showDayDetails(dateStr) {
    const userAttendance = attendanceData[currentUser.username];
    let message = `Details for ${new Date(dateStr).toLocaleDateString()}:\n\n`;
    
    if (userAttendance && userAttendance.attendance[dateStr]) {
        Object.entries(userAttendance.attendance[dateStr]).forEach(([subjectId, status]) => {
            const subject = currentUser.subjects.find(s => s.id === subjectId);
            if (subject) {
                message += `${subject.name}: ${status}\n`;
                
                // Add note if exists
                if (userAttendance.notes && userAttendance.notes[dateStr] && userAttendance.notes[dateStr][subjectId]) {
                    message += `  Note: ${userAttendance.notes[dateStr][subjectId]}\n`;
                }
                message += '\n';
            }
        });
    } else {
        message += 'No attendance recorded for this day.';
    }
    
    alert(message);
}

// Return a local date string YYYY-MM-DD (avoids UTC/ISO timezone shifts)
function getLocalDateString(date = new Date()) {
    const d = new Date(date.getTime());
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Utility functions
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function formatSubjectType(type) {
    const types = {
        'theory': 'Theory',
        'practical': 'Practical',
        'lab': 'Lab'
    };
    return types[type] || type;
}

// Determine a displayable subject type when `type` may be missing
function getSubjectDisplayType(subject) {
    if (!subject) return 'Unknown';
    // Prefer explicit type
    if (subject.type) {
        const mapped = formatSubjectType(subject.type);
        return mapped || 'Unknown';
    }
    // Fallback: inspect nested objects
    if (subject.theory && (subject.theory.hours || subject.theory.credits || (subject.theory.notes && subject.theory.notes.trim() !== ''))) {
        return 'Theory';
    }
    if (subject.practical && (subject.practical.hours || subject.practical.lab || subject.practical.instructor || (subject.practical.notes && subject.practical.notes.trim() !== ''))) {
        return 'Practical';
    }
    return 'Unknown';
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function calculateSubjectAttendance(subjectId) {
    // Simplified calculation for demo
    const userAttendance = attendanceData[currentUser.username];
    if (!userAttendance || !userAttendance.attendance) return 0;
    
    let present = 0;
    let total = 0;
    
    Object.values(userAttendance.attendance).forEach(day => {
        if (day[subjectId]) {
            total++;
            if (day[subjectId] === 'present') {
                present++;
            }
        }
    });
    
    return total > 0 ? Math.round((present / total) * 100) : 0;
}

function getTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Check for saved theme preference on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    themeToggle.querySelector('i').className = 'fas fa-moon';
    themeSelect.value = 'light';
} else {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    themeToggle.querySelector('i').className = 'fas fa-sun';
    themeSelect.value = 'dark';
}