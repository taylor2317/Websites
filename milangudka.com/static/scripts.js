function menu() {
    console.log("Toggling menu visibility...");
    document.querySelectorAll('.menuList').forEach(element => {
        // Determine current display state
        const currentDisplay = element.style.display;
        const newDisplay = (currentDisplay === 'none' || currentDisplay === '') ? 'block' : 'none';
        
        // Apply the new display style
        element.style.display = newDisplay;

        // Log the change
        console.log(`Menu element toggled: ${element}, display set to: ${newDisplay}`);
    });
}
