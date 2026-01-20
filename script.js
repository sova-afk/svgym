// DOM Elements
const workoutForm = document.getElementById('workout-form');
const workoutList = document.getElementById('workout-list');
const totalExercisesElement = document.getElementById('total-exercises');
const totalSetsElement = document.getElementById('total-sets');
const totalVolumeElement = document.getElementById('total-volume');
const clearWorkoutButton = document.getElementById('clear-workout');
const timerDisplay = document.getElementById('timer-display');
const timerStartButton = document.getElementById('timer-start');
const timerPauseButton = document.getElementById('timer-pause');
const timerResetButton = document.getElementById('timer-reset');
const presetButtons = document.querySelectorAll('.preset-btn');
const customTimeInput = document.getElementById('custom-time');
const setCustomTimeButton = document.getElementById('set-custom-time');
const currentDateElement = document.getElementById('current-date');
const exportDataButton = document.getElementById('export-data');
const resetDataButton = document.getElementById('reset-data');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// App State
let workouts = JSON.parse(localStorage.getItem('fitTrackWorkouts')) || [];
let timerInterval = null;
let timerSeconds = 90;
let timerRunning = false;
let workoutStats = JSON.parse(localStorage.getItem('fitTrackStats')) || {
    totalWorkouts: 0,
    totalExercises: 0,
    totalSets: 0,
    totalVolume: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    updateDateDisplay();
    
    // Load workouts from localStorage
    loadWorkouts();
    
    // Update stats
    updateStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize chart
    initializeChart();
    
    // Show welcome toast
    showToast('Welcome to FitTrack Pro! Add your first exercise to get started.', 'success');
});

// Update date display
function updateDateDisplay() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Setup event listeners
function setupEventListeners() {
    // Workout form submission
    workoutForm.addEventListener('submit', addWorkout);
    
    // Clear workout button
    clearWorkoutButton.addEventListener('click', clearWorkouts);
    
    // Timer controls
    timerStartButton.addEventListener('click', startTimer);
    timerPauseButton.addEventListener('click', pauseTimer);
    timerResetButton.addEventListener('click', resetTimer);
    
    // Timer presets
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const time = parseInt(this.getAttribute('data-time'));
            setTimer(time);
        });
    });
    
    // Custom time set
    setCustomTimeButton.addEventListener('click', function() {
        const customTime = parseInt(customTimeInput.value);
        if (customTime && customTime >= 10 && customTime <= 600) {
            setTimer(customTime);
            showToast(`Timer set to ${customTime} seconds`, 'info');
        } else {
            showToast('Please enter a value between 10 and 600 seconds', 'danger');
        }
    });
    
    // Data management
    exportDataButton.addEventListener('click', exportData);
    resetDataButton.addEventListener('click', resetData);
}

// Add workout function
function addWorkout(e) {
    e.preventDefault();
    
    const exerciseName = document.getElementById('exercise-name').value;
    const exerciseType = document.getElementById('exercise-type').value;
    const muscleGroup = document.getElementById('muscle-group').value;
    const sets = parseInt(document.getElementById('sets').value);
    const reps = parseInt(document.getElementById('reps').value);
    const weight = parseFloat(document.getElementById('weight').value);
    
    // Calculate volume
    const volume = sets * reps * weight;
    
    // Create workout object
    const workout = {
        id: Date.now(),
        name: exerciseName,
        type: exerciseType,
        muscleGroup: muscleGroup,
        sets: sets,
        reps: reps,
        weight: weight,
        volume: volume,
        date: new Date().toISOString()
    };
    
    // Add to workouts array
    workouts.push(workout);
    
    // Save to localStorage
    saveWorkouts();
    
    // Update UI
    renderWorkoutItem(workout);
    
    // Update stats
    updateStats();
    
    // Reset form
    workoutForm.reset();
    
    // Set default values
    document.getElementById('sets').value = 3;
    document.getElementById('reps').value = 10;
    document.getElementById('weight').value = 0;
    
    // Show success message
    showToast(`${exerciseName} added to your workout!`, 'success');
}

