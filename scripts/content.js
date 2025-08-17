
console.log("SchulPortalPlus loaded!"); 
advanceMeinUnterricht();
addPersonalPlan();



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
    addExtraTab("substitutions", "Vertretungsplan", vertretungsplan.querySelector("#content").innerHTML, "fa-list");
    addExtraTab("timetable", "Stundenplan", stundenplan.querySelector(".tab-content #all").innerHTML, "fa-clock");
    await implementPersonalPlan(stundenplan.querySelector("#own table"));
    addExtraTab("personaltimetable", "Persönlicher Plan", stundenplan.querySelector(".tab-content #own").innerHTML, "fa-user");
}

async function addExtraTab(tabId, tabName, tabContent, icon) {
    var tabs = document.querySelector(".nav-tabs");
    var tabcontent = document.querySelector(".tab-content");

    var newTab = document.createElement("div");
    newTab.className = "tab-pane";
    newTab.setAttribute("role", "tabpanel");
    newTab.id = tabId;
    newTab.innerHTML = tabContent;
    tabcontent.appendChild(newTab);

    var newTabLink = document.createElement("li");
    newTabLink.setAttribute("role", "presentation");
    newTabLink.innerHTML = '<a href="#' + tabId + '" aria-controls="' + tabName + '" role="tab" data-toggle="tab" aria-expanded="false"><i class="fa fa-fw ' + icon + '"></i> ' + tabName + '</a>';
    tabs.appendChild(newTabLink);
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

async function addPersonalPlan() {
    if (!window.location.href.startsWith("https://start.schulportal.hessen.de/stundenplan.php")) return;
    var personalTable = document.querySelector("#own table");
    implementPersonalPlan(personalTable);
}

async function implementPersonalPlan(personalTable) {
    var spHTML = await fetch("https://start.schulportal.hessen.de/stundenplan.php").then(response => response.text());
    var parser = new DOMParser(); 
    var stundenplan = parser.parseFromString(spHTML, "text/html");
    var spTable = stundenplan.querySelector("#all table");
    var lgData = await fetchLerngruppen();
    console.log("Lerngruppen: ", lgData);
    var tutor = lgData.find(item => item.name.includes("TUT")).teacher;
    for (let i = 1; i < spTable.rows.length; i++) {
        const row = spTable.rows[i];

        for (let j = 1; j < row.cells.length; j++) {
            const cell = row.cells[j];
            if (cell.innerHTML.trim() === "") continue; // Skip empty cells
            //console.log("Processing cell: row " + i + ", column" + j);

            var stunden = cell.querySelectorAll("div");
            if (stunden == null || stunden.length === 0) continue; // Skip cells without divs
            Array.from(stunden).forEach(stunde => {
                var teacher = stunde.querySelector("small");
                var kurs = stunde.querySelector("b");
        
                if (teacher != null) {
                    teacher = teacher.innerText.trim();
                    if (kurs != null) {
                        var kursText = kurs.innerText.trim();
                        var kursId = kurs.textContent.trim();
                        console.log("Kurs: " + kursText + ", Lehrer: " + teacher);
                        if (kursId.startsWith("1Q2ma")) {
                            kursId = "1Q2m" + kursId.substring(5); // Convert "ma" to "m"
                        }

                        if (lgData.some(item => item.name === kursId && item.teacher === teacher) 
                            || (kursText.includes("tut") && teacher.includes(tutor))) {
                            console.log(kursText + " bei " + teacher + " mit spanne " + cell.rowSpan);
                            kursText = kursText.substring(3); // Remove "1Q2" prefix
                            if (kursText[0] == kursText[0].toUpperCase()) {
                                cell.style.backgroundColor = "#741f1f5e";
                            }
                        } else {
                            stunde.remove();
                            //console.log("Kurs " + kurs + " bei " + teacher + " not found in lerngruppen data.");
                        }
                        kurs.textContent = kursText; // Update kurs text
                    }
                }
            });
        }
    }
    personalTable.innerHTML = spTable.innerHTML;
}

async function fetchLerngruppen() {
    var lgHTML = await fetch("https://start.schulportal.hessen.de/lerngruppen.php").then(response => response.text());
    var parser = new DOMParser(); 
    var lerngruppen = parser.parseFromString(lgHTML, "text/html");
    var lgTable = lerngruppen.querySelector("#kurse table");
    var lgData = [];
    for (let i = 1; i < lgTable.rows.length; i++) {
        const row = lgTable.rows[i];
        var lgName = row.cells[1].querySelector("small").innerText.trim().substring(1).split(" - ")[0];
        var lgTeacher = row.cells[2].innerText.trim().split("(")[1].slice(0, -1);
        var lg = {
            name: lgName,
            teacher: lgTeacher
        }
        lgData.push(lg);
    }
    return lgData;
}