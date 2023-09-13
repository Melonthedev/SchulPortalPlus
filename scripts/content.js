
console.log("Hello from content.js");

addExtraInfo();



async function addExtraInfo() {
   if (!window.location.href.startsWith("https://start.schulportal.hessen.de/meinunterricht.php")) return;
    //var vpHTML = await fetch("https://start.schulportal.hessen.de/vertretungsplan.php").then(response => response.text());
    var spHTML = await fetch("https://start.schulportal.hessen.de/stundenplan.php").then(response => response.text());

    var parser = new DOMParser(); 
    var day = new Date().getDay();
    if (day == 6 || day == 7 || (day == 5 && new Date().getHours() >= 15)) day = 1;
    if (new Date().getHours() >= 15 && (new Date().getDay() != 7 && new Date().getDay() != 6 && new Date().getDay() != 5)) day++; //Nach 15 uhr infos für den nächsten tag anzeigen

    //var vertretungsplan = parser.parseFromString(vpHTML, "text/html");
    var stundenplan = parser.parseFromString(spHTML, "text/html");

    for (var i = 1; i < 10; i++) {
        var addedSubjects = [];
        for (var j = 1; stundenplan.querySelector("table tbody tr:nth-child(" + i + ") td:nth-child(" + (day + 1) + ") div:nth-child(" + j + ") b") != null; j++) {
            var stunde = stundenplan.querySelector("table tbody tr:nth-child(" + i + ") td:nth-child(" + (day + 1) + ") div:nth-child(" + j + ") b");
            if (stunde == null) continue;
            var infoBtn = document.createElement("button");
            infoBtn.className = "btn btn-default btn-xs";
            infoBtn.style.marginRight = "2px";
            infoBtn.innerHTML = ((new Date().getDay() == 6 || new Date().getDay() == 7 || (new Date().getDay() == 5 && new Date().getHours() >= 15)) ? "Montag: " : (new Date().getHours() >= 15 ? "Morgen: " : "")) + i + ". Stunde";
            infoBtn.onclick = function() {
                document.location = "/stundenplan.php";
            };
    
            //console.log(stunde.innerText);
            //console.log(convertToLongNames(stunde.innerText));
    
            var entry = 1;
            while (document.querySelector("table tbody tr:nth-child(" + entry + ") td:nth-child(1)") != null) {
                var subject = document.querySelector("table tbody tr:nth-child(" + entry + ") td:nth-child(1) h3 a span").innerText;
                if (subject.includes(convertToLongNames(stunde.innerText)) && !subject.includes("Vertretung") && !addedSubjects.includes(stunde.innerText)) {
                    document.querySelector("table tbody tr:nth-child(" + entry + ") td:nth-child(1) .teacher").append(infoBtn);
                    console.log("Added button for " + i + ". Stunde and subject " + stunde.innerText + " (" + convertToLongNames(stunde.innerText) + ") in Kursmappe " + subject);
                    addedSubjects.push(stunde.innerText);
                }
                entry++;
            }     
        }
    } 
}


//<button class="btn btn-default btn-xs" style="margin-right: 4px" onclick="document.location = '/stundenplan.php'">x. Stunde</button>

function convertToLongNames(short) {
    // return the long form name of the subject (e.g. "D" -> "Deutsch")
    switch (short) {
        case "D":
            return "Deutsch";
        case "E":
            return "Englisch";
        case "M":
            return "Mathematik";
        case "PH":
            return "Physik";
        case "CH":
            return "Chemie";
        case "BIO":
            return "Biologie";
        case "G":
            return "Geschichte";
        case "PW":
            return "Politik und Wirtschaft";
        case "EK":
            return "Erdkunde";
        case "MU":
            return "Musik";
        case "KU":
            return "Kunst";
        case "SP":
            return "Sport";
        case "ETH":
            return "Ethik";
        case "EREL":
            return "Religion - evangelisch";
        case "KREL":
            return "Religion - katholisch";
        case "F":
            return "Französisch";
        case "L":
            return "Latein";
        case "WU-MINT-II.1":
            return "Naturwissenschaften 10";
    }
}