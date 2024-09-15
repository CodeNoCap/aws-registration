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
    const offlineQueueBtn = document.getElementById('offlineQueueBtn');
    const offlineQueuePopup = document.getElementById('offlineQueuePopup');
    const closeQueuePopup = document.getElementById('closeQueuePopup');
    const submitQueuePopup = document.getElementById('submitQueuePopup');
    const offlineQueueList = document.getElementById('offlineQueueList');
    let idleTimeout;



    
    // Reset the inactivity timer
    function resetIdleTimer() {
        clearTimeout(idleTimeout);
        posterOverlay.style.display = 'none';
        idleTimeout = setTimeout(showPoster, 30000); // 30 seconds of inactivity
    }

    // Show the poster after inactivity
    function showPoster() {
        if (!isMobile()) {
            posterOverlay.style.display = 'block';
        }
    }

    // Close welcome popup
    closePopup.addEventListener('click', function () {
        welcomePopup.style.display = 'none';
    });

    closeQueuePopup.addEventListener('click', function () {
        offlineQueuePopup.style.display = 'none';
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
            

            const submissionTime = new Date().toISOString(); // Record the current time in ISO format
            checkConnectionAndSubmit(name, idNumber, courseSection, submissionTime);
        }
    });

    async function checkConnectionAndSubmit(name, idNumber, courseSection, submissionTime) {
        let submissionTimedOut = false;
        const submissionTimeout = setTimeout(() => {
            submissionTimedOut = true;
            toggleLoadingAnimation(false);
            const proceedOffline = confirm("Submission is taking too long. Would you like to proceed offline?");
            if (proceedOffline) {
                saveToLocalStorage({ name, idNumber, courseSection });
            }
        }, 53000); 

        try {
            toggleLoadingAnimation(true);  // Start the loading animation

            // Check if online
            const online = await isServerOnline();

            if (online && !submissionTimedOut) {
                clearTimeout(submissionTimeout);  // Clear timeout if submission finishes before timeout
                welcomePopup.style.display = 'flex';
                await submitData(name, idNumber, courseSection, submissionTime);
            } else if (!submissionTimedOut) {
                saveToLocalStorage({ name, idNumber, courseSection, submissionTime });
                toggleLoadingAnimation(false); 
                alert('You are offline. Your submission has been saved and will be submitted when you are online.');
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        } finally {
            toggleLoadingAnimation(false);  // Stop the loading animation
        }
    }

    function toggleLoadingAnimation(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = show ? 'flex' : 'none'; // Use flex to center the content
    }
    

    async function isServerOnline() {
        try {
            const response = await fetch('https://aws-registration.onrender.com/api/get-last-refid');
            return response.ok;
        } catch (error) {
            return false; // Treat it as offline if there's any error
        }
    }

    function saveToLocalStorage(data) {
        toggleLoadingAnimation(true); 
        let queueRaw = localStorage.getItem('offlineQueue');
        let offlineQueue = queueRaw ? JSON.parse(queueRaw) : []; // Ensure queue is an array

        offlineQueue.push(data);
        localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));

        updateOfflineQueueList();

        // Clear fields
        nameInput.value = '';
        idNumberInput.value = '';
        courseSectionInput.value = '';
        toggleLoadingAnimation(false); 
    }

    async function submitData(name, idNumber, courseSection, submissionTime) {
        toggleLoadingAnimation(true); 
        try {
            const lastRefIdResponse = await fetch('https://aws-registration.onrender.com/api/get-last-refid');
            const lastRefIdData = await lastRefIdResponse.json();
            const refID = lastRefIdData.lastRefID + 1;
            console.log(`%c[TIME]: ${submissionTime}`, "color: yellow");

            const response = await fetch('https://aws-registration.onrender.com/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refID, name, idNumber, courseSection, submissionTime })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Clear fields on successful submission
            nameInput.value = '';
            idNumberInput.value = '';
            courseSectionInput.value = '';
            toggleLoadingAnimation(false); 

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }

    }

    // Offline queue button behavior
    offlineQueueBtn.addEventListener('click', function () {
        offlineQueuePopup.style.display = 'flex';
        updateOfflineQueueList();
    });

    function updateOfflineQueueList() {
        const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue')) || [];
        offlineQueueList.innerHTML = '';

        if (offlineQueue.length === 0) {
            offlineQueueList.innerHTML = '<p>No offline submissions in queue.</p>';
        } else {
            offlineQueue.forEach((data, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${data.name} - ${data.idNumber} - ${data.courseSection}`;
                offlineQueueList.appendChild(listItem);
            });
        }
    }

    async function checkAndSubmitQueue() {
        console.log(`%c[RUNNING] Checking queue`, "color: yellow")
        if (navigator.onLine) {
            toggleLoadingAnimation(true); 
            let queueRaw = localStorage.getItem('offlineQueue');
            let queue = queueRaw ? JSON.parse(queueRaw) : []; // Ensure queue is an empty array if null

            if (queue.length > 0) {
                for (let i = 0; i < queue.length; i++) {
                    const { name, idNumber, courseSection } = queue[i];
                    await submitData(name, idNumber, courseSection);
                }
                // Clear the offline queue after successful submission
                localStorage.removeItem('offlineQueue');
                toggleLoadingAnimation(false); 
                console.log("Offline queue now empty!");
                updateOfflineQueueList();
            }
        } else {
            console.log(`$c[Connection error] Not online`, "color:red");
        }
    }

    submitQueuePopup.addEventListener('click', checkAndSubmitQueue);
});

function isMobile() {
    // Check if the screen width is less than 480px
    return window.innerWidth <= 480;
}


