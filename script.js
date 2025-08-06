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
const recordBtn = document.getElementById('recordBtn');

const recordingList = document.getElementById('.recording-list');

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

let isRecording = false; // po to aby wiedzieć czy się nagrywa czy nie
let recordedSequence = []; //tablica, która będzie zawierać zarejestrowae dźwięki/historię kliknięć, czyli jaki pad został kliknięty po jakim czasie od startu nagrywania, każdy element w tej tablic to obiekt
let startTime; //czas kiedy użytkownik rozpoczął nagranie
let isPlaying = false;
let savedRecordings = []; // tablica nagrań

const onPadClick = (index) => {
	if (isPlaying) {
		// jeśli trwa odtwarzanie, ignorujemy kliknięcie
		return;
	}
	playToggle(index);
	handlePadClick(index);
};

//Funkcja włącza lub wyłącza dźwięk pada i zmienia styl pada zależnie od tego, czy gra
const playToggle = (index) => {
	const sound = sounds[index];
	const pad = pads[index];

	if (sound.paused) {
		// restart i odtwarzanie
		sound.currentTime = 0; //ustawiamy że audio gra od zera
		sound.play(); //to po prostu zaczyna puszczać audio

		pad.classList.add('playing');
	} else {
		sound.pause();
		pad.classList.remove('playing');
	}
};

const handleEnded = (i) => () => {
	pads[i].classList.remove('playing');
};

const recordPads = () => {
	isRecording = !isRecording;

	if (isRecording) {
		recordedSequence = []; //czyścimy tablicę (miejsce na nowe nagranie)
		startTime = Date.now(); //zwraca liczbę milisekund od tzw. epoki UNIX-a (1 stycznia 1970)
		recordBtn.style.color = '#d31e1eff';
		recordBtn.style.boxShadow = '0 0 5px #d31e1eff';
	} else {
		recordBtn.style.color = 'rgba(255, 255, 255, 0.5)';
		recordBtn.style.boxShadow = 'none';
		//buttony nie mogą być klikalne

		//stworzyć coś co będzie pushować elementy do tablicy


		
	}
};
//Po kliknięciu pada dźwięk się odtwarza i, jeśli trwa nagranie, zapisuje info o kliknięciu (co i kiedy).
const handlePadClick = (index) => {
	//funkcja która przyjmuje parametr, index pada, który został kliknięty
	playToggle(index); //funckja playToggle, której przekazuję index pada

	if (isRecording) {
		//sprawdzamy czy trwa nagrywanie
		recordedSequence.push({
			//dodajemy nowy obiekt do tablicy
			index: index, // index pada
			timestamp: Date.now() - startTime, //oblicza upływ czasu w milisekundach od momentu rozpoczęcia nagrywania
		});
	}
};

pads.forEach((pad, index) => {
	pad.addEventListener('click', () => onPadClick(index));
});

pads.forEach((pad, index) => {
	pad.addEventListener('click', () => playToggle(index));
});

sounds.forEach((sound, i) => {
	sound.addEventListener('ended', handleEnded(i));
});

recordBtn.addEventListener('click', recordPads);

pads.forEach((pad, index) => {
	pad.addEventListener('click', () => {
		playToggle(index);
		handlePadClick(index);
	});
});
