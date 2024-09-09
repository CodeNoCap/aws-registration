document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('submissionForm');
    const nameInput = document.getElementById('name');
    const idNumberInput = document.getElementById('idNumber');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
    
        const name = nameInput.value.trim();
        const idNumber = idNumberInput.value.trim();
    
        if (name && idNumber) {
            console.log('Sending data:', { name, idNumber }); // Log the data being sent
            submitData(name, idNumber);
        } else {
            alert('Please fill out both fields.');
        }
    
        nameInput.value = '';
        idNumberInput.value = '';
    });
});

async function submitData(name, idNumber) {
    try {
        const response = await fetch('https://aws-registration.onrender.com/api/submit', { // Updated URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Ensure JSON content-type is set
            },
            body: JSON.stringify({ name, idNumber }) // Send name and idNumber as JSON
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}
