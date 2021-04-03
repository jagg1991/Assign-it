// const signupFormHandler = async (event) => {
//     event.preventDefault();

//     const name = document.querySelector('#name-signup').value.trim();
//     const email = document.querySelector('#email-signup').value.trim();
//     const password = document.querySelector('#password-signup').value.trim();
//     const role = document.querySelector('.form-select').value;
//     console.log(role)

//     if (name && email && password && role) {
//         console.log('sucess')
//         const response = await fetch('/api/user', {
//             method: 'POST',
//             body: JSON.stringify({ name, email, password, role }),
//             headers: { 'Content-Type': 'application/json' },
//         });

//         if (response.ok) {
//             document.location.replace('/home');
//         } else {
//             alert(response.statusText);
//         }
//     }
// };

// document
//     .querySelector('.signup-form')
//     .addEventListener('submit', signupFormHandler);

const signupFormHandler = async (event) => {
    event.preventDefault();

    const user = document.querySelector('#email-login').value.trim();
    const password = document.querySelector('#password-login').value;

    if (user && password) {
        // Send a POST request to the API endpoint
        const response = await fetch('/api/user/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            // If successful, redirect the browser to the profile page
            document.location.replace('/manager');
        } else {
            alert(response.statusText);
        }
    }

};