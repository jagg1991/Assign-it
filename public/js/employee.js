

function switchTheme() {
    if (body.classList.contains(themeLight)) {
        body.classList.remove(themeLight)
        body.classList.add(themeDark)
        setCookie(themeCookieName, themeDark)
    } else {
        body.classList.remove(themeDark)
        body.classList.add(themeLight)
        setCookie(themeCookieName, themeLight)
    }
}



const updateFormHandler = async (event) => {
    event.preventDefault();



    const status = document.querySelector('.form-select').value;



    if (status) {
        console.log('sucess')
        // console.log(project, discription)
        let body = {};
        if (status) body.status = status;



        const response = await fetch(`api/task/${task}`, {

            method: 'PUT',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });

        console.log(response)
        if (response.ok) {
            // document.location.reload();
        } else {
            alert(response.statusText);
        }
    }


};

document
    .querySelector('.update')
    .addEventListener('submit', updateFormHandler);