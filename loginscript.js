//arrays
var users = [
    "User 1",
    "User 2",  
    "User 3",  
    "User 4",  
    "User 5"
]
var passwords = [
    "test1",
    "test2", 
    "test3", 
    "test4", 
    "e3d704f3542b44a621ebed70dc0efe13"
]
var answers = [];
//other variables
var answerTime = 30 * 1000;
var lock = false;
var running = false;
var accept = true;
var tries;
var totalTries = 0;
var csuserindex = 0;
var totalTime = 0;

$(document).ready(function() {
    $('#login-button').click(function() {
        if (lock || !accept) {
            return;
        }
        var velement = document.getElementById("pass");
        var pswdValue = velement.value;
        if (pswdValue == "") {
            loginDenied("Salasana ei voi olla tyhjä!", false);
        } else if (csuserindex == 4) {
            var pswhash = md5(pswdValue);
            if (pswhash == passwords[csuserindex]) {
                loginSuccess();
            } else {
                loginDenied("Väärä Salasana!", true); 
            }
        } else if (pswdValue == passwords[csuserindex]) {
            loginSuccess();
        } else {
            loginDenied("Väärä Salasana!", true); 
        }
        velement.value = "";
    });
    nextUser();
});

function loginDenied(msg, usetry) {
    if (lock) {
        return;
    }
    lock = true;
    $('.log-status').addClass('wrong-entry');
    if (usetry) {
        totalTries++;
        if (--tries < 1) {
            running = false;
            answers[csuserindex] = false;
            setTries("<font color='red'>0</font>");
            var nextUser = getNextUser();
            if (nextUser == null) {
                $('.alert-denied').fadeIn(500).html("Yritykset loppuivat!");
                accept = false;
                setTimeout("processEnd();", 2000);
            } else {
                $('.alert-denied').fadeIn(500).html(msg + " Seuraava käyttäjä: " + nextUser);
                setTimeout("nextUser();", 2000);
            }
        } else {
            $('.alert-denied').fadeIn(500).html(msg);
            setTries(tries); 
        }
    } else {
        $('.alert-denied').fadeIn(500).html(msg);
    }
    setTimeout( "$('.alert-denied').fadeOut(1500);", 1500);
    setTimeout( "lock = false;", 1500);
    setTimeout( "$('.log-status').removeClass('wrong-entry');", 1500);
}

function loginSuccess() {
    running = false;
    answers[csuserindex] = true;
    totalTries++;
    $('.log-status').addClass('correct-entry');
    var nextUser = getNextUser();
    if (nextUser == null) {
        $('.alert-success').fadeIn(500).html("Salasana oikein!");
        accept = false;
        setTimeout("processEnd();", 2000);
    } else {
        $('.alert-success').fadeIn(500).html("Salasana oikein! Seuraava käyttäjä: " + nextUser);
        setTimeout(" nextUser();", 2000);
    }
    setTimeout( "$('.alert-success').fadeOut(1500);", 1500);
    setTimeout( "$('.log-status').removeClass('correct-entry');", 1500);
}

function startTimer() {
    var tlelement = document.getElementById("time-left");
    var date = new Date();
    tlelement.timeStart = date.getTime() + answerTime;
    var msg = "Aikaa jäljellä: ";
    tlelement.intervalVar = setInterval(function() {
        var ndate = new Date();
        var curTime = tlelement.timeStart - ndate.getTime();
        if (!running) {
            clearInterval(tlelement.intervalVar);
        } else if (curTime < 0) {
            tlelement.innerHTML = "<font color='red'>Aika loppui</font>";        
            clearInterval(tlelement.intervalVar);
            tries = 0;
            lock = false; // unlocked for the timer otherwise this might get buggy
            loginDenied("Aika loppui!", true);
        } else {
            tlelement.innerHTML = msg + "<font color='red'>" + formatMilliSeconds(curTime) + "s</font>";
        }
        totalTime += 20;
    }, 20);
}

function nextUser() {
    tries = 3;
    var user = "Kirjaudu käyttäjänä: <b>" + users[csuserindex] + "</b> / " + users.length;
    var uelement = document.getElementById("content-text");
    uelement.innerHTML = user;
    startTimer();
    setTries(tries);
    running = true;
}

function setTries(tries) {
    var telement = document.getElementById("tries-left");
    var triesStr = "Yrityksiä jäljellä: " + tries + "/3";
    telement.innerHTML = triesStr; 
}

function processEnd() {
    running = false;
    //remove heading stuff
    var telement = document.getElementById("title");
    var uelement = document.getElementById("content-text");
    telement.innerHTML = "";
    uelement.innerHTML = "";
    var lelement = document.getElementById("login-section");
    //stats
    var header = "<font style='font-weight:bold' size='6px;'>Tulokset:</font><br/><br/>";
    var stats = "";
    for (i = 0; i < users.length; i++) { 
        var response = answers[i];
        var val = response ? "<font color='#006400'>Oikein</font>" : "<font color='red'>Väärin</font>";
        stats += "<b>" + users[i] + ":</b> " + val + "<br/>";
    }
    lelement.innerHTML = header + stats;
    //tries
    var telement = document.getElementById("tries-left");
    telement.innerHTML = "Yrityksiä yhteensä: <b>" + totalTries + "/15</b>"; 
    //total time
    var tlelement = document.getElementById("time-left");
    tlelement.innerHTML = "Kokonaisaika: <font color='red'>" + formatMilliSeconds(totalTime) + "s</font>";
    //home button
    var hbuttonelement = document.getElementById("options");
    hbuttonelement.style.display = 'block';
    
}

function getNextUser() {
    csuserindex++;
    if (csuserindex >= users.length) {
        return null;
    } 
    return users[csuserindex];
}

function formatMilliSeconds(milli) {
    var milliseconds = milli % 1000;
    var seconds = Math.floor((milli / 1000) % 60);
    var minutes = Math.floor((milli / (60 * 1000)) % 60);
    if (minutes < 1) {
        return seconds + "." + milliseconds;
    } else {
        return minutes + ":" + seconds + "." + milliseconds;
    }
}
