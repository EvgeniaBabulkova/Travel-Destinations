// Select the error message spans
const loginErrorMessage = document.getElementById('loginErrorMessage');
const registerErrorMessage = document.getElementById('registerErrorMessage');

// Login function
const login = async (username, password) => {
	try {
		const response = await fetch('http://localhost:3000/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password }),
		});

		const data = await response.json();

		if (response.ok) {
			// Clear previous error message
			loginErrorMessage.textContent = '';

			// Mark the user as logged in
			sessionStorage.setItem('jwt-TravelDestination', data.token);
			sessionStorage.setItem('logged-username', data.username);
			sessionStorage.setItem('logged-_id', data._id);

			sessionStorage.setItem('selectedUser', data.username);
			sessionStorage.setItem('selectedUserId', data._id);

			// Reload the page or redirect to dashboard
			window.location.reload();
		} else {
			// Display error message from the server
			loginErrorMessage.textContent = data.message || 'An error occurred during login.';
		}
	} catch (error) {
		// Display network error
		loginErrorMessage.textContent = 'Network error. Please try again later.';
		console.error('Error logging in:', error);
	}
};

// Register function
const register = async (username, password, email) => {
	try {
		const response = await fetch('http://localhost:3000/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password, email }),
		});

		const data = await response.json();

		if (response.ok) {
			// Clear any previous error message
			registerErrorMessage.textContent = '';

			// Automatically switch to the login modal after successful registration
			registerModal.close();
			loginModal.showModal();
		} else {
			// Display error message from the server
			registerErrorMessage.textContent = data.message || 'An error occurred during registration.';
		}
	} catch (error) {
		// Display network error
		registerErrorMessage.textContent = 'Network error. Please try again later.';
		console.error('Error registering user:', error);
	}
};
