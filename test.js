document.addEventListener('DOMContentLoaded', function() {
    // Test to see if the animation appears
    toggleLoadingAnimation(true);  // This should make the animation visible on page load
    setTimeout(() => {
        toggleLoadingAnimation(false);  // After 5 seconds, hide it
    }, 5000);
});
