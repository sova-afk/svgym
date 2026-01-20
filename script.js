// Main App State
const state = {
    workouts: [],
    completedWorkouts: [],
    bodyMetrics: [],
    currentDate: new Date(),
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear(),
    personalRecords: {
        'Bench Press': 120,
        'Squat': 150,
        'Deadlift': 180,
        'Shoulder Press': 70
    }
};

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const workoutForm = document.getElementById('workoutForm');
const exercisesContainer = document.getElementById('exercisesContainer');
const addExerciseBtn = document.getElementById('addExerciseBtn');
const workoutHistory = document.getElementById('workoutHistory');
const upcomingWorkouts = document.getElementById('upcomingWorkouts');
const totalWorkoutsEl = document.getElementById('totalWorkouts');
const streakDaysEl = document.getElementById('streakDays');
const totalWeightEl = document.getElementById('totalWeight');
const todaysWorkout = document.getElementById('todaysWorkout');
const planTodayBtn = document.getElementById('planTodayBtn');
const addWorkoutBtn = document.getElementById('addWorkoutBtn');
const workoutModal = document.getElementById('workoutModal');
const closeWorkoutModal = document.getElementById('closeWorkoutModal');
const logWorkoutForm = document.getElementById('logWorkoutForm');
const completedWorkoutSelect = document.getElementById('completedWorkoutSelect');
const workoutRating = document.getElementById('workoutRating');
const ratingValue = document.getElementById('ratingValue');
const viewAllWorkoutsBtn = document.getElementById('viewAllWorkoutsBtn');
const addMetricBtn = document.getElementById('addMetricBtn');
const metricModal = document.getElementById('metricModal');
const closeMetricModal = document.getElementById('closeMetricModal');
const metricForm = document.getElementById('metricForm');
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const progressChart = document.getElementById('progressChart');
const exerciseSelect = document.getElementById('exerciseSelect');

// Utility Functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getMonthName(monthIndex) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
}

// Initialize the app
function init() {
    // Load data from localStorage
    loadData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set today's date in workout form
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workoutDate').value = today;
    document.getElementById('workoutDate').min = today;
    
    // Set up tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Refresh specific tab content if needed
            if (tabId === 'calendar') {
                renderCalendar();
            } else if (tabId === 'progress') {
                renderProgressChart();
                updateBodyMetrics();
            }
        });
    });
    
    // Add initial exercise to workout form
    addExercise();
    
    // Render initial data
    renderDashboard();
    renderWorkoutHistory();
    renderUpcomingWorkouts();
    updateStats();
    renderCalendar();
    renderProgressChart();
    updateBodyMetrics();
    
    // Check if today has a workout
    checkTodaysWorkout();
}