// Render workout item
function renderWorkoutItem(workout) {
    // Remove empty state if present
    const emptyState = workoutList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Create workout item
    const workoutItem = document.createElement('div');
    workoutItem.className = 'workout-item';
    workoutItem.setAttribute('data-id', workout.id);
    
    // Format weight display
    const weightDisplay = workout.weight > 0 ? `${workout.weight} kg` : 'Bodyweight';
    
    workoutItem.innerHTML = `
        <div class="workout-info">
            <h3>${workout.name}</h3>
            <div class="workout-meta">
                <span><i class="fas fa-tag"></i> ${workout.type}</span>
                <span><i class="fas fa-user"></i> ${workout.muscleGroup}</span>
                <span><i class="fas fa-layer-group"></i> ${workout.sets} sets</span>
                <span><i class="fas fa-redo"></i> ${workout.reps} reps</span>
                <span><i class="fas fa-weight-hanging"></i> ${weightDisplay}</span>
            </div>
        </div>
        <div class="workout-actions">
            <button class="edit-workout" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-workout" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners to action buttons
    const editButton = workoutItem.querySelector('.edit-workout');
    const deleteButton = workoutItem.querySelector('.delete-workout');
    
    editButton.addEventListener('click', () => editWorkout(workout.id));
    deleteButton.addEventListener('click', () => deleteWorkout(workout.id));
    
    // Add to list
    workoutList.prepend(workoutItem);
}

// Load workouts from storage
function loadWorkouts() {
    if (workouts.length === 0) {
        return;
    }
    
    // Clear the list first (except empty state)
    const emptyState = workoutList.querySelector('.empty-state');
    if (emptyState) {
        workoutList.innerHTML = '';
        workoutList.appendChild(emptyState);
    } else {
        workoutList.innerHTML = '<div class="empty-state"><i class="fas fa-dumbbell"></i><p>No exercises added yet. Start by adding your first exercise!</p></div>';
    }
    
    // Render each workout
    workouts.forEach(workout => {
        renderWorkoutItem(workout);
    });
}

// Delete workout
function deleteWorkout(id) {
    workouts = workouts.filter(workout => workout.id !== id);
    saveWorkouts();
    
    const workoutItem = document.querySelector(`.workout-item[data-id="${id}"]`);
    if (workoutItem) {
        workoutItem.remove();
    }
    
    updateStats();
    
    // Show empty state if no workouts left
    if (workouts.length === 0) {
        workoutList.innerHTML = '<div class="empty-state"><i class="fas fa-dumbbell"></i><p>No exercises added yet. Start by adding your first exercise!</p></div>';
    }
    
    showToast('Exercise removed from workout', 'info');
}

// Edit workout (simplified version)
function editWorkout(id) {
    const workout = workouts.find(w => w.id === id);
    if (!workout) return;
    
    // Populate form with workout data
    document.getElementById('exercise-name').value = workout.name;
    document.getElementById('exercise-type').value = workout.type;
    document.getElementById('muscle-group').value = workout.muscleGroup;
    document.getElementById('sets').value = workout.sets;
    document.getElementById('reps').value = workout.reps;
    document.getElementById('weight').value = workout.weight;
    
    // Remove the workout (will be re-added when form is submitted)
    deleteWorkout(id);
    
    // Scroll to form
    document.querySelector('.workout-input-section').scrollIntoView({ behavior: 'smooth' });
    
    showToast('Edit your exercise below', 'info');
}

// Clear all workouts
function clearWorkouts() {
    if (workouts.length === 0) {
        showToast('No workouts to clear', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear all exercises from today\'s workout?')) {
        workouts = [];
        saveWorkouts();
        workoutList.innerHTML = '<div class="empty-state"><i class="fas fa-dumbbell"></i><p>No exercises added yet. Start by adding your first exercise!</p></div>';
        updateStats();
        showToast('All exercises cleared', 'danger');
    }
}

// Update stats
function updateStats() {
    const totalExercises = workouts.length;
    const totalSets = workouts.reduce((sum, workout) => sum + workout.sets, 0);
    const totalVolume = workouts.reduce((sum, workout) => sum + workout.volume, 0);
    
    totalExercisesElement.textContent = totalExercises;
    totalSetsElement.textContent = totalSets;
    totalVolumeElement.textContent = totalVolume.toFixed(1);
    
    // Update workout stats
    workoutStats.totalExercises = totalExercises;
    workoutStats.totalSets = totalSets;
    workoutStats.totalVolume = totalVolume;
    
    // Update localStorage
    localStorage.setItem('fitTrackStats', JSON.stringify(workoutStats));
}

// Save workouts to localStorage
function saveWorkouts() {
    localStorage.setItem('fitTrackWorkouts', JSON.stringify(workouts));
}

// Timer Functions
function setTimer(seconds) {
    timerSeconds = seconds;
    updateTimerDisplay();
    
    // If timer is running, restart with new time
    if (timerRunning) {
        pauseTimer();
        startTimer();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    timerStartButton.disabled = true;
    timerPauseButton.disabled = false;
    
    // Change timer display color
    timerDisplay.style.color = '#4cc9f0';
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        // Timer finished
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            timerStartButton.disabled = false;
            timerPauseButton.disabled = true;
            
            // Flash timer and play sound
            timerDisplay.style.color = '#f72585';
            playTimerSound();
            showToast('Rest time is over! Get back to work!', 'warning');
            
            // Reset to original time
            setTimeout(() => {
                timerDisplay.style.color = '#4cc9f0';
                setTimer(parseInt(customTimeInput.value) || 90);
            }, 2000);
        }
    }, 1000);
}

function pauseTimer() {
    if (!timerRunning) return;
    
    clearInterval(timerInterval);
    timerRunning = false;
    timerStartButton.disabled = false;
    timerPauseButton.disabled = true;
    
    timerDisplay.style.color = '#f8961e';
}

function resetTimer() {
    pauseTimer();
    setTimer(parseInt(customTimeInput.value) || 90);
    timerDisplay.style.color = '#4cc9f0';
}

function playTimerSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log("Audio context not supported");
    }
}

// Chart initialization
function initializeChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    // Sample data - in a real app this would come from localStorage
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const exerciseData = [4, 5, 7, 6, 8, 4, 5];
    const volumeData = [1200, 1500, 2100, 1800, 2400, 1200, 1500];
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Exercises',
                    data: exerciseData,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Volume (kg)',
                    data: volumeData,
                    borderColor: '#f72585',
                    backgroundColor: 'rgba(247, 37, 133, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e9ecef',
                        font: {
                            family: "'Poppins', sans-serif"
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#adb5bd'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#adb5bd'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: '#adb5bd'
                    }
                }
            }
        }
    });
}

// Export data
function exportData() {
    const data = {
        workouts: workouts,
        stats: workoutStats,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fittrack-data-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Workout data exported successfully', 'success');
}

// Reset all data
function resetData() {
    if (confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
        localStorage.removeItem('fitTrackWorkouts');
        localStorage.removeItem('fitTrackStats');
        workouts = [];
        workoutStats = {
            totalWorkouts: 0,
            totalExercises: 0,
            totalSets: 0,
            totalVolume: 0
        };
        
        loadWorkouts();
        updateStats();
        showToast('All data has been reset', 'danger');
    }
}

// Toast notification
function showToast(message, type) {
    // Set message
    toastMessage.textContent = message;
    
    // Set color based on type
    const colors = {
        success: '#4cc9f0',
        danger: '#ef233c',
        warning: '#f8961e',
        info: '#4361ee'
    };
    
    toast.style.borderLeftColor = colors[type] || colors.info;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
