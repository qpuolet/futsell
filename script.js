document.addEventListener('DOMContentLoaded', function() {
	const form = document.querySelector('#futsellForm');
	const logs = document.querySelector('#logs');
	const logsCounter = logs.querySelector('.logs__requestsCounter');
	const logsList = logs.querySelector('.logs__list');
	var gong = document.getElementById('myAudio');
	let requestNumber = 0;
	let errorCounter = 0;

	const getUrl = params => {
		const { partnerId, secretKey, sku, min_buy, max_buy } = params;
		const ts = Math.round((new Date()).getTime() / 1000);
		const sign = md5(`${partnerId}${secretKey}${ts}`);
		const queryParams = {};
		if (min_buy) queryParams.min_buy = min_buy;
		if (max_buy) queryParams.max_buy = max_buy;

		let url = `https://www.futsell.ru/ffa19/api/pop/id/${partnerId}/ts/${ts}/sign/${sign}/sku/${sku}/`;
		if (queryParams && Object.keys(queryParams).length !== 0) {
			url += `?${$.param(queryParams)}`;
		}

		return url;
	};

	const pasteLog = (content, modifier = '') => {
		let className = 'logs__item';
		const el = document.createElement('div');
		className += modifier ? ` --${modifier}` : '';
		el.className = className;
		el.innerHTML = `#${requestNumber} ${content}`;
		logsCounter.innerHTML = requestNumber;
		logsList.prepend(el);
	};
	const pasteServerLog = (content) => {
		const el = document.createElement('div');
		el.innerHTML = content;
		logs.append(el);
	};

	const sendRequest = (params, frequency) => {
		requestNumber++;
		const url = getUrl(params);

		$.ajax({
			url,
			xhrFields: {
				withCredentials: true,
			},
			success: (response) => {
				onSuccess(response, params, frequency);
			},
			error: (response) => {
				errorCounter++;
				pasteServerLog(response);
				if (errorCounter <= 3) {
					sendRequest(params, frequency);
				} else {
					alert('Ahh... Something went wrong... Contact support!');
				}
			},
		});
	};

	const onSuccess = (response, params, frequency) => {
		if (response.error === 'EMPTY') {
			pasteLog(`${response.error}: ${response.message}`);
			setTimeout(() => { sendRequest(params, frequency) }, frequency);
		} else if (response.error === '') {
			pasteLog(response.message, 'success');
			gong.play();
		} else {
			pasteLog(`${response.error}: ${response.message}`, 'error');
		}
	};

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		const params = $(form).serializeArray().reduce((acc, item) => {
			acc[item.name] = item.value.trim();

			return acc;
		}, {});

		sendRequest(params, +params.frequency);
	});
});