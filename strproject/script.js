const $ = selector =>
    document.querySelector(selector);

let startTime = Date.now();

let eventCount = 1;

function pad(number){
    return String(number).padStart(2,"0");
}

function updateClock(){
    const now = new Date();
    $("#clock").textContent =
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const seconds =
        Math.floor((Date.now()-startTime)/1000);

    $("#uptime").textContent =
        `${pad(Math.floor(seconds/3600))}:`+
        `${pad(Math.floor(seconds/60)%60)}:`+
        `${pad(seconds%60)}`;
}

setInterval(updateClock,1000);
updateClock();

$("#sessionId").textContent =
    "OM-" +
    Math.random()
        .toString(16)
        .substring(2,6)
        .toUpperCase();

const particles =
    $("#particles");

for(let i=0;i<50;i++){
    const particle =
        document.createElement("span");

    particle.className =
        "particle";

    particle.style.left =
        Math.random()*100 + "%";

    particle.style.animationDuration =
        (7+Math.random()*16) + "s";

    particle.style.animationDelay =
        (-Math.random()*18) + "s";

    particles.appendChild(particle);
}

const waveform =
    $("#waveform");

for(let i=0;i<55;i++){
    const wave =
        document.createElement("span");

    wave.className =
        "wave";

    wave.style.setProperty(
        "--h",
        `${4+Math.random()*26}px`
    );

    wave.style.animationDelay =
        `${Math.random()*.8}s`;

    waveform.appendChild(wave);
}

const matrix =
    $("#matrix");

for(let i=0;i<84;i++){
    const cell =
        document.createElement("span");

    if(Math.random()>.7){
        cell.className =
            "on";
    }

    matrix.appendChild(cell);
}

function escapeHTML(text){
    return text.replace(
        /[&<>"']/g,
        character => {
            return {
                "&":"&amp;",
                "<":"&lt;",
                ">":"&gt;",
                '"':"&quot;",
                "'":"&#039;"
            }[character];
        }
    );
}

function speakResponse(text){
    if(!$("#voiceOutput").checked || !("speechSynthesis" in window))
        return;

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";
    utterance.rate = .95;
    utterance.pitch = 1;

    $("#voiceStatus").textContent = "SPEAKING";

    utterance.onend = () => {
        $("#voiceStatus").textContent = "VOICE READY";
    };

    utterance.onerror = () => {
        $("#voiceStatus").textContent = "VOICE ERROR";
    };

    window.speechSynthesis.speak(utterance);
}

function addLog(type,text){
    const entry =
        document.createElement("div");

    entry.className =
        `log-entry ${type}`;

    let name =
        type==="user"
        ? "YOU"
        : type==="ai"
        ? "OMEGA"
        : "SYSTEM";

    entry.innerHTML = `
        <span class="stamp">
            ${name}
        </span>
        <p>
            ${escapeHTML(text)}
        </p>
    `;

    $("#log").appendChild(entry);
    $("#log").scrollTop =
        $("#log").scrollHeight;

    eventCount++;
    $("#archiveCount").textContent =
        String(eventCount).padStart(2,"0")
        + " EVENTS";

    const archiveRow =
        document.createElement("div");

    archiveRow.className =
        "archive-row";

    archiveRow.innerHTML = `
        <span>
            ${new Date().toLocaleTimeString()}
        </span>
        <b>
            ${type.toUpperCase()}
        </b>
        <span>
            ${escapeHTML(text)}
        </span>
    `;

    $("#archive").prepend(
        archiveRow
    );
}

async function executeCommand(raw){
    const command =
        raw.trim();

    if(!command)
        return;

    addLog(
        "user",
        command
    );

    $("#commandInput").value="";
    $("#coreState").textContent =
        "PROCESSING";
    $("#process").textContent =
        "PROCESSING";

    try{
        const result = await fetch("/api/command",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({command})
        });

        const payload = await result.json();

        if(!result.ok)
            throw new Error(payload.error || "The backend rejected the command.");

        addLog("ai",payload.response);
        speakResponse(payload.response);
    }
    catch(error){
        const message = `Backend unavailable: ${error.message}`;
        addLog("system",message);
        speakResponse(message);
    }
    finally{
        $("#coreState").textContent = "STANDBY";
        $("#process").textContent = "STANDBY";
    }
}

$("#sendBtn").onclick = () => {
    executeCommand(
        $("#commandInput").value
    );
};

