const signupFormHandler = async (event) => {
    event.preventDefault();

    const name = document.querySelector('#name-signup').value.trim();
    const email = document.querySelector('#email-signup').value.trim();
    const password = document.querySelector('#password-signup').value.trim();
    const role = document.querySelector('.form-select').value;
    console.log(role)

    if (name && email && password && role) {
        console.log('sucess')
        const response = await fetch('/api/user', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            document.location.replace('/');
        } else {
            alert(response.statusText);
        }
    }
};

document
    .querySelector('.signup-form')
    .addEventListener('submit', signupFormHandler);