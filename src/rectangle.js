var rectangle = {
    animation: function () {
        var duration = 300000; // wie lange soll die Animation dauern (1000ms == 1 sekunde)
        var step = duration / 100; // wie oft soll der fortschrittsbalken aktualisiert werden?
        var value = 0; // setzt den initialen Startwert des Fortschrittsbalkens
        var interval = setInterval(function(){
            if (value < duration) {
                value += step;
                rectangle.draw(duration, value);
            } else {
                clearInterval(interval);
            }
        },step, duration, value);   // binden der Parameter an den Interval
    },
    
    draw: function (duration,  value) {
         var time = parseInt(value/duration * 300);
          // setzen des Hintergrundes auf den aktuellen Zeit
          document.getElementById("rectangle").style.backgroundSize = time + "sek 300sek";
          // setzen des Textes auf den aktuellen Zeit
          document.getElementById("progressInformation").innerHTML = time + " sek";
    }
};

// Starten der Animation, wenn das Fenster vollständig geladen ist
window.onload = rectangle.animation();