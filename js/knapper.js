
$(function () {


    $('body').on('click', '#gemknap', function () {

        GemTilLocalstorage();
    })

    $('body').on('click', '#fjernknap', function () {

        FjernAltIDOM()
    })

    $('body').on('click', '#fyldknap', function () {

        HentAltTilDOM()
    })

    $('body').on('click', '#NyGrundNodeKnap', function (e) {
        //Hvordan får jeg indsat en redbox forrest i samtale
        console.log(e)
        LavEnGrundnodeBoks(e)

    })


    function GemTilLocalstorage() {
        //Hent tidligere indtastninger fra denne browers localstorage
        if (localStorage.getItem("indtastninger") != null) {
            var indtastninger = localStorage.getItem("indtastninger");
        }
        //Hent JSON
        var indtastninger = JSON.parse(localStorage.getItem("indtastninger"));
        //Skriv til localstorage
        var helehjemmesiden = document.getElementById("samtale").innerHTML;
        localStorage.setItem("indtastninger", helehjemmesiden);
        //Skriv JSON
        localStorage.setItem("indtastninger", JSON.stringify(helehjemmesiden));
        //Erstat HTML med det fra localstorage
    }


    function FjernAltIDOM() {
        //Fjerner indholdet af samtale-div'en og laver et nyt p.redbox
        document.getElementById("samtale").innerHTML =
            "<p class='redbox' contenteditable='true'>Skriv noget nyt..</p";
    }

    
    function HentAltTilDOM() {
        document.getElementById("samtale").innerHTML = JSON.parse(localStorage.getItem(
            "indtastninger"));
    }
     

});
