const pads = Array.from(document.querySelectorAll('.pad'));
const recordBtn = document.querySelector('.record-btn');
const p = document.querySelector('p');

const recordingsContainer = document.querySelector('.recordings-container');

let isRecording = false;
let currentRecording = [];
let recordings = [];
let maxRecordings = 5;
const recordingVariables = [null, null, null, null, null];

const sounds = [
	new Audio('sounds/sun_sonification.mp3'),
	new Audio('sounds/whistler_waves.mp3'),
	new Audio('sounds/chorus_radio_waves.mp3'),
	new Audio('sounds/saturn_radio_emissions.mp3'),
	new Audio('sounds/interstellar_plasma.mp3'),
	new Audio('sounds/crossing_jupiters.mp3'),
	new Audio('sounds/laser_shots_mars.mp3'),
	new Audio('sounds/star_kic12268220.mp3'),
	new Audio('sounds/sputnik_beep.mp3'),
	new Audio('sounds/sounds_on_mars.mp3'),
	new Audio('sounds/europa_flyby.mp3'),
	new Audio('sounds/stardust_passing.mp3'),
	new Audio('sounds/delta_iv_launch.mp3'),
	new Audio('sounds/atlas_v_launch.mp3'),
	new Audio('sounds/houston_problem.mp3'),
	new Audio('sounds/hi.mp3'),
];

const playToggle = (index) => {
	p.textContent = '';
	const sound = sounds[index];
	const pad = pads[index];

	if (sound.paused) {
		sound.currentTime = 0;
		sound.play();

		pad.classList.add('playing');

		if (isRecording) {
			currentRecording.push({ index, time: Date.now(), type: 'start' });
		}
	} else {
		sound.pause();
		pad.classList.remove('playing');

		if (isRecording) {
			currentRecording.push({ index, time: Date.now(), type: 'stop' });
		}
	}
};

const recordToggle = () => {
	const activeRecordings = recordings.filter((r) => r !== null);

	const isAnyPlaying = sounds.some((sound) => !sound.paused);
	if (isAnyPlaying) {
		p.textContent = 'Stop all sounds before recording.';
		return;
	}

	if (!isRecording && activeRecordings.length < maxRecordings) {
		startRecording();
		p.textContent = '';
	} else if (isRecording) {
		stopRecording();
	} else {
		p.textContent = 'You have reached the maximum number of recordings.';
	}
};

const startRecording = () => {
	isRecording = true;
	currentRecording = [];
	recordBtn.style.color = 'red';
};

const stopRecording = () => {
	const anyPlaying = sounds.some((sound) => !sound.paused);

	if (anyPlaying) {
		p.textContent = 'Cannot stop recording while sounds are still playing.';
		return;
	}

	isRecording = false;
	recordBtn.style.color = '';

	if (currentRecording.length === 0) {
		p.textContent = "You didn't record anything.";
		return;
	}

	const recordingData = [...currentRecording];
	recordings.push(recordingData);
	recordingVariables[recordings.length - 1] = recordingData;

	showRecording(recordings.length - 1);
};

