document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('submissionForm');
    const nameInput = document.getElementById('name');
    const idNumberInput = document.getElementById('idNumber');
    const courseSectionInput = document.getElementById('courseSection');
    const nameError = document.getElementById('nameError');
    const idError = document.getElementById('idError');
    const posterOverlay = document.getElementById('posterOverlay');
    const welcomePopup = document.getElementById('welcomePopup');
    const closePopup = document.getElementById('closePopup');
    const confettiCanvas = document.getElementById('confetti-canvas');
    let idleTimeout;

    // Initialize confetti library
    const confetti = new ConfettiGenerator({ target: 'confetti-canvas' });

    // Reset the inactivity timer
    function resetIdleTimer() {
        clearTimeout(idleTimeout);
        posterOverlay.style.display = 'none';
        idleTimeout = setTimeout(showPoster, 30000); // 30 seconds of inactivity
    }

    // Show the poster after inactivity
    function showPoster() {
        posterOverlay.style.display = 'block';
    }

    // Close welcome popup
    closePopup.addEventListener('click', function () {
        welcomePopup.style.display = 'none';
    });

    // Inactivity event listeners
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        const idNumber = idNumberInput.value.trim();
        const courseSection = courseSectionInput.value.trim();
        let valid = true;

        // Name validation
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            nameError.textContent = "Please input correct name";
            valid = false;
        } else {
            nameError.textContent = "";
        }

        // ID validation (5 to 7 digits)
        if (!/^\d{5,7}$/.test(idNumber)) {
            idError.textContent = "Please input correct school ID";
            valid = false;
        } else {
            idError.textContent = "";
        }

        if (valid) {
            submitData(name, idNumber, courseSection);
        }
    });

    async function submitData(name, idNumber, courseSection) {
        try {
            // Fetch the last refID from the Sheet
            const lastRefIdResponse = await fetch('https://aws-registration.onrender.com/api/get-last-refid');
            const lastRefIdData = await lastRefIdResponse.json();
            const refID = lastRefIdData.lastRefID + 1;

            const response = await fetch('https://aws-registration.onrender.com/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, idNumber, courseSection, refID })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Clear fields on successful submission
            nameInput.value = '';
            idNumberInput.value = '';
            courseSectionInput.value = '';

            // Show welcome popup and confetti effect
            welcomePopup.style.display = 'flex';
            confetti.render();
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    }

    
    // Initial reset of idle timer
    resetIdleTimer();
});
