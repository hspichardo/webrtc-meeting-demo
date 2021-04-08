var resultTranscriptContainer = document.getElementById('result-transcript-container');

let recognitionTranscript;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition

if (typeof SpeechRecognition !== "undefined") {

    recognitionTranscript = new SpeechRecognition();
    recognitionTranscript.lang = "en-EN";
    recognitionTranscript.continuous = true;
    recognitionTranscript.interimResults = true;

    recognitionTranscript.onresult = function (event) {
        resultTranscriptContainer.innerHTML = "";
        for (const res of event.results) {
            console.log(res[0].transcript);
            const text = document.createTextNode(res[0].transcript);
            const p = document.createElement("p");
            if (res.isFinal) {
                p.classList.add("final");
            }
            p.appendChild(text);
            resultTranscriptContainer.appendChild(p);
        }
    }
}

function transcriptStart() {
    if (recognitionTranscript) {
        recognitionTranscript.start();
    }

};
function transcriptStop() {
    if (recognitionTranscript)
        recognitionTranscript.stop();
};

function transcriptClearContainer() {
    resultTranscriptContainer.innerHTML = "";
};