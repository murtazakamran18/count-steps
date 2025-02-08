class PrecisionStepTracker {
    constructor() {
        // DOM Elements
        this.stepCountDisplay = document.getElementById('stepCount');
        this.distanceDisplay = document.getElementById('distanceCount');
        this.caloriesDisplay = document.getElementById('caloriesBurned');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.activityLog = document.getElementById('activityLog');
        this.permissionStatus = document.getElementById('permissionStatus');

        // Settings Elements
        this.dailyGoalInput = document.getElementById('dailyGoal');
        this.setGoalBtn = document.getElementById('setGoalBtn');
        this.userWeightInput = document.getElementById('userWeight');
        this.setWeightBtn = document.getElementById('setWeightBtn');

        // Core Tracking Variables
        this.steps = 0;
        this.dailyGoal = 10000;
        this.userWeight = 70; // kg
        this.stepLength = 0.7; // average step length in meters

        // Advanced Detection Parameters
        this.detectionState = {
            acceleration: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            lastPeakTime: 0,
            stepCooldown: 250, // ms between steps
            confidenceThreshold: 0.7,
            stepSignatures: []
        };

        // Initialize tracking
        this.setupEventListeners();
        this.loadSettings();
        this.initializeMotionTracking();
    }

    initializeMotionTracking() {
        if ('DeviceMotionEvent' in window) {
            // Request permission for iOS devices
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('devicemotion', this.processMotionData.bind(this));
                            this.updatePermissionStatus('Motion Tracking: Enabled');
                        } else {
                            this.updatePermissionStatus('Motion Tracking: Permission Denied');
                        }
                    })
                    .catch(console.error);
            } else {
                // For non-iOS devices
                window.addEventListener('devicemotion', this.processMotionData.bind(this));
                this.updatePermissionStatus('Motion Tracking: Active');
            }
        } else {
            this.fallbackManualTracking();
        }
    }

    processMotionData(event) {
        const acceleration = event.acceleration || event.accelerationIncludingGravity;
        if (!acceleration) return;

        // Update acceleration state
        const { x, y, z } = acceleration;
        const currentTime = Date.now();

        // Advanced step detection algorithm
        const stepDetected = this.detectStep(x, y, z, currentTime);
        
        if (stepDetected) {
            this.recordStep();
        }
    }

    detectStep(x, y, z, currentTime) {
        const state = this.detectionState;
        
        // Calculate acceleration magnitude
        const magnitude = Math.sqrt(x*x + y*y + z*z);
        
        // Detect significant movement
        const movementThreshold = 9.8; // Standard gravity threshold
        const timeSinceLastStep = currentTime - state.lastPeakTime;

        // Step detection criteria
        const isSignificantMovement = magnitude > movementThreshold;
        const isValidStepInterval = timeSinceLastStep > state.stepCooldown;
        
        // Vertical movement detection (walking signature)
        const verticalMovement = Math.abs(y);
        const isVerticalStep = verticalMovement > 6;

        // Confidence calculation
        let confidence = 0;
        confidence += isSignificantMovement ? 0.4 : 0;
        confidence += isValidStepInterval ? 0.3 : 0;
        confidence += isVerticalStep ? 0.3 : 0;

        // Store step signature
        state.stepSignatures.push({
            magnitude,
            verticalMovement,
            confidence,
            timestamp: currentTime
        });

        // Limit signature history
        if (state.stepSignatures.length > 10) {
            state.stepSignatures.shift();
        }

        // Final step detection
        return (confidence > state.confidenceThreshold && isValidStepInterval);
    }

    recordStep() {
        const currentTime = Date.now();
        const state = this.detectionState;

        // Update step count and tracking
        this.steps++;
        state.lastPeakTime = currentTime;

        // Update display and log
        this.updateDisplay();
        this.logActivity('Step detected');
        this.saveSettings();
    }

    updateDisplay() {
        // Update step count
        this.stepCountDisplay.textContent = this.steps;

        // Calculate distance (km)
        const distanceInKm = (this.steps * this.stepLength) / 1000;
        this.distanceDisplay.textContent = distanceInKm.toFixed(2) + ' km';

        // Calculate calories burned
        const caloriesBurned = Math.round((this.steps / 1000) * this.userWeight * 0.5);
        this.caloriesDisplay.textContent = caloriesBurned;

        // Update progress
        const progressPercentage = Math.min((this.steps / this.dailyGoal) * 100, 100);
        this.progressFill.style.width = `${progressPercentage}%`;
        this.progressText.textContent = `${Math.round(progressPercentage)}%`;
    }

    logActivity(message) {
        const li = document.createElement('li');
        li.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        this.activityLog.prepend(li);
        
        // Limit activity log to 10 entries
        if (this.activityLog.children.length > 10) {
            this.activityLog.lastElementChild.remove();
        }
    }

    setupEventListeners() {
        // Manual Step Addition
        const manualStepBtn = document.createElement('button');
        manualStepBtn.textContent = 'Add Step Manually';
        manualStepBtn.addEventListener('click', () => {
            this.steps++;
            this.updateDisplay();
            this.logActivity('Manual step added');
        });
        this.permissionStatus.appendChild(manualStepBtn);

        // Daily Goal Setting
        this.setGoalBtn.addEventListener('click', () => {
            const newGoal = parseInt(this.dailyGoalInput.value);
            if (newGoal > 0) {
                this.dailyGoal = newGoal;
                this.updateDisplay();
                this.saveSettings();
            }
        });

        // User Weight Setting
        this.setWeightBtn.addEventListener('click', () => {
            const newWeight = parseFloat(this.userWeightInput.value);
            if (newWeight > 0) {
                this.userWeight = newWeight;
                this.updateDisplay();
                this.saveSettings();
            }
        });
    }

    updatePermissionStatus(message) {
        this.permissionStatus.textContent = message;
    }

    fallbackManualTracking() {
        this.updatePermissionStatus('Automatic Tracking Unavailable');
        alert('Your device does not support automatic step tracking. Please use manual mode.');
    }

    saveSettings() {
        localStorage.setItem('stepTrackerSettings', JSON.stringify({
            steps: this.steps,
            dailyGoal: this.dailyGoal,
            userWeight: this.userWeight
        }));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('stepTrackerSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.steps = settings.steps || 0;
            this.dailyGoal = settings.dailyGoal || 10000;
            this.userWeight = settings.userWeight || 70;

            // Update input fields
            this.dailyGoalInput.value = this.dailyGoal;
            this.userWeightInput.value = this.userWeight;
            this.updateDisplay();
        }
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrecisionStepTracker();
});
