# StepSync - Automatic Step Tracker

## Overview
StepSync is an advanced web application that automatically tracks your steps, distance, and calories burned using device motion sensors. Works on smartphones and some desktop browsers.

## Key Features
- Automatic step counting using device accelerometer
- Real-time distance tracking
- Calorie burn estimation
- Customizable daily step goal
- Personalized weight-based calculations
- Activity logging
- Persistent settings storage

## How It Works
1. Grant motion tracking permission
2. App uses device sensors to detect steps
3. Calculates distance and calories based on your weight
4. Visualizes progress with an interactive progress bar

## Technical Details
- Step Detection: Uses device motion acceleration
- Distance Calculation: Average step length (0.7m)
- Calorie Estimation: Weight-based formula

## Compatibility
- Smartphones with motion sensors
- Modern web browsers
- Works best on mobile devices

## Setup and Usage
1. Open `index.html` in a web browser
2. Allow motion tracking permission
3. Set your daily step goal
4. Enter your weight for accurate calorie tracking
5. Start moving!

## Customization
- Adjust step goal
- Update personal weight
- Modify step detection sensitivity in code

## Limitations
- Requires motion sensor support
- Less accurate on some devices
- Background tracking not supported

## Future Improvements
- Persistent daily tracking
- Detailed activity reports
- Machine learning step detection
- Background tracking support

## Technologies
- HTML5
- CSS3
- Vanilla JavaScript
- DeviceMotion API
- LocalStorage

## Contributing
Contributions welcome! Fork and submit pull requests.

## License
MIT License