$("#commandInput")
.addEventListener(
    "keydown",
    event => {
        if(event.key==="Enter"){
            executeCommand(
                event.target.value
            );
        }
    }
);

document
.querySelectorAll(".quick-actions button")
.forEach(button => {
    button.onclick = () => {
        executeCommand(
            button.dataset.command
        );
    };
});

$("#clearLog").onclick = () => {
    $("#log").innerHTML = "";
    addLog(
        "system",
        "Conversation buffer cleared."
    );
};

let recognition = null;

if(
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
){
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    recognition =
        new SpeechRecognition();

    recognition.lang =
        "en-IN";

    recognition.interimResults =
        false;

    recognition.onstart = () => {
        $("#micBtn")
            .classList
            .add("listening");
        $("#coreState").textContent =
            "LISTENING";
        $("#voiceStatus").textContent =
            "LISTENING";
    };

    recognition.onend = () => {
        $("#micBtn")
            .classList
            .remove("listening");
        $("#coreState").textContent =
            "STANDBY";
        $("#voiceStatus").textContent =
            "VOICE READY";
    };

    recognition.onerror = event => {
        addLog(
            "system",
            `Voice input error: ${event.error}. Check microphone permission.`
        );
        $("#voiceStatus").textContent = "VOICE ERROR";
    };

    recognition.onresult =
        event => {
            const text =
                event
                .results[0][0]
                .transcript;

            $("#commandInput").value =
                text;
            executeCommand(text);
        };
}

$("#micBtn").onclick = () => {
    if(recognition){
        try{
            recognition.start();
        }
        catch(error){
            addLog("system", "Voice input is already active.");
        }
    }
    else{
        addLog(
            "system",
            "Speech recognition is not supported in this browser."
        );
        $("#voiceStatus").textContent = "INPUT UNSUPPORTED";
    }
};

if(!("speechSynthesis" in window)){
    $("#voiceOutput").disabled = true;
    $("#voiceStatus").textContent = "OUTPUT UNSUPPORTED";
}

$("#voiceOutput").onchange = event => {
    if(!event.target.checked && "speechSynthesis" in window)
        window.speechSynthesis.cancel();

    $("#voiceStatus").textContent =
        event.target.checked ? "VOICE READY" : "VOICE MUTED";
};

document
.querySelectorAll(".nav-btn")
.forEach(button => {
    button.onclick = () => {
        document
        .querySelectorAll(".nav-btn")
        .forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        const target =
            button.dataset.section;

        document
        .querySelectorAll(".secondary-section")
        .forEach(section =>
            section.classList.add("hidden")
        );

        if(target==="command"){
            $(".left-panel").style.display =
                "flex";
            $(".right-panel").style.display =
                "flex";
            $(".core-section").style.display =
                "flex";
        }
        else{
            $(".left-panel").style.display =
                "none";
            $(".right-panel").style.display =
                "none";
            $(".core-section").style.display =
                "none";
            $("#" + target)
                .classList
                .remove("hidden");
        }
    };
});

function telemetry(){
    const cpu =
        Math.floor(
            12 + Math.random()*22
        );
    const ram =
        Math.floor(
            38 + Math.random()*13
        );
    const latency =
        Math.floor(
            5 + Math.random()*12
        );
    const temperature =
        Math.floor(
            39 + Math.random()*6
        );

    $("#cpu").textContent =
        cpu+"%";
    $("#coreLoad").textContent =
        cpu+"%";
    $("#cpuLarge").textContent =
        cpu+"%";
    $("#cpuBar").style.width =
        cpu+"%";

    $("#ram").textContent =
        ram+"%";
    $("#memory").textContent =
        ram+"%";
    $("#ramLarge").textContent =
        ram+"%";
    $("#ramBar").style.width =
        ram+"%";

    $("#latency").textContent =
        latency+" ms";

    const network =
        (
            .8 +
            Math.random()*.8
        ).toFixed(1);

    $("#net").textContent =
        network+" Gb/s";
    $("#netLarge").textContent =
        network+" Gb/s";
    $("#tempLarge").textContent =
        temperature+"°C";
    $("#tempBar").style.width =
        (temperature/80*100)+"%";

    $("#engineBar").style.width =
        (25+Math.random()*40)+"%";
}

setInterval(
    telemetry,
    1800
);
telemetry();
