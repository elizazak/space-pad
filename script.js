const pad1 = document.querySelector('#pad1');
const pad2 = document.querySelector('#pad2');
const pad3 = document.querySelector('#pad3');
const pad4 = document.querySelector('#pad4');
const pad5 = document.querySelector('#pad5');
const pad6 = document.querySelector('#pad6');
const pad7 = document.querySelector('#pad7');
const pad8 = document.querySelector('#pad8');
const pad9 = document.querySelector('#pad9');
const pad10 = document.querySelector('#pad10');
const pad11 = document.querySelector('#pad11');
const pad12 = document.querySelector('#pad12');
const pad13 = document.querySelector('#pad13');
const pad14 = document.querySelector('#pad14');
const pad15 = document.querySelector('#pad15');
const pad16 = document.querySelector('#pad16');
const recordBtn = document.querySelector('.record-btn');

const recordingsContainer = document.querySelector('.recordings-container');

//zmienne do nagrywania

let isRecording = false; // zmienna nagrywania
let currentRecording = []; // bieżące kliknięcia padów
let recordings = []; // lista wszystkich nagrań
let maxRecordings = 5; // max 5 nagrań
const recordingVariables = [null, null, null, null, null]; // recording1 do recording5

//pady zebrane w tablicę, żeby można było po nich iterować, np. funkcja forEach
const pads = [
	pad1,
	pad2,
	pad3,
	pad4,
	pad5,
	pad6,
	pad7,
	pad8,
	pad9,
	pad10,
	pad11,
	pad12,
	pad13,
	pad14,
	pad15,
	pad16,
];

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
	const sound = sounds[index]; //dźwięk z tej samej pozycji co pad
	const pad = pads[index]; //pad z tej samej pozycji

	if (sound.paused) {// jeśli dźwięk nie gra, wbudowana właściwość
		// restart i odtwarzanie
		sound.currentTime = 0; //ustawiamy że audio gra od zera
		sound.play(); //to po prostu zaczyna puszczać audio

		pad.classList.add('playing');

		if (isRecording) {
			currentRecording.push({ index, time: Date.now() }); // zapisanie indexu i czasu
		}
	} else {
		sound.pause();
		pad.classList.remove('playing');
	}





};

const recordToggle = () => {
		if (!isRecording && recordings.length < maxRecordings) {
		startRecording(); 
	} else if (isRecording) {
		stopRecording(); 
	}
}

const startRecording = () => {
	isRecording = true;
	currentRecording = []; //wyczyszczenie tablicy
	recordBtn.style.color = 'red';
}

const stopRecording = () => {
	isRecording = false; 
	recordBtn.style.color = '';

	const recordingData = [...currentRecording]; // kopiowanie nagrania
	recordings.push(recordingData); // dodanie do listy nagrań

	recordingVariables[recordings.length - 1] = recordingData; // przypisanie recording1, recording2...

	showRecording(recordings.length - 1); //pokazanie nagrania, dodanie dynamicznie
}


//.....................................................................

// Funkcja tworząca i wyświetlająca nowe nagrania
function showRecording(index) {
	const recordingsArea = document.querySelector('.recordings-area');
	recordingsArea.style.display = 'flex'; // kontener

	const recordingDiv = document.createElement('div');
	recordingDiv.classList.add('recording');

	const playBtn = document.createElement('button');
	playBtn.classList.add('play-btn');
	playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';

	const pauseBtn = document.createElement('button');
	pauseBtn.classList.add('pause-btn');
	pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

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

	document.querySelector('.recordings-area').appendChild(recordingDiv);

	// Odtwarzanie nagrania
	let playbackTimeouts = [];
	let startTime = null;

	playBtn.addEventListener('click', () => {
		playBtn.style.display = 'none';
		pauseBtn.style.display = 'inline-block';
		startTime = Date.now();

		const data = recordingVariables[index];
		if (!data || data.length === 0) return;

		const start = data[0].time;

		data.forEach(event => {
			const delay = event.time - start;
			const timeout = setTimeout(() => {
				playToggle(event.index);
			}, delay);
			playbackTimeouts.push(timeout);
		});
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


recordBtn.addEventListener('click', recordToggle)
