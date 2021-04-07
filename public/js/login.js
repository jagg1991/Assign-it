



const loginFormHandler = async (event) => {
    event.preventDefault();

    const user = document.querySelector('#email-login').value.trim();
    const password = document.querySelector('#password-login').value;

    if (user && password) {
        // Send a POST request to the API endpoint
        const response = await fetch('/api/user/login', {
            method: 'POST',
            body: JSON.stringify({ user, password }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            // If successful, redirect the browser to the profile page
            // document.location.replace('/profile');
            response.json()
                .then((json) => {
                    console.log(json)
                    if (json.user.role = 'manager') {
                        document.location.replace('/manager');
                    }
                    else {
                        document.location.replace('/employee');
                    }

                })
        } else {
            alert(response.statusText);
        }
    }


};

document
    .querySelector('.login-form')
    .addEventListener('submit', loginFormHandler);