$(function() {

  /*

  To-do:
      - Find en måde at tillade at man bruger " " i Grund og Spec og mark-noder
      - fjern svg-pilen når den ikke peger direkte på Fra-noden, eller forlæng pilen efterhånden som boksen rykkes nedad
      - merge marknoder med samme name-indhold, hvis de udspringer fra samme spec- eller grundnode
      - tilføj n.range på marknoder så det fremgår af marknoden HVOR i Fra-noden der er markeret
          ELLER
      - udtænk en måde at opsplitte en node til et array af ord, og derefter vælg fra dette array hvilket ord der er markeret, med hensynstagen til sammensatte ord
      - Tilføj søgefelt-knap hvor man kan genfinde noder baseret på ord, eller på association



  */



  $('body').on('click', '#gemknap', function() {

    GemTilLocalstorage();
  })

  $('body').on('click', '#fjernknap', function() {

    FjernAltIDOM()
  })
  $('body').on('click', '#fyldknap', function() {

    HentAltTilDOM()
  })
  $('body').on('click', '#NyGrundNodeKnap', function(e) {
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

  // Retrieve Content
  function HentAltTilDOM() {
    document.getElementById("samtale").innerHTML = JSON.parse(localStorage.getItem(
      "indtastninger"));
  }

  //Opret et tekstfelt til grundnoder
  function LavEnGrundnodeBoks(e) {

    let NytPTag = document.createElement("p");
    $(NytPTag).attr("contenteditable", "true");
    $(NytPTag).addClass("redbox")

    //Hvis der ikke findes nogen redboxes allerede (fordi alt i dommen er slettet)
    if (document.getElementsByClassName("redbox")[0] = undefined) {
      console.log("der er ingen redboxes i vindues")
      let NySamtale = document.createElement("div");
      NySamtale.attr("id", "samtale");
      NySamtale.attr("class", "container-fluid");
      document.getElementById("NyGrundNodeKnap").append(NySamtale)
    } else if ($("p.redbox").innerText != "" && e.currentTarget.id != "NyGrundNodeKnap") {
      $(NytPTag).insertBefore(e.currentTarget);
      SendGrundNode() //Funktionskald indeni anden funktion. Skal dette være et return?
    } else if (e.currentTarget.id == "NyGrundNodeKnap") {
      $("#samtale").prepend(NytPTag);
      SendGrundNode() //Funktionskald indeni anden funktion. Skal dette være et return?
    }
  }

  //Opret et tekstfelt til uddybning (som er en specnode)
  function LavEnUddybningsboks(FraNoden, MarknodenDenKommerFra) {
    //UDDYBNINGSBOKS ÅBNES
    //Først, lav et p-element
    var NytPTag = document.createElement("p");
    //Dernæst, giv attributter til det
    $(NytPTag).attr("contenteditable", "true");
    $(NytPTag).addClass("greenbox")
    console.log("Uddybningsboks udspringer fra " + "%c" + MarknodenDenKommerFra.MarkNodensName,
      "color:#f8ca48;")
    //Dernæst, find det element som det nye p-element skal ligge efter
    var ParentNode = document.getElementById(FraNoden.id);
    //Denne funktion laver en svg og lægger den foran det nye p-element
    LavEnTaleboblePil(ParentNode, NytPTag, FraNoden, MarknodenDenKommerFra) //Funktionskald - skulle det have været et return?
    SendSpecNode(MarknodenDenKommerFra); //Funktionskald - skulle det have været et return?
  }



  //Opret et tekstfelt til til output af associationer (som er en ASSNODE)
  function LavEnOutputboks(FraNoden, NoderMedSammeIndhold, ASSNoden) {
    //Outputboks ÅBNES
    var NytPTag = document.createElement("p");
    $(NytPTag).attr("id", ASSNoden.ASSNodensID)
    $(NytPTag).attr("class", "purpleparagraf")
    $(NytPTag).attr("contenteditable", "true");
    //Det er her magien skal ske. Mange algoritmer skal afgøre hvad der skal stå her i dette outputfelt
    NytPTag.innerText = NoderMedSammeIndhold[0].MATCHENDENodensName;
    console.log("nu bliver der lavet en associationsboks")

    var ParentNode = document.getElementById(FraNoden.id);

    if (ParentNode.parentElement == $("p.redbox")) {
      console.log("output udspringer fra" + "c% grundnode", "color:red;")

      var nyOutputBoks = document.createElement("div")
      $(nyOutputBoks).attr("class", "purpleboks")
      nyOutputBoks.append(NytPTag)
    } else {
      $(NytPTag).insertAfter(ParentNode.parentElement.lastElementChild);
      console.log("Output placeret efter")
      console.log(ParentNode)
    }
  }

  function SendGrundNode() {
    var kunDenEneGang = true;
    $("p.redbox").keypress(async function(e) {
      //submit ved ENTER
      if (e.which == 13 && kunDenEneGang && e.currentTarget.id == "") {
        console.log("ENTER i redbox")
        kunDenEneGang = false;
        e.preventDefault();
        await LavEnGrundnode(e);
      } else if (e.which == 13 && kunDenEneGang == false) {
        kunDenEneGang = true;
        e.preventDefault()
        LavEnGrundnodeBoks(e)
        console.log("ENTER trykket igen i redbox")
      }
    });

    //Når man klikker i grundnodeboksen skal eksempelteksten ryddes
    $("p.redbox").mousedown(function(e) {
      //fjern placeholderteksten
      if ($("p.redbox").text() === "Skriv noget her") {
        $("p.redbox").text("")
        console.log("Placeholder Fjernet ")
      } else if ($("p.redbox").text() === "Skriv noget nyt...") {
        $("p.redbox").text("")
        console.log("Placeholder Fjernet igen")
      }

      //Fjern eventuelle mark-elementer i dette p-element
      FjernMarkTag(e);

      //Hvis man glemmer at trykke ENTER og laver mousedown igen, sendes teksten til neo4j = GRUNDNODE OPRETTES VED MUSEKLIK
      if (e.currentTarget.innerText != "" && kunDenEneGang && e.currentTarget.id == "") {
        console.log(
          "Da der ikke blev trykket ENTER i .redbox, sendes indholdet til databasen")
        var rootNodeResult = LavEnGrundnode(e) //Funktionskald indeni anden funktion. Skal dette være et return?
        SetBoxId(rootNodeResult.id, e.currentTarget);
      }
    });
  };
  $('body').on("mouseup", "p.redbox", function(e) {
    //Vælg det markerede tekst ved mouseup
    SelectTextFromWindow(e) //Funktionskald indeni anden funktion. Skal dette være et return?
    console.log("der er mouseup i .redbox")

    if (e.currentTarget.nextElementSibling != null && e.currentTarget.nextElementSibling.childNodes[1].innerHTML == "") {
      e.currentTarget.nextElementSibling.remove()
      console.log("tom greenbox fjernet")
    }

  })


  //(GENBRUG) Skriv i tekstfeltet og send ved Enter
  function SendSpecNode(MarknodenDenKommerFra) {
    //Hvis man bruger musen i et grønt felt som IKKE er tomt, så skal den sende til databasen
    var kunDenEneGang = true;

    $(".greenbox").keypress(function(e) {
      if (e.which == 13 && kunDenEneGang && e.currentTarget.id == "") {
        console.log("ENTER i .greenbox")
        kunDenEneGang = false;
        e.preventDefault()

        var specNodeResult = LavEnSpecnode(e.currentTarget); //Funktionskald - skulle det have været et return?
        SetBoxId(specNodeResult.id, e.currentTarget);
        LavEnSpecRel(MarknodenDenKommerFra.id, SPECNoden) //funktionskald - skulle det have været et return?
        e.currentTarget.removeAttribute("contenteditable")
      }
    }); //Funktionskald - skulle det have været et return?

    $("body").on("mousedown", ".greenbox", function(e) {
      FjernMarkTag(e); //Funktionskald - skulle det have været et return?
      if (e.currentTarget.innerText != "" && kunDenEneGang && e.currentTarget.id ==
        "") {
        console.log(
          "Da der ikke blev trykket ENTER i .greenbox, sendes indholdet til databasen"
        )
        var specNodeResult = LavEnSpecnode(e.currentTarget); //Funktionskald - skulle det have været et return?
        SetBoxId(specNodeResult.id, e.currentTarget);
        LavEnSpecRel(MarknodenDenKommerFra.id, SPECNoden) //funktionskald - skulle det have været et return?

        e.currentTarget.removeAttribute("contenteditable")
        kunDenEneGang = false;
      }

    }); //Funktionskald - skulle det have været et return?
  }

  //Send indhold til neo4j om at oprette en grundnode
  async function LavEnGrundnode(e) {
    var nodeType = "ROOT";
    var apiEndpointUrl = "https://localhost:44380/Node/Create/" + e.target.innerText + "/" + nodeType;
    var nodeResult = await httpGetAsync(apiEndpointUrl, e.currentTarget).then(SetBoxId, console.log);
    return nodeResult;
  };

  //Send indhold til neo4j om at oprette en marknode
  async function LavEnMarkNode(selectedText, node) {
    var nodeType = "MARK";
    var apiEndpointUrl = "https://localhost:44380/Node/Create/" + $.trim(selectedText) + "/" + nodeType;
    var nodeResult = await httpGetAsync(apiEndpointUrl, node).then(SurroundSelectedTextWithMarkTag, console.log);
    SetBoxId(nodeResult);
    return nodeResult;
  }


  //Send indhold til neo4j om at oprette en Spec-node
  function LavEnSpecnode(CurrentGreenBoxWithKeypress) {

    var nodeType = "SPEC";
    var apiEndpointUrl = "https://localhost:44380/Node/Create/" + $.trim(CurrentGreenBoxWithKeypress.innerText) + "/" + nodeType;
    var specNodeResult = httpGetAsync(theUrl);
    return specNodeResult;
  }

  function LavEnMarkRel(FraNode, TilNode) {
    var relationType = "Mark";
    var markNodeName = TilNode.MarkNodensName;
    var markNodensCreationTime = TilNode.MarkNodensCreationTime;
    var markNodensLabel = TilNode.MarkNodensLabels[0];
    var fraNodeId = FraNode.id;
    var apiEndpointUrl = "https://localhost:44380/Relation/Create/" + relationType + "/" + markNodeName + "/" + markNodensCreationTime + "/" + markNodensLabel + "/" + fraNodeId;
    httpGetAsync(apiEndpointUrl);
  }

  //Åbner ajax-api-xmlhttprequest-xhr
  function httpGetAsync(theUrl, htmlElement) {
    return new Promise(function(resolve, reject) {
      var xmlHttp = new XMLHttpRequest();
      var element = htmlElement;
      xmlHttp.onreadystatechange = async function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          console.log("readystate = 4: " + xmlHttp.responseText);
          var jsonResult = await JSON.parse(xmlHttp.responseText);
          var resultObject =
          {
            node: jsonResult,
            element: element
          }
          resolve(resultObject);
          return resultObject;
        } else {
          console.log("rejected at readystate = " + xmlHttp.readyState);
          //reject("REJECT");
        }
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous
      xmlHttp.send();

    })
  }


  //(GENBRUG) Hent ID fra neo4j til den samme tekstfelt-opmærkning som netop er oprettet
  function SetBoxId(resultObject) {
    console.log(resultObject.element);
    $(resultObject.element).attr("id", resultObject.node.id)
  }

  //(GENBRUG) Send indhold til neo4j om at oprrette en (SPEC)relation fra den forrige (mark)node til den indeværende (spec)node
  function LavEnSpecRel(FraMarkNodensID, TilSpecNode) {
    //HER SKAL VÆRE ET APIKALD SOM OPRETTER EN RELATION AF TYPEN SPEC
    //    `MATCH (n) WHERE (n:MARK) AND ID(n)=${FraMarkNodensID} MATCH (l:${TilSpecNode.SpecNodensLabels[0]} {creationTime:${TilSpecNode
    //.SpecNodensCreationTime},name:"${TilSpecNode.SpecNodensName}"}) CREATE (n)-[r:SPEC]->(l)`
  }

  //Send grundnode afsted
  SendGrundNode() //Funktionskald indeni anden funktion. Skal dette være et return?

  //Byg en associations-relation fra Associationsnoden til alle de noder (SPEC/ROD) med samme indhold
  function LavEnAssRel(ASSNoden, NoderMedSammeIndhold) {
    for (let Noder = 0; Noder < NoderMedSammeIndhold.length; Noder++) {
      const NodeAtLaveRelationTil = NoderMedSammeIndhold[Noder];
    };
  }


  //Lav en Associationsnode
  function LavEnAssNode(CurrentMARKNode, NoderMedSammeIndhold, FraNoden) {
    //HER SKAL VÆRE ET APIKALD SOM OPRETTER EN NODE AF TYPEN ASS
    //  "MERGE (n:ASS {name:CurrentMARKNode.MarkNodensName}) SET n.creationTime = timestamp() RETURN n.creationTime, n.name, ID(n), labels(n)", {
    console.log("der er lavet en association til ASSNoden " + "%c" +
      ASSNoden.ASSNodensID, "color:purple;")
    //Lav ASS-rel til relevante noder
    LavEnAssRel(ASSNoden, NoderMedSammeIndhold) //Funktionskald - skulle det have været et return?
    LavEnOutputboks(FraNoden, NoderMedSammeIndhold, ASSNoden) //Funktionskald - skulle det have været et return?
  };

  //Marker tekst i tekstfeltet
  function SelectTextFromWindow(event) {
    var selectedText = '';
    var NodeWhichIsSelected = event.target;
    if (!window.x) {
      console.log("Objekt til at gemme markering i laves")
      x = {};
    }
    x.Selector = {};
    x.Selector.getSelected = function() {

      if (window.getSelection) {
        selectedText = window.getSelection();
      }

      return selectedText;
    }
    //udfør kun hvis der ER markeret noget OG der ikke blot er markeret mellemrum eller et punktum
    if ((x.Selector.getSelected().toString().trim() != '') && (x.Selector.getSelected().toString() !=
        '.')) {


      //Udvid det valgte indtil næste whitespace/mellemrum eller specialtegn
      //!!!!!!!!!!!!!!!!!IMPLEMENTER FØRST NÅR SNAPSELECTION KUN KØRES HVIS DET ORD MAN MARKERER KUN HAR ÉT TEGN FORAN ELLER BAGVED INDEN WHITESPACE
      // snapSelectionToWord(selectedText)

      //Send indholdet, hvis man har glemt at trykke ENTER
      LavEnMarkNode(selectedText, NodeWhichIsSelected) //Funktionskald indeni anden funktion. Skal dette være et return?
    };
  }

  function snapSelectionToWord(selectedText) { //Denne funktion skal forlænge markeringer til nærmeste whitespace hvis der er under 2 characters tilbare af ordet
    var sel;

    // Check for existence of window.getSelection() and that it has a
    // modify() method. IE 9 has both selection APIs but no modify() method.
    if (selectedText && (sel = window.getSelection()).modify) {
      sel = selectedText;
      if (!sel.isCollapsed) {

        // Detect if selection is backwards
        var range = document.createRange();
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);
        var backwards = range.collapsed;
        range.detach();

        // modify() works on the focus of the selection
        var endNode = sel.focusNode,
          endOffset = sel.focusOffset;
        sel.collapse(sel.anchorNode, sel.anchorOffset);
        if (backwards) {
          sel.modify("move", "backward", "character");
          sel.modify("move", "forward", "word");
          sel.extend(endNode, endOffset);
          sel.modify("extend", "forward", "character");
          sel.modify("extend", "backward", "word");

        } else {
          sel.modify("move", "forward", "character");
          sel.modify("move", "backward", "word");
          sel.extend(endNode, endOffset);
          sel.modify("extend", "backward", "character");
          sel.modify("extend", "forward", "word");
        }
      }
    } else if ((sel = document.selection) && sel.type != "Control") {
      var textRange = sel.createRange();
      if (textRange.text) {
        textRange.expand("word");
        // Move the end back to not include the word's trailing space(s),
        // if necessary
        while (/\s$/.test(textRange.text)) {
          textRange.moveEnd("character", -1);
        }
        textRange.select();
      }
    }
  }


  //Opret gule mark-opmærkninger
  // OG
  //Hent ID fra neo4j til den samme mark-opmærkning som netop er oprettet
  function SurroundSelectedTextWithMarkTag(resultObject) {
    //marknodens ID - egenskab fra objekt
    console.table([resultObject.node]);
    var selection = x.Selector.getSelected();
    var selection = selection.getRangeAt(0)
    var newMarkElement = document.createElement("mark");
    resultObject.element = newMarkElement;
    selection.surroundContents(newMarkElement)
    console.log("markering på: " + selection.toString());
    return resultObject;
  }


  //Fjerner mark-tag fra uddybning, så man kan lave en overlappende markering
  //(det er en hack. Jeg vil foretrække at man kan markere flere gange oveni hinanden)
  function FjernMarkTag(DenNodeMarkSkalFjernesFra) {
    console.log("Der tjekkes om noden i forvejen har mark-tag")
    console.log(DenNodeMarkSkalFjernesFra.currentTarget.childElementCount)
    if (DenNodeMarkSkalFjernesFra.currentTarget.childElementCount > 0) {
      let marktag = document.getElementById(DenNodeMarkSkalFjernesFra.target.id)
        .getElementsByTagName(
          'mark');
      while (marktag.length) {
        let parent = marktag[0].parentNode;
        while (marktag[0].firstChild) {
          parent.insertBefore(marktag[0].firstChild, marktag[0]);
        }
        parent.removeChild(marktag[0]);
        console.log("der er fjernet mark-tag i p-tag")
      }
    } else {
      console.log("Der er ingen mark-tag i denne node")
    }
  }



  $('body').on("mouseup", ".greenbox", function(e) {
    //Vælg det markerede tekst ved mouseup
    SelectTextFromWindow(e) //Funktionskald indeni anden funktion. Skal dette være et return?
    //slet eventuelle greenbox'e som ikke er blevet udfyldt

    //!!!!!!!!!!OMKRANS MED BETINGELSE DER TJEKKER FOR OM DER OVERHOVEDET ER CHILDNODES
    if (e.currentTarget.nextElementSibling != null && e.currentTarget.nextElementSibling.childNodes[1].innerHTML == "") {
      e.currentTarget.nextElementSibling.remove()
      console.log("tom greenbox fjernet")
    }



    console.log("der er mouseup i .greenbox")
  })


  //Opret en taleboblehale der går fra uddybningstekstfeltet til den mark-opmærkningen som udløste (uddybnings)tekstfeltet

  function LavEnTaleboblePil(ParentNode, NytPTag, FraNoden, MarknodenDenKommerFra) {
    //Lav en omgivende ramme
    var svgramme = document.createElement('div');
    //Definér det der skal indsættes
    var svghtml = "<svg><polyline id='pilTilMark" + MarknodenDenKommerFra.MarkNodensID +
      "' class='pil' points=''/></svg>"
    //indsæt element i omgivende ramme
    svgramme.innerHTML = svghtml;
    //indsæt p-elementet fra LavEnUddybningsboks til denne svg
    svgramme.appendChild(NytPTag);

    //Hvis markering foregår i redbox
    if (ParentNode.parentElement == $("p.redbox")) {
      console.log("Uddybningsboks udspringer fra grundnode")
      document.getElementsByClassName("greenbox").append(svgramme)
    } else {
      $(svgramme).insertAfter(ParentNode);
    }

    //Find markeringens x og y-koordinater
    var markering = document.getElementById(MarknodenDenKommerFra.MarkNodensID)
      .getBoundingClientRect()
    //Find uddybningsfeltets x og y-koordinator
    var uddybning = NytPTag.getBoundingClientRect()
    var pil = document.getElementById("pilTilMark" + MarknodenDenKommerFra.MarkNodensID);
    var placeringAfPileBen1 = parseInt(uddybning.width / 4) + "," + parseInt(
      21) //Først sæt: x,y for tekstboks overkant
    var placeringAfPileSpids = parseInt(markering.x + (markering.width / 2)) + "," + parseInt(-
      20) //Andet sæt: x,y for mark-tag
    var placeringAfPileBen2 = parseInt(uddybning.width / 3) + "," + parseInt(
      21) //Tredje sæt: x,y for tekstboks overkant
    //Placering af taleboblepilens to ben og spids
    pil.setAttributeNS(null, "points", placeringAfPileBen1 + " " + placeringAfPileSpids + " " +
      placeringAfPileBen2);
    console.log("Taleboblens pil har følgende koordinater:")
    console.log(pil.getAttributeNS(null, "points"))

  }
  //




  //Ændr et (spec)tekstfelt til et (grundnode)tekstfelt, hvis alt indholdet i et tekstfelt (være spec- eller grund-) slettes ved Delete eller backspace (ikke ved at markere det hele, for det opretter en mark-opmærkning)
  //
  //IKKE LAVET ENDNU
  //
  //(GENBRUG) Send indhold til neo4j om at oprette en grundnode
  //
  //IKKE LAVET ENDNU
  //





});