function showRecording(index) {
	const recordingsArea = document.querySelector('.recordings-area');
	recordingsArea.style.display = 'flex';

	const recordingDiv = document.createElement('div');
	recordingDiv.classList.add('recording');

	const playBtn = document.createElement('button');
	playBtn.classList.add('play-btn');
	playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';

	const pauseBtn = document.createElement('button');
	pauseBtn.classList.add('pause-btn');
	pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
	pauseBtn.style.display = 'none'; // domyślnie ukryta

	const progressBar = document.createElement('input');
	progressBar.setAttribute('type', 'range');
	progressBar.setAttribute('value', '0');
	progressBar.setAttribute('max', '100');
	progressBar.classList.add('progress-bar');

	const removeBtn = document.createElement('button');
	removeBtn.classList.add('remove-btn');
	removeBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

	recordingDiv.appendChild(playBtn);
	recordingDiv.appendChild(pauseBtn);
	recordingDiv.appendChild(progressBar);
	recordingDiv.appendChild(removeBtn);
	recordingsArea.appendChild(recordingDiv);

	let playbackTimeouts = [];
	let startTime = null;
	let animationFrameId = null;

	function updateProgressBar() {
		const now = Date.now();
		const elapsed = now - startTime;
		const data = recordingVariables[index];
		const duration = data[data.length - 1].time - data[0].time;

		const progress = (elapsed / duration) * 100;
		progressBar.value = Math.min(progress, 100);

		if (elapsed < duration) {
			animationFrameId = requestAnimationFrame(updateProgressBar);
		} else {
			sounds.forEach((sound, i) => {
				sound.pause();
				pads[i].classList.remove('playing');
			});

			playBtn.style.display = 'inline-block';
			pauseBtn.style.display = 'none';
			progressBar.value = 0;
			startTime = null;
			playbackTimeouts = [];

			cancelAnimationFrame(animationFrameId);
		}
	}

	playBtn.addEventListener('click', () => {
		playBtn.style.display = 'none';
		pauseBtn.style.display = 'inline-block';

		const data = recordingVariables[index];
		if (!data || data.length === 0) return;

		const start = data[0].time;
		const end = data[data.length - 1].time;
		const duration = end - start;

		startTime = Date.now() - (progressBar.value / 100) * duration;

		sounds.forEach((sound, i) => {
			sound.pause();
			pads[i].classList.remove('playing');
		});

		const currentTime = (progressBar.value / 100) * duration;
		const activePads = new Set();

		for (const event of data) {
			const eventTime = event.time - start;
			if (eventTime > currentTime) break;

			if (event.type === 'start') activePads.add(event.index);
			else if (event.type === 'stop') activePads.delete(event.index);
		}

		activePads.forEach((i) => {
			sounds[i].currentTime = 0;
			sounds[i].play();
			pads[i].classList.add('playing');
		});

		playbackTimeouts = [];

		data.forEach((event) => {
			const eventTime = event.time - start;
			if (eventTime < currentTime) return;

			const delay = eventTime - currentTime;

			const timeout = setTimeout(() => {
				if (event.type === 'start') {
					sounds[event.index].currentTime = 0;
					sounds[event.index].play();
					pads[event.index].classList.add('playing');
				} else if (event.type === 'stop') {
					sounds[event.index].pause();
					pads[event.index].classList.remove('playing');
				}
			}, delay);

			playbackTimeouts.push(timeout);
		});

		const lastEventTime = data[data.length - 1].time - start;
		const endTimeout = setTimeout(() => {
			sounds.forEach((sound, i) => {
				sound.pause();
				pads[i].classList.remove('playing');
			});

			playBtn.style.display = 'inline-block';
			pauseBtn.style.display = 'none';
			progressBar.value = 0;
			startTime = null;
			playbackTimeouts = [];

			cancelAnimationFrame(animationFrameId);
		}, lastEventTime - currentTime + 50);
		playbackTimeouts.push(endTimeout);

		updateProgressBar();
	});

	pauseBtn.addEventListener('click', () => {
		pauseBtn.style.display = 'none';
		playBtn.style.display = 'inline-block';

		playbackTimeouts.forEach((timeout) => clearTimeout(timeout));
		playbackTimeouts = [];

		sounds.forEach((sound, i) => {
			sound.pause();
			pads[i].classList.remove('playing');
		});

		cancelAnimationFrame(animationFrameId);
	});

	removeBtn.addEventListener('click', () => {
		recordingDiv.remove();
		recordings[index] = null;
		recordingVariables[index] = null;
		p.textContent = '';
	});

	progressBar.addEventListener('input', () => {
		const data = recordingVariables[index];
		if (!data || data.length === 0) return;

		playbackTimeouts.forEach((timeout) => clearTimeout(timeout));
		playbackTimeouts = [];

		sounds.forEach((sound, i) => {
			sound.pause();
			pads[i].classList.remove('playing');
		});
		cancelAnimationFrame(animationFrameId);

		const duration = data[data.length - 1].time - data[0].time;
		const newTime = (progressBar.value / 100) * duration;
		startTime = Date.now() - newTime;

		//....
		const activePads = new Set();

		for (const event of data) {
			const eventTime = event.time - data[0].time;
			if (eventTime > newTime) break;

			if (event.type === 'start') activePads.add(event.index);
			else if (event.type === 'stop') activePads.delete(event.index);
		}

		activePads.forEach((i) => {
			sounds[i].currentTime = 0;
			sounds[i].play();
			pads[i].classList.add('playing');
		});
		//...

		data.forEach((event) => {
			const relativeTime = event.time - data[0].time;

			if (relativeTime >= newTime) {
				const delay = relativeTime - newTime;

				const timeout = setTimeout(() => {
					if (event.type === 'start') {
						sounds[event.index].currentTime = 0;
						sounds[event.index].play();
						pads[event.index].classList.add('playing');
					} else if (event.type === 'stop') {
						sounds[event.index].pause();
						pads[event.index].classList.remove('playing');
					}
				}, delay);

				playbackTimeouts.push(timeout);
			}
		});

		updateProgressBar();

		playBtn.style.display = 'none';
		pauseBtn.style.display = 'inline-block';
	});
}

pads.forEach((pad, index) => {
	pad.addEventListener('click', () => playToggle(index));
});

const handleEnded = (index) => {
	pads[index].classList.remove('playing');
};

sounds.forEach((sound, index) => {
	sound.addEventListener('ended', () => handleEnded(index));
});

recordBtn.addEventListener('click', recordToggle);