// Load data from localStorage
function loadData() {
    // Try to load workouts from localStorage
    const savedWorkouts = localStorage.getItem('gymtrack-workouts');
    if (savedWorkouts) {
        state.workouts = JSON.parse(savedWorkouts);
    } else {
        // Create some sample workouts
        state.workouts = [
            {
                id: 1,
                name: "Upper Body Strength",
                date: formatDate(new Date()),
                type: "strength",
                exercises: [
                    { name: "Bench Press", sets: 4, reps: 8, weight: 80 },
                    { name: "Overhead Press", sets: 3, reps: 10, weight: 40 },
                    { name: "Pull-ups", sets: 3, reps: 12, weight: 0 }
                ],
                notes: "Focus on form",
                completed: false
            },
            {
                id: 2,
                name: "Leg Day",
                date: formatDate(addDays(new Date(), 1)),
                type: "strength",
                exercises: [
                    { name: "Squat", sets: 5, reps: 5, weight: 100 },
                    { name: "Romanian Deadlift", sets: 3, reps: 10, weight: 70 },
                    { name: "Leg Press", sets: 4, reps: 12, weight: 120 }
                ],
                notes: "Go heavy on squats",
                completed: false
            },
            {
                id: 3,
                name: "Full Body Conditioning",
                date: formatDate(addDays(new Date(), 3)),
                type: "endurance",
                exercises: [
                    { name: "Burpees", sets: 3, reps: 15, weight: 0 },
                    { name: "Kettlebell Swings", sets: 4, reps: 20, weight: 24 },
                    { name: "Box Jumps", sets: 3, reps: 10, weight: 0 }
                ],
                notes: "Keep heart rate up",
                completed: false
            }
        ];
    }
    
    // Load completed workouts
    const savedCompleted = localStorage.getItem('gymtrack-completed');
    if (savedCompleted) {
        state.completedWorkouts = JSON.parse(savedCompleted);
    } else {
        state.completedWorkouts = [
            {
                id: Date.now() - 1,
                workoutId: 1,
                date: formatDate(addDays(new Date(), -2)),
                duration: 65,
                rating: 8,
                exercises: [
                    { name: "Bench Press", sets: 4, reps: 8, weight: 80 },
                    { name: "Overhead Press", sets: 3, reps: 10, weight: 40 },
                    { name: "Pull-ups", sets: 3, reps: 12, weight: 0 }
                ]
            },
            {
                id: Date.now() - 2,
                workoutId: 2,
                date: formatDate(addDays(new Date(), -5)),
                duration: 75,
                rating: 9,
                exercises: [
                    { name: "Squat", sets: 5, reps: 5, weight: 100 },
                    { name: "Romanian Deadlift", sets: 3, reps: 10, weight: 70 },
                    { name: "Leg Press", sets: 4, reps: 12, weight: 120 }
                ]
            }
        ];
    }
    
    // Load body metrics
    const savedMetrics = localStorage.getItem('gymtrack-metrics');
    if (savedMetrics) {
        state.bodyMetrics = JSON.parse(savedMetrics);
    } else {
        // Sample metrics
        state.bodyMetrics = [
            { date: formatDate(addDays(new Date(), -30)), weight: 78, bodyFat: 20, arm: 33, chest: 98 },
            { date: formatDate(addDays(new Date(), -15)), weight: 76, bodyFat: 19, arm: 34, chest: 99 },
            { date: formatDate(new Date()), weight: 75, bodyFat: 18, arm: 35, chest: 100 }
        ];
    }
    
    // Load personal records
    const savedPRs = localStorage.getItem('gymtrack-prs');
    if (savedPRs) {
        state.personalRecords = JSON.parse(savedPRs);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('gymtrack-workouts', JSON.stringify(state.workouts));
    localStorage.setItem('gymtrack-completed', JSON.stringify(state.completedWorkouts));
    localStorage.setItem('gymtrack-metrics', JSON.stringify(state.bodyMetrics));
    localStorage.setItem('gymtrack-prs', JSON.stringify(state.personalRecords));
}

// Set up event listeners
function setupEventListeners() {
    // Workout form submission
    workoutForm.addEventListener('submit', handleWorkoutSubmit);
    
    // Add exercise button
    addExerciseBtn.addEventListener('click', addExercise);
    
    // Plan today's workout
    planTodayBtn.addEventListener('click', () => {
        // Switch to plan tab and set today's date
        document.querySelector('[data-tab="plan"]').click();
        document.getElementById('workoutDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('workoutName').focus();
    });
    
    // Log workout button
    addWorkoutBtn.addEventListener('click', () => {
        // Populate workout select
        completedWorkoutSelect.innerHTML = '';
        state.workouts.forEach(workout => {
            if (!workout.completed) {
                const option = document.createElement('option');
                option.value = workout.id;
                option.textContent = `${workout.name} (${workout.date})`;
                completedWorkoutSelect.appendChild(option);
            }
        });
        
        // Show modal if there are workouts to log
        if (completedWorkoutSelect.options.length > 0) {
            workoutModal.classList.add('active');
        } else {
            alert('No planned workouts available to log. Please plan a workout first.');
        }
    });
    
    // Close workout modal
    closeWorkoutModal.addEventListener('click', () => {
        workoutModal.classList.remove('active');
    });
    
    // Log completed workout
    logWorkoutForm.addEventListener('submit', handleLogWorkout);
    
    // Workout rating slider
    workoutRating.addEventListener('input', () => {
        ratingValue.textContent = workoutRating.value;
    });
    
    // View all workouts button
    viewAllWorkoutsBtn.addEventListener('click', () => {
        document.querySelector('[data-tab="workouts"]').click();
    });
    
    // Add metric button
    addMetricBtn.addEventListener('click', () => {
        // Pre-fill with latest metrics if available
        if (state.bodyMetrics.length > 0) {
            const latest = state.bodyMetrics[state.bodyMetrics.length - 1];
            document.getElementById('inputWeight').value = latest.weight || '';
            document.getElementById('inputBodyFat').value = latest.bodyFat || '';
            document.getElementById('inputArm').value = latest.arm || '';
            document.getElementById('inputChest').value = latest.chest || '';
        }
        
        // Show modal
        metricModal.classList.add('active');
    });
    
    // Close metric modal
    closeMetricModal.addEventListener('click', () => {
        metricModal.classList.remove('active');
    });
    
    // Metric form submission
    metricForm.addEventListener('submit', handleMetricSubmit);
    
    // Calendar navigation
    prevMonthBtn.addEventListener('click', () => {
        state.calendarMonth--;
        if (state.calendarMonth < 0) {
            state.calendarMonth = 11;
            state.calendarYear--;
        }
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        state.calendarMonth++;
        if (state.calendarMonth > 11) {
            state.calendarMonth = 0;
            state.calendarYear++;
        }
        renderCalendar();
    });
    
    // Exercise select for progress chart
    exerciseSelect.addEventListener('change', renderProgressChart);
}

// Handle workout form submission
function handleWorkoutSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('workoutName').value;
    const date = document.getElementById('workoutDate').value;
    const type = document.getElementById('workoutType').value;
    const notes = document.getElementById('workoutNotes').value;
    
    // Get exercises
    const exerciseElements = document.querySelectorAll('.exercise-form');
    const exercises = [];
    
    exerciseElements.forEach(exercise => {
        const exerciseName = exercise.querySelector('.exercise-name-input').value;
        const sets = parseInt(exercise.querySelector('.exercise-sets-input').value);
        const reps = parseInt(exercise.querySelector('.exercise-reps-input').value);
        const weight = parseInt(exercise.querySelector('.exercise-weight-input').value) || 0;
        
        if (exerciseName) {
            exercises.push({
                name: exerciseName,
                sets: sets,
                reps: reps,
                weight: weight
            });
        }
    });
    
    if (exercises.length === 0) {
        alert('Please add at least one exercise.');
        return;
    }
    
    // Create workout object
    const workout = {
        id: Date.now(), // Simple ID generation
        name: name,
        date: date,
        type: type,
        exercises: exercises,
        notes: notes,
        completed: false
    };
    
    // Add to state
    state.workouts.push(workout);
    
    // Save to localStorage
    saveData();
    
    // Reset form
    workoutForm.reset();
    document.getElementById('workoutDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('workoutDate').min = new Date().toISOString().split('T')[0];
    
    // Clear exercises container and add one empty exercise
    exercisesContainer.innerHTML = '';
    addExercise();
    
    // Update UI
    renderDashboard();
    renderUpcomingWorkouts();
    updateStats();
    renderCalendar();
    
    // Show success message
    alert('Workout plan saved successfully!');
    
    // Switch to dashboard
    document.querySelector('[data-tab="dashboard"]').click();
}

// Add exercise form
function addExercise() {
    const exerciseCount = document.querySelectorAll('.exercise-form').length + 1;
    
    const exerciseHTML = `
        <div class="exercise-form mb-3 p-3" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h4 style="font-size: 16px;">Exercise ${exerciseCount}</h4>
                <button type="button" class="btn btn-small" style="background: var(--danger); color: white; padding: 4px 8px; font-size: 12px;" onclick="removeExercise(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-group">
                <input type="text" class="form-input exercise-name-input" placeholder="Exercise name" required>
            </div>
            <div class="d-flex gap-2">
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Sets</label>
                    <input type="number" class="form-input exercise-sets-input" min="1" max="10" value="3" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Reps</label>
                    <input type="number" class="form-input exercise-reps-input" min="1" max="50" value="10" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label class="form-label">Weight (kg)</label>
                    <input type="number" class="form-input exercise-weight-input" min="0" value="20">
                </div>
            </div>
        </div>
    `;
    
    exercisesContainer.insertAdjacentHTML('beforeend', exerciseHTML);
}

// Remove exercise form
function removeExercise(btn) {
    btn.closest('.exercise-form').remove();
    
    // Renumber exercises
    const exerciseForms = document.querySelectorAll('.exercise-form');
    exerciseForms.forEach((form, index) => {
        form.querySelector('h4').textContent = `Exercise ${index + 1}`;
    });
}

// Handle logging a completed workout
function handleLogWorkout(e) {
    e.preventDefault();
    
    const workoutId = parseInt(completedWorkoutSelect.value);
    const duration = parseInt(document.getElementById('workoutDuration').value);
    const rating = parseInt(workoutRating.value);
    
    // Find the workout
    const workout = state.workouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    // Mark as completed
    workout.completed = true;
    
    // Add to completed workouts
    const completedWorkout = {
        id: Date.now(),
        workoutId: workoutId,
        date: formatDate(new Date()),
        duration: duration,
        rating: rating,
        exercises: workout.exercises
    };
    
    state.completedWorkouts.push(completedWorkout);
    
    // Update personal records
    workout.exercises.forEach(exercise => {
        if (exercise.weight > (state.personalRecords[exercise.name] || 0)) {
            state.personalRecords[exercise.name] = exercise.weight;
        }
    });
    
    // Save data
    saveData();
    
    // Update UI
    renderDashboard();
    renderWorkoutHistory();
    renderUpcomingWorkouts();
    updateStats();
    renderCalendar();
    renderProgressChart();
    
    // Close modal and reset form
    workoutModal.classList.remove('active');
    logWorkoutForm.reset();
    ratingValue.textContent = '7';
    workoutRating.value = 7;
    
    // Show success message
    alert('Workout logged successfully!');
}

// Handle metric form submission
function handleMetricSubmit(e) {
    e.preventDefault();
    
    const weight = parseFloat(document.getElementById('inputWeight').value);
    const bodyFat = parseFloat(document.getElementById('inputBodyFat').value) || null;
    const arm = parseFloat(document.getElementById('inputArm').value) || null;
    const chest = parseFloat(document.getElementById('inputChest').value) || null;
    
    // Add metric
    const metric = {
        date: formatDate(new Date()),
        weight: weight,
        bodyFat: bodyFat,
        arm: arm,
        chest: chest
    };
    
    state.bodyMetrics.push(metric);
    
    // Save data
    saveData();
    
    // Update UI
    updateBodyMetrics();
    renderProgressChart();
    
    // Close modal and reset form
    metricModal.classList.remove('active');
    metricForm.reset();
    
    // Show success message
    alert('Body metrics saved successfully!');
}

// Render dashboard
function renderDashboard() {
    // Check today's workout
    checkTodaysWorkout();
    
    // Update stats
    updateStats();
    
    // Update personal records
    updatePersonalRecords();
}

// Check if today has a workout
function checkTodaysWorkout() {
    const today = formatDate(new Date());
    const todaysWorkoutEl = document.getElementById('todaysWorkout');
    const statusEl = document.getElementById('todayWorkoutStatus');
    
    const workout = state.workouts.find(w => w.date === today);
    
    if (workout) {
        if (workout.completed) {
            statusEl.textContent = 'Completed';
            statusEl.className = 'badge badge-success';
            
            const completed = state.completedWorkouts.find(cw => cw.workoutId === workout.id);
            todaysWorkoutEl.innerHTML = `
                <div class="workout-item completed">
                    <div>
                        <div class="workout-item-header">
                            <i class="fas fa-dumbbell workout-icon"></i>
                            <div class="workout-name">${workout.name}</div>
                        </div>
                        <div class="workout-details">${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)} • ${workout.exercises.length} exercises</div>
                        <div class="workout-details">Duration: ${completed ? completed.duration + ' min' : 'N/A'} • Rating: ${completed ? completed.rating + '/10' : 'N/A'}</div>
                    </div>
                </div>
                <button class="btn btn-outline w-100 mt-3" id="viewDetailsBtn">
                    <i class="fas fa-eye"></i> View Details
                </button>
            `;
            
            document.getElementById('viewDetailsBtn')?.addEventListener('click', () => {
                alert(`Workout Details:\n\n${workout.exercises.map(e => `${e.name}: ${e.sets}x${e.reps} @ ${e.weight}kg`).join('\n')}`);
            });
        } else {
            statusEl.textContent = 'Planned';
            statusEl.className = 'badge badge-primary';
            
            todaysWorkoutEl.innerHTML = `
                <div class="workout-item">
                    <div>
                        <div class="workout-item-header">
                            <i class="fas fa-dumbbell workout-icon"></i>
                            <div class="workout-name">${workout.name}</div>
                        </div>
                        <div class="workout-details">${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)} • ${workout.exercises.length} exercises</div>
                    </div>
                    <button class="btn btn-secondary" id="logTodayBtn">Log Completed</button>
                </div>
                <button class="btn btn-outline w-100 mt-3" id="viewPlanBtn">
                    <i class="fas fa-eye"></i> View Plan
                </button>
            `;
            
            document.getElementById('logTodayBtn')?.addEventListener('click', () => {
                // Pre-select this workout in the modal
                completedWorkoutSelect.value = workout.id;
                workoutModal.classList.add('active');
            });
            
            document.getElementById('viewPlanBtn')?.addEventListener('click', () => {
                alert(`Workout Plan:\n\n${workout.exercises.map(e => `${e.name}: ${e.sets}x${e.reps} @ ${e.weight}kg`).join('\n')}\n\nNotes: ${workout.notes}`);
            });
        }
    } else {
        statusEl.textContent = 'Not Started';
        statusEl.className = 'badge badge-warning';
        
        todaysWorkoutEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-dumbbell"></i>
                <h3>No workout planned for today</h3>
                <p>Plan a session to get started!</p>
                <button class="btn btn-primary mt-3" id="planTodayBtn2">
                    <i class="fas fa-plus"></i> Plan Today's Workout
                </button>
            </div>
        `;
        
        document.getElementById('planTodayBtn2')?.addEventListener('click', () => {
            document.querySelector('[data-tab="plan"]').click();
            document.getElementById('workoutDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('workoutName').focus();
        });
    }
}

// Update personal records display
function updatePersonalRecords() {
    const personalRecordsEl = document.getElementById('personalRecords');
    personalRecordsEl.innerHTML = '';
    
    // Show top 3 PRs
    const topPRs = Object.entries(state.personalRecords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    topPRs.forEach(([exercise, weight]) => {
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item';
        exerciseItem.innerHTML = `
            <div class="exercise-name">${exercise}</div>
            <div class="exercise-sets">${weight} kg</div>
        `;
        personalRecordsEl.appendChild(exerciseItem);
    });
}

// Update statistics
function updateStats() {
    // Total workouts
    const totalWorkouts = state.completedWorkouts.length;
    totalWorkoutsEl.textContent = totalWorkouts;
    
    // Calculate streak
    let streak = 0;
    const today = new Date();
    const sortedWorkouts = [...state.completedWorkouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedWorkouts.length > 0) {
        let lastDate = new Date(sortedWorkouts[0].date);
        streak = 1;
        
        for (let i = 1; i < sortedWorkouts.length; i++) {
            const currentDate = new Date(sortedWorkouts[i].date);
            const diffDays = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
                lastDate = currentDate;
            } else {
                break;
            }
        }
        
        // Check if streak is still active (last workout was yesterday or today)
        const lastWorkoutDate = new Date(sortedWorkouts[0].date);
        const daysSinceLastWorkout = Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastWorkout > 1) {
            streak = 0; // Streak broken
        }
    }
    
    streakDaysEl.textContent = streak;
    document.getElementById('currentStreak').textContent = streak;
    document.getElementById('streakProgress').style.width = `${Math.min(streak * 10, 100)}%`;
    
    // Total weight lifted
    let totalWeight = 0;
    state.completedWorkouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            totalWeight += exercise.sets * exercise.reps * exercise.weight;
        });
    });
    totalWeightEl.textContent = (totalWeight / 1000).toFixed(1) + 'k';
}

// Render workout history
function renderWorkoutHistory() {
    workoutHistory.innerHTML = '';
    
    if (state.completedWorkouts.length === 0) {
        workoutHistory.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>No workout history yet</h3>
                <p>Complete a workout to see it here!</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedWorkouts = [...state.completedWorkouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedWorkouts.forEach(workout => {
        const originalWorkout = state.workouts.find(w => w.id === workout.workoutId);
        const workoutItem = document.createElement('div');
        workoutItem.className = 'workout-item completed';
        workoutItem.innerHTML = `
            <div>
                <div class="workout-item-header">
                    <i class="fas fa-dumbbell workout-icon"></i>
                    <div class="workout-name">${originalWorkout ? originalWorkout.name : 'Workout'}</div>
                    <span class="badge badge-success">${workout.rating}/10</span>
                </div>
                <div class="workout-details">${workout.date} • ${workout.duration} min • ${workout.exercises.length} exercises</div>
                <div class="workout-details">Total volume: ${calculateWorkoutVolume(workout)} kg</div>
            </div>
            <button class="btn btn-outline btn-small view-workout-btn" data-id="${workout.id}">
                <i class="fas fa-eye"></i>
            </button>
        `;
        workoutHistory.appendChild(workoutItem);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-workout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const workoutId = parseInt(btn.getAttribute('data-id'));
            const workout = state.completedWorkouts.find(w => w.id === workoutId);
            const originalWorkout = state.workouts.find(w => w.id === workout.workoutId);
            
            if (workout) {
                alert(`Workout Details:\n\nDate: ${workout.date}\nDuration: ${workout.duration} min\nRating: ${workout.rating}/10\n\nExercises:\n${workout.exercises.map(e => `${e.name}: ${e.sets}x${e.reps} @ ${e.weight}kg`).join('\n')}\n\nNotes: ${originalWorkout ? originalWorkout.notes : 'N/A'}`);
            }
        });
    });
}

// Calculate workout volume
function calculateWorkoutVolume(workout) {
    let volume = 0;
    workout.exercises.forEach(exercise => {
        volume += exercise.sets * exercise.reps * exercise.weight;
    });
    return volume;
}

// Render upcoming workouts
function renderUpcomingWorkouts() {
    upcomingWorkouts.innerHTML = '';
    
    const today = formatDate(new Date());
    const upcoming = state.workouts
        .filter(w => w.date >= today && !w.completed)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3); // Show only next 3
    
    if (upcoming.length === 0) {
        upcomingWorkouts.innerHTML = `
            <div class="empty-state" style="padding: 20px 0;">
                <i class="fas fa-calendar-plus"></i>
                <p>No upcoming workouts</p>
            </div>
        `;
        return;
    }
    
    upcoming.forEach(workout => {
        const workoutItem = document.createElement('li');
        workoutItem.className = 'workout-item';
        workoutItem.innerHTML = `
            <div>
                <div class="workout-item-header">
                    <i class="fas fa-dumbbell workout-icon"></i>
                    <div class="workout-name">${workout.name}</div>
                </div>
                <div class="workout-details">${workout.date} • ${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}</div>
                <div class="workout-details">${workout.exercises.length} exercises</div>
            </div>
        `;
        upcomingWorkouts.appendChild(workoutItem);
    });
}

// Update body metrics
function updateBodyMetrics() {
    if (state.bodyMetrics.length === 0) return;
    
    const latest = state.bodyMetrics[state.bodyMetrics.length - 1];
    
    document.getElementById('weightMetric').textContent = latest.weight.toFixed(1);
    document.getElementById('bodyFatMetric').textContent = latest.bodyFat ? latest.bodyFat.toFixed(1) : '--';
    document.getElementById('armMetric').textContent = latest.arm ? latest.arm.toFixed(1) : '--';
    document.getElementById('chestMetric').textContent = latest.chest ? latest.chest.toFixed(1) : '--';
    
    // Calculate progress towards weight goal
    const goalWeight = 80;
    const startWeight = state.bodyMetrics.length > 0 ? state.bodyMetrics[0].weight : latest.weight;
    const progress = ((startWeight - latest.weight) / (startWeight - goalWeight)) * 100;
    
    document.getElementById('weightProgress').style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
    document.getElementById('weightGoal').textContent = goalWeight;
}

// Render progress chart
function renderProgressChart() {
    const ctx = progressChart.getContext('2d');
    const selectedExercise = exerciseSelect.value;
    
    // Filter data for selected exercise
    const exerciseData = state.completedWorkouts.flatMap(workout => 
        workout.exercises
            .filter(ex => ex.name.toLowerCase().includes(selectedExercise))
            .map(ex => ({
                date: workout.date,
                weight: ex.weight,
                volume: ex.sets * ex.reps * ex.weight
            }))
    );
    
    // Sort by date
    exerciseData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Clear previous chart
    if (window.progressChartInstance) {
        window.progressChartInstance.destroy();
    }
    
    // Create new chart
    window.progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: exerciseData.map(d => d.date.split('-').slice(1).join('/')), // MM/DD format
            datasets: [{
                label: 'Weight (kg)',
                data: exerciseData.map(d => d.weight),
                borderColor: 'var(--primary)',
                backgroundColor: 'rgba(74, 107, 255, 0.1)',
                tension: 0.3,
                yAxisID: 'y'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'var(--light-text)'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'var(--gray-text)'
                    },
                    grid: {
                        color: 'var(--border-color)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'var(--gray-text)'
                    },
                    grid: {
                        color: 'var(--border-color)'
                    }
                }
            }
        }
    });
}

// Render calendar
function renderCalendar() {
    calendarGrid.innerHTML = '';
    currentMonthEl.textContent = `${getMonthName(state.calendarMonth)} ${state.calendarYear}`;
    
    // Get first day of month
    const firstDay = new Date(state.calendarYear, state.calendarMonth, 1);
    const lastDay = new Date(state.calendarYear, state.calendarMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day';
        dayHeader.style.fontWeight = '600';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Empty cells before first day
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        emptyDay.style.visibility = 'hidden';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Days of the month
    const today = formatDate(new Date());
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${state.calendarYear}-${String(state.calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.dataset.date = dateStr;
        
        // Check if today
        if (dateStr === today) {
            dayElement.classList.add('today');
        }
        
        // Check if workout day
        const hasWorkout = state.workouts.some(w => w.date === dateStr);
        if (hasWorkout) {
            dayElement.classList.add('workout-day');
            const workout = state.workouts.find(w => w.date === dateStr);
            if (workout?.completed) {
                dayElement.style.backgroundColor = 'rgba(46, 204, 113, 0.4)';
            }
        }
        
        // Add click event to view workouts on that day
        dayElement.addEventListener('click', () => {
            const workoutsOnDay = state.workouts.filter(w => w.date === dateStr);
            if (workoutsOnDay.length > 0) {
                let message = `Workouts on ${dateStr}:\n\n`;
                workoutsOnDay.forEach(workout => {
                    message += `${workout.name} (${workout.type}) - ${workout.completed ? 'Completed' : 'Planned'}\n`;
                    if (workout.completed) {
                        const completed = state.completedWorkouts.find(cw => cw.workoutId === workout.id);
                        if (completed) {
                            message += `  Rating: ${completed.rating}/10, Duration: ${completed.duration} min\n`;
                        }
                    }
                    message += '\n';
                });
                alert(message);
            } else {
                alert(`No workouts planned for ${dateStr}`);
            }
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
