function displayLoggedInUser() {
    // This is a placeholder.  Replace with your actual method of retrieving the username.
    // For example, if using a backend framework, the username might be in a global variable or session.
    const username = username; // Replace this with actual username retrieval logic

    const paragraphElement = document.getElementById("usernameDisplay");
    if (paragraphElement) {
      paragraphElement.textContent = "Logged in as: " + username;
    }
  }

  // Call the function when the page loads (or when the user logs in)
  window.onload = displayLoggedInUser;