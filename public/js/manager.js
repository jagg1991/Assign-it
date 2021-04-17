const primaryColor = '#4834d4'
const warningColor = '#f0932b'
const successColor = '#6ab04c'
const dangerColor = '#eb4d4b'

const themeCookieName = 'theme'
const themeDark = 'dark'
const themeLight = 'light'

const body = document.getElementsByTagName('body')[0]

function setCookie(cname, cvalue, exdays) {
	var d = new Date()
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
	var expires = "expires=" + d.toUTCString()
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
}

function getCookie(cname) {
	var name = cname + "="
	var ca = document.cookie.split(';')
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1)
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length)
		}
	}
	return ""
}

loadTheme()

function loadTheme() {
	var theme = getCookie(themeCookieName)
	body.classList.add(theme === "" ? themeLight : theme)
}

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

function collapseSidebar() {
	body.classList.toggle('sidebar-expand')
}

window.onclick = function (event) {
	openCloseDropdown(event)
}





E


const projectFormHandler = async (event) => {
	event.preventDefault();

	const project = document.querySelector('#project').value;
	const discription = document.querySelector('#discription').value;
	// console.log(project, discription)


	if (project && discription) {
		console.log('sucess')
		// console.log(project, discription)

		const response = await fetch('/api/task', {

			method: 'POST',
			body: JSON.stringify({ title: project, task: discription }),
			headers: { 'Content-Type': 'application/json' },
		});

		if (response.ok) {
			document.location.reload();
		} else {
			alert(response.statusText);
		}
	}
};

document
	.querySelector('.task')
	.addEventListener('submit', projectFormHandler);





const delegateFormHandler = async (event) => {
	event.preventDefault();


	const employee = document.querySelector('#employee').value;
	const task = document.querySelector('#task').value;
	const status = document.querySelector('#status').value;
	const date = document.querySelector('#date').value;
	console.log(employee);
	console.log(task);
	console.log(status);
	console.log(date);

	if (task) {
		console.log('sucess')
		// console.log(project, discription)
		let body = {};
		if (status) body.status = status;
		if (date) body.due = date;
		if (employee) body.user_id = employee;
		console.log(body);

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
	.querySelector('.delegate')
	.addEventListener('submit', delegateFormHandler);
