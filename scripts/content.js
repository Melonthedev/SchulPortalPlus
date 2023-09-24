
console.log("SchulPortalPlus loaded!"); 
advanceMeinUnterricht();

async function advanceMeinUnterricht() {
    if (!window.location.href.startsWith("https://start.schulportal.hessen.de/meinunterricht.php")) return;
    var spHTML = await fetch("https://start.schulportal.hessen.de/stundenplan.php").then(response => response.text());
    var vpHTML = await fetch("https://start.schulportal.hessen.de/vertretungsplan.php").then(response => response.text());
    var parser = new DOMParser(); 
    var stundenplan = parser.parseFromString(spHTML, "text/html");
    var vertretungsplan = parser.parseFromString(vpHTML, "text/html");

    addExtraInfo(stundenplan);
    addExtraTabs(stundenplan, vertretungsplan);
}

async function addExtraInfo(stundenplan) {
    var day = new Date().getDay();
    if (day == 6 || day == 0 || (day == 5 && new Date().getHours() >= 15)) day = 1;
    if (new Date().getHours() >= 15 && (new Date().getDay() != 7 && new Date().getDay() != 6 && new Date().getDay() != 5)) day++; //Nach 15 uhr infos für den nächsten tag anzeigen

    for (var i = 1; i < 10; i++) {
        var addedSubjects = [];
        for (var j = 1; stundenplan.querySelector("table tbody tr:nth-child(" + i + ") td:nth-child(" + (day + 1) + ") div:nth-child(" + j + ") b") != null; j++) {
            var stunde = stundenplan.querySelector("table tbody tr:nth-child(" + i + ") td:nth-child(" + (day + 1) + ") div:nth-child(" + j + ") b");
            if (stunde == null) continue;
            var infoBtn = document.createElement("button");
            infoBtn.className = "btn btn-default btn-xs";
            infoBtn.style.marginRight = "2px";
            infoBtn.innerHTML = ((new Date().getDay() == 6 || new Date().getDay() == 7 || (new Date().getDay() == 5 && new Date().getHours() >= 15)) ? "Montag: " : (new Date().getHours() >= 15 ? "Morgen: " : "")) + i + ". Stunde";
            infoBtn.onclick = () => document.location = "/stundenplan.php";
            for(var entry = 1; document.querySelector("table tbody tr:nth-child(" + entry + ") td:nth-child(1)") != null; entry++) {
                var subject = document.querySelector("table tbody tr:nth-child(" + entry + ") td:nth-child(1) h3 a span").innerText;
                if (subject.includes(convertToLongNames(stunde.innerText)) && !subject.includes("Vertretung") && !addedSubjects.includes(stunde.innerText)) {
                    document.querySelector("table tbody tr:nth-child(" + entry + ") td:nth-child(1) .teacher").append(infoBtn);
                    console.log("Added button for " + i + ". Stunde and subject " + stunde.innerText + " (" + convertToLongNames(stunde.innerText) + ") in Kursmappe " + subject);
                    addedSubjects.push(stunde.innerText);
                }
            }   
        }
    } 
}

async function addExtraTabs(stundenplan, vertretungsplan) {
    var tabcontent = document.querySelector(".tab-content");
    var tabs = document.querySelector(".nav-tabs");

    var stundenplanTab = document.createElement("div");
    stundenplanTab.className = "tab-pane";
    stundenplanTab.setAttribute("role", "tabpanel");
    stundenplanTab.id = "stundenplan";
    stundenplanTab.innerHTML = stundenplan.querySelector(".tab-content #all").innerHTML;
    tabcontent.appendChild(stundenplanTab);
    var stundenplanTabLink = document.createElement("li");
    stundenplanTabLink.setAttribute("role", "presentation");
    stundenplanTabLink.innerHTML = '<a href="#stundenplan" aria-controls="stundenplan" role="tab" data-toggle="tab" aria-expanded="false"><i class="fa fa-fw fa-clock"></i> Stundenplan</a>';
    tabs.appendChild(stundenplanTabLink);

    var vertretungsplanTab = document.createElement("div");
    vertretungsplanTab.className = "tab-pane";
    vertretungsplanTab.setAttribute("role", "tabpanel");
    vertretungsplanTab.id = "vertretungsplan";
    console.log(vertretungsplan)
    vertretungsplan.querySelector(".panel-info:nth-child(2)").style.display = "block";
    vertretungsplan.querySelector(".panel-info:nth-child(3)").style.display = "block";

    vertretungsplanTab.innerHTML = vertretungsplan.querySelector("#content").innerHTML;
    tabcontent.appendChild(vertretungsplanTab);
    var vertretungsplanTabLink = document.createElement("li");
    vertretungsplanTabLink.setAttribute("role", "presentation");
    vertretungsplanTabLink.innerHTML = '<a href="#vertretungsplan" aria-controls="vertretungsplan" role="tab" data-toggle="tab" aria-expanded="false"><i class="fa fa-fw fa-list"></i> Vertretungsplan</a>';
    tabs.appendChild(vertretungsplanTabLink);
}


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