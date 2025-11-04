
const pads = Array.from(document.querySelectorAll('.pad')); //konwertujemy NodeList do tablicy, aby działała jak tablica (koniec końców nie użyłam metod typowych dla tablic typu map czy filter, ale używamy forEach)
const recordBtn = document.querySelector('.record-btn');
const p = document.querySelector('p');

const recordingsContainer = document.querySelector('.recordings-container'); //tu wyświetlane są nagrania

//zmienne do nagrywania

let isRecording = false; // zmienna nagrywania, śledzeinie stanu, czy nagrywanie trwa - na początku działania programu nie, więc false
let currentRecording = []; // tablica, która przechowuje aktualnie nagrywane kliknięcia padów + czas
let recordings = []; // tablica wszystkich nagrań - każde nagranie to tablica wszystkich zdarzeń: index pada, time(czas kliknięcia), type(start lub stop ,  string z fragmentu funkcji playToggle), użyte w kontroli limitu nagrań, synchronizacji z recordingVariables,,,
let maxRecordings = 3; // zmienna przechowująca maksymalną liczbę nagrań
const recordingVariables = [null, null, null]; // 5x brak nagrań - później przypisane nagrania do indexu


/* tablica (array), ma metody jak .forEach(), .map(), .filter() */
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

//Funkcja włącza lub wyłącza dźwięk pada i zmienia styl pada zależnie od tego, czy gra
const playToggle = (index) => {
	p.textContent = '';
	const sound = sounds[index]; //dźwięk z tej samej pozycji co pad
	const pad = pads[index]; //pad z tej samej pozycji

	if (sound.paused) {
		// jeśli dźwięk nie gra, wbudowana właściwość
		// restart i odtwarzanie
		sound.currentTime = 0; //ustawiamy że audio gra od zera
		sound.play(); //to po prostu zaczyna puszczać audio

		pad.classList.add('playing');

		if (isRecording) {
			currentRecording.push({ index, time: Date.now(), type: 'start' }); // zapisanie indexu i czasu
		}
	} else {
		sound.pause();
		pad.classList.remove('playing');

		if (isRecording) {
			currentRecording.push({ index, time: Date.now(), type: 'stop' }); // zapisanie indexu i czasu
		}
	}
};

const recordToggle = () => {
	const activeRecordings = recordings.filter((r) => r !== null);

		const isAnyPlaying = sounds.some(sound => !sound.paused);
	if (isAnyPlaying) {
		p.textContent = "Stop all sounds before recording.";
		return; // przerwij — nie wchodź do startRecording
	}

	if (!isRecording && activeRecordings.length < maxRecordings) {
		startRecording();
		p.textContent = ''; // czyści komunikat, jeśli wcześniej się pojawił
	} else if (isRecording) {
		stopRecording();
	} else {
		p.textContent = 'You have reached the maximum number of recordings.';
	}
};

const startRecording = () => {


	isRecording = true;
	currentRecording = []; //wyczyszczenie tablicy
	recordBtn.style.color = 'red';

};

const stopRecording = () => {
	// Sprawdź, czy jakikolwiek dźwięk jest aktywny (grający pad)
	const anyPlaying = sounds.some(sound => !sound.paused);

	if (anyPlaying) {
		p.textContent = 'Cannot stop recording while sounds are still playing.';
		return; // zablokuj zatrzymanie nagrywania
	}

	// Wszystko OK – można zakończyć nagrywanie
isRecording = false;
recordBtn.style.color = '';

// Jeśli użytkownik nic nie nagrał, nie dodawaj pustego nagrania
if (currentRecording.length === 0) {
	p.textContent = "You didn't record anything.";
	return;
}

const recordingData = [...currentRecording];
recordings.push(recordingData);
recordingVariables[recordings.length - 1] = recordingData;

showRecording(recordings.length - 1);
};

//.....................................................................

// Funkcja tworząca i wyświetlająca nowe nagrania
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

	// === ODTWARZANIE ===
	let playbackTimeouts = [];
	let startTime = null;
	let animationFrameId = null;

	// Funkcja do aktualizacji progress bara
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
		// === KONIEC NAGRANIA ===
		// Zatrzymaj wszystkie dźwięki i usuń klasy playing
		sounds.forEach((sound, i) => {
			sound.pause();
			pads[i].classList.remove('playing');
		});

		// Reset stanu
		playBtn.style.display = 'inline-block';
		pauseBtn.style.display = 'none';
		progressBar.value = 0;
		startTime = null;
		playbackTimeouts = [];

		cancelAnimationFrame(animationFrameId);
	}
}


	// === PLAY ===
playBtn.addEventListener('click', () => {
	playBtn.style.display = 'none';
	pauseBtn.style.display = 'inline-block';

	const data = recordingVariables[index];
	if (!data || data.length === 0) return;

	const start = data[0].time;
	const end = data[data.length - 1].time;
	const duration = end - start;

	startTime = Date.now() - (progressBar.value / 100) * duration; // uwzględniamy offset wg progress bara

	// Zatrzymaj wszystkie dźwięki i usuń klasy 'playing' przed nowym odtworzeniem
	sounds.forEach((sound, i) => {
		sound.pause();
		pads[i].classList.remove('playing');
	});

	// Określ, które pady powinny być aktualnie aktywne (czyli "włączone" w aktualnym czasie)
	const currentTime = (progressBar.value / 100) * duration;
	const activePads = new Set();

	for (const event of data) {
		const eventTime = event.time - start;
		if (eventTime > currentTime) break;

		if (event.type === 'start') activePads.add(event.index);
		else if (event.type === 'stop') activePads.delete(event.index);
	}

	// Odtwórz pady, które są aktualnie aktywne
	activePads.forEach(i => {
		sounds[i].currentTime = 0;
		sounds[i].play();
		pads[i].classList.add('playing');
	});

	// Zaplanuj kolejne zdarzenia od currentTime wzwyż
	playbackTimeouts = [];

	data.forEach(event => {
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
	// Zatrzymaj wszystkie dźwięki i zdejmij klasy 'playing'
	sounds.forEach((sound, i) => {
		sound.pause();
		pads[i].classList.remove('playing');
	});

	// Zresetuj stan
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

	// === PAUSE ===
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

	// === DELETE ===
	removeBtn.addEventListener('click', () => {
		recordingDiv.remove();
		recordings[index] = null;
		recordingVariables[index] = null;
		p.textContent = '';
	});

	// === SEEK (PRZESUWANIE KULKI) ===
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

	activePads.forEach(i => {
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
		
// pause/play
playBtn.style.display = 'none';
pauseBtn.style.display = 'inline-block';
	});
}



//....................................................................

//Dla każdego pada w tablicy pads, jego index przekazywany jest do funkcji playToggle(index).
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
