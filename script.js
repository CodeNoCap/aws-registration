document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('submissionForm');
    const nameInput = document.getElementById('name');
    const idNumberInput = document.getElementById('idNumber');
    const courseSectionInput = document.getElementById('courseSection');
    const nameError = document.getElementById('nameError');
    const idError = document.getElementById('idError');

    form.addEventListener('submit', function(e) {
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
            console.log('Sending data:', { name, idNumber, courseSection });
            submitData(name, idNumber, courseSection);
        }
    });
});

async function submitData(name, idNumber, courseSection) {
    try {
        const response = await fetch('https://aws-registration.onrender.com/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, idNumber, courseSection })
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
