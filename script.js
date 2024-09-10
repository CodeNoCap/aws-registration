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
            welcomePopup.style.display = 'flex';

            // Submit the data
            checkConnectionAndSubmit(name, idNumber, courseSection);
        }
    });

    async function checkConnectionAndSubmit(name, idNumber, courseSection) {
        try {
            // Check if online
            const online = await isServerOnline();

            if (online) {
                // Server is online, submit the data
                submitData(name, idNumber, courseSection);
            } else {
                // Server is offline, save the data in localStorage
                saveToLocalStorage({ name, idNumber, courseSection });
                alert('You are offline. Your submission has been saved and will be submitted when you are online.');
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        }
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
    let queueRaw = localStorage.getItem('offlineQueue');
    let offlineQueue = queueRaw ? JSON.parse(queueRaw) : []; // Ensure queue is an array

    offlineQueue.push(data);
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));

    updateOfflineQueueList();
}


    async function submitData(name, idNumber, courseSection) {
        try {
            const lastRefIdResponse = await fetch('https://aws-registration.onrender.com/api/get-last-refid');
            const lastRefIdData = await lastRefIdResponse.json();
            const refID = lastRefIdData.lastRefID + 1;

            const response = await fetch('https://aws-registration.onrender.com/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refID, name, idNumber, courseSection })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Clear fields on successful submission
            nameInput.value = '';
            idNumberInput.value = '';
            courseSectionInput.value = '';

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
        if (navigator.onLine) {
            let queueRaw = localStorage.getItem('offlineQueue');
            let queue = queueRaw ? JSON.parse(queueRaw) : []; // Ensure queue is an empty array if null
    
            if (queue.length > 0) {
                for (let i = 0; i < queue.length; i++) {
                    const item = queue[i];
                    try {
                        const lastRefIdResponse = await fetch('https://aws-registration.onrender.com/api/get-last-refid');
                        const lastRefIdData = await lastRefIdResponse.json();
                        const refID = lastRefIdData.lastRefID + 1;
    
                        const response = await fetch('https://aws-registration.onrender.com/api/submit', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ refID, name: item.name, idNumber: item.idNumber, courseSection: item.courseSection })
                        });
    
                        if (!response.ok) {
                            throw new Error('Failed to submit queued item');
                        }
    
                        // Log the successful online submission
                        console.log(`Online submission: ${item.name}, ${item.idNumber}, ${item.courseSection}`);
    
                        // Remove the successfully submitted item from the queue
                        queue.splice(i, 1);
                        i--; // Adjust index since we removed an item
                        localStorage.setItem('offlineQueue', JSON.stringify(queue));
    
                        // Remove the item from the popup list
                        const popupItem = document.getElementById(`queue-item-${item.idNumber}`);
                        if (popupItem) {
                            popupItem.remove();
                        }
    
                    } catch (error) {
                        console.error('Error submitting queued item:', error);
                        return; // Stop processing the queue if any error occurs
                    }
                }
            }
        }
    }
    
    
    
    resetIdleTimer();
    checkAndSubmitQueue();
});

function isMobile() {
    return window.innerWidth <= 480;
}

