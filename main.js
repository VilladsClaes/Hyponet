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
    CreateRedBox(e)

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
  function CreateRedBox(e) {

    let redBox = document.createElement("p");
    $(redBox).attr("contenteditable", "true");
    $(redBox).addClass("redbox")

    //Hvis der ikke findes nogen redboxes allerede (fordi alt i dommen er slettet)
    if (document.getElementsByClassName("redbox")[0] = undefined) {
      //console.log("der er ingen redboxes i vindues")
      let newConversation = document.createElement("div");
      newConversation.attr("id", "conversation");
      newConversation.attr("class", "container-fluid");
      document.getElementById("NyGrundNodeKnap").append(newConversation)
    }
    else if ($("p.redbox").innerText != "" && e.currentTarget.id != "NyGrundNodeKnap")
    {
      $(redBox).insertBefore(e.currentTarget);
      SendGrundNode()
    }
    else if (e.currentTarget.id == "NyGrundNodeKnap")
    {
      $("#conversation").prepend(redBox);
      SendGrundNode()
    }
  }

  function CreateGreenBox(domElement, resultObject)
  {
    var greenBox = document.createElement("p");
    $(greenBox).attr("contenteditable", "true");
    $(greenBox).addClass("greenbox");
    //console.log("Uddybningsboks udspringer fra " + "%c" + resultObject.node.name, "color:#f8ca48;");
        var parentElement = document.getElementById(domElement.id);
    DrawSpeechBubble(parentElement, greenBox, resultObject);
    SendSpecNode(resultObject);
  }

  //Opret en taleboblehale der går fra uddybningstekstfeltet til den mark-opmærkningen som udløste (uddybnings)tekstfeltet
  function DrawSpeechBubble(domElement, greenBox, resultObject)
  {
            //Lav en omgivende ramme
        var svgFrame = document.createElement('div');
        //Definér det der skal indsættes
        var svgHtml = "<svg><polyline id='pilTilMark" + resultObject.node.id +
            "' class='pil' points=''/> <polyline id='bundTilPil" + resultObject.node.id +
            "' class='pil' points=''/> </svg>";

        //indsæt element i omgivende ramme
        svgFrame.innerHTML = svgHtml;
        //indsæt p-elementet fra LavEnUddybningsboks til denne svg
        svgFrame.appendChild(greenBox);

        //Hvis markering foregår i redbox
        if (domElement.parentElement == $("p.redbox"))
        {
            console.log("Uddybningsboks udspringer fra grundnode");
            document.getElementsByClassName("greenbox").append(svgFrame);
        }
        else
        {
            $(svgFrame).insertAfter(domElement);
        }

        //Find markeringens x og y-koordinater
        var selection = document.getElementById(resultObject.node.id).getBoundingClientRect();
        //Find uddybningsfeltets x og y-koordinator
        var specification = greenBox.getBoundingClientRect();
        var arrow = document.getElementById("pilTilMark" + resultObject.node.id);
        var bottomArrow = document.getElementById("bundTilPil" + resultObject.node.id);
        var coordinatesArrowLeft = parseInt(specification.width / 4) + "," + parseInt(21); //Først sæt: x,y for tekstboks overkant
        var coordinatesOfArrowTip = parseInt(selection.x + (selection.width / 2)) + "," + parseInt(-20); //Andet sæt: x,y for mark-tag
        var coordinatesArrowRight = parseInt(specification.width / 3) + "," + parseInt(21); //Tredje sæt: x,y for tekstboks overkant
        //var coordsBottom = 
        //var lengthSideBottom = Math.sqrt((Math.pow(parseInt(specification.width / 4), 2) - Math.pow(parseInt(specification.width / 3)), 2)) + (Math.pow(parseInt(21), 2) - Math.pow(parseInt(21), 2));
        //Placering af taleboblepilens to ben og spids
        arrow.setAttributeNS(null, "points", coordinatesArrowLeft+" "+coordinatesOfArrowTip+" "+coordinatesArrowRight+" "+coordinatesArrowLeft);
        var coordinatesBottomRight = parseInt((specification.width - 1.5) / 3) + "," + parseInt(21);
        bottomArrow.setAttributeNS(null, "points", coordinatesArrowLeft + " " + coordinatesBottomRight);
        bottomArrow.setAttributeNS(null, "style", "stroke:#90ee90;stroke-width:1.5;stroke-linecap:round");
        console.log("Taleboblens pil har følgende koordinater:");
        console.log(arrow.getAttributeNS(null, "points"));
  }

  //Opret et tekstfelt til til output af associationer (som er en ASSNODE)
  function CreateOutputBox(FraNoden, NoderMedSammeIndhold, ASSNoden) {
    //Outputboks ÅBNES
    var NytPTag = document.createElement("p");
    $(NytPTag).attr("id", ASSNoden.ASSNodensID);
    $(NytPTag).attr("class", "purpleparagraf");
    $(NytPTag).attr("contenteditable", "true");
    //Det er her magien skal ske. Mange algoritmer skal afgøre hvad der skal stå her i dette outputfelt
    NytPTag.innerText = NoderMedSammeIndhold[0].MATCHENDENodensName;
    console.log("nu bliver der lavet en associationsboks");

    var ParentNode = document.getElementById(FraNoden.id);

    if (ParentNode.parentElement == $("p.redbox")) {
      console.log("output udspringer fra" + "c% grundnode", "color:red;");

      var nyOutputBoks = document.createElement("div");
      $(nyOutputBoks).attr("class", "purpleboks");
      nyOutputBoks.append(NytPTag);
    } else {
      $(NytPTag).insertAfter(ParentNode.parentElement.lastElementChild);
      console.log("Output placeret efter")
      console.log(ParentNode)
    }
  }

    function SendGrundNode()
    {
      var kunDenEneGang = true;
      $("p.redbox").keypress(async function (e)
      {
              //submit ved ENTER
              if (e.which == 13 && kunDenEneGang && e.currentTarget.id == "")
              {
                console.log("ENTER i redbox")
                kunDenEneGang = false;
                e.preventDefault();
                await RootNodeCreation(e);
              }
              else if (e.which == 13 && kunDenEneGang == false)
              {
                kunDenEneGang = true;
                e.preventDefault()
                CreateRedBox(e)
                console.log("ENTER trykket igen i redbox")
              }
      });

          //Når man klikker i grundnodeboksen skal eksempelteksten ryddes
          $("p.redbox").mousedown(async function (e)
          {
            //fjern placeholderteksten
            if ($("p.redbox").text() === "Skriv noget her")
            {
                $("p.redbox").text("")
                //console.log("Placeholder Fjernet ")
            }
            else if ($("p.redbox").text() === "Skriv noget nyt...")
            {
              $("p.redbox").text("")
              //console.log("Placeholder Fjernet igen")
            }

              //Fjern eventuelle mark-elementer i dette p-element
              FjernMarkTag(e);

              //Hvis man glemmer at trykke ENTER og laver mousedown igen, sendes teksten til neo4j = GRUNDNODE OPRETTES VED MUSEKLIK
              if (e.currentTarget.innerText != "" && kunDenEneGang && e.currentTarget.id == "")
              {
                //console.log("Da der ikke blev trykket ENTER i .redbox, sendes indholdet til databasen")
                await RootNodeCreation(e);

              }
          });
    };

  $('body').on("mouseup", "p.redbox", function (e) {
    //Vælg det markerede tekst ved mouseup
    SelectTextFromWindow(e);
    console.log("der er mouseup i .redbox")

    if (e.currentTarget.nextElementSibling != null && e.currentTarget.nextElementSibling.childNodes[1].innerHTML == "") {
      e.currentTarget.nextElementSibling.remove()
      console.log("tom greenbox fjernet")
    }

  })

      // markNodeOrigin er den marknode som specnoden kommer fra
  function SendSpecNode(MARKOrigin) {

    //Hvis man bruger ENTER eller museklik i et grønt felt som IKKE er tomt, så skal den sende til databasen
    var kunDenEneGang = true;
      $(".greenbox").keypress(async function (e)
      {
          if (e.which == 13 && kunDenEneGang && e.currentTarget.id == "")
          {
            //console.log("ENTER i .greenbox")
            e.preventDefault();
            var resultObject = await SpecNodeCreation(e, MARKOrigin);
            AssNodeCreation(resultObject, MARKOrigin);
            e.currentTarget.removeAttribute("contenteditable")
            kunDenEneGang = false;
           }
      });

      $("body").on("mousedown", ".greenbox", async function (e)
      {
         FjernMarkTag(e);
          if (e.currentTarget.innerText != "" && kunDenEneGang && e.currentTarget.id == "")
          {
            //console.log("Da der ikke blev trykket ENTER i .greenbox, sendes indholdet til databasen")
            var resultObject = await SpecNodeCreation(e, MARKOrigin)
            AssNodeCreation(resultObject, MARKOrigin);
            e.currentTarget.removeAttribute("contenteditable");
            kunDenEneGang = false;
          }
      });
  }

  async function RootNodeCreation(e)
    {
      var rootNodeResult = await CreateRootNode(e);
      SetBoxId(rootNodeResult);
    }

  //Send indhold til neo4j om at oprette en grundnode
  async function CreateRootNode(e)
  {
        var nodeType = "ROOT";
        var apiEndpointUrl = "https://localhost:44380/Node/Create/" + e.target.innerText + "/" + nodeType;
        var nodeResult = await httpGetAsync(apiEndpointUrl, e.currentTarget);
        return nodeResult;
  };

      
  async function MarkNodeCreation(selectedText, domElement) {       

    var selOffsets = getSelectionCharacterOffsetWithin(domElement)
    var start = selOffsets.start;
    var end = selOffsets.end;
    console.log("Markering fra bogstav: " + start + " til bogstav " + end);

    //Resultobject indeholder: element og node
    var resultObject = await CreateMarkNode(selectedText, domElement);
    var selectionObject = SurroundSelectedTextWithMarkTag(resultObject);

    SetBoxId(selectionObject);
    //domelement er boksen den er lavet i, ROOT eller SPEC. 
    //selectionobject er markeringen
    await CreateRelation(domElement.id, selectionObject.node.id, "Mark");

    await MergeMarkNodes(selectedText, domElement, start, end);
    //await MergeMarkNodes(selectionObject.node.name, selectionObject.node.id, start, end);

    CreateGreenBox(domElement, selectionObject);
  }


    //Send indhold til neo4j om at oprette en marknode
    async function CreateMarkNode(selectedText, domElement) {
     

        var nodeType = "MARK";

        var selOffsets = getSelectionCharacterOffsetWithin(domElement)
        var start = selOffsets.start;
        var end = selOffsets.end;
      


   
        var apiEndpointUrl = "https://localhost:44380/Node/Create/" + $.trim(selectedText) + "/" + nodeType + "/" + start + "/" + end;
        var nodeResult = await httpGetAsync(apiEndpointUrl, domElement);

     

    return nodeResult;
  }

    async function MergeMarkNodes(selectedText, domElement, selectionStart, selectionEnd)
    {
      var nodeType = "MARK";
      var apiEndpointUrl = "https://localhost:44380/Node/MergeMarkNodes/" + $.trim(selectedText) + "/" + nodeType + "/" + selectionStart + "/" + selectionEnd + "/" + domElement.id;
      var nodeResult = await httpGetAsync(apiEndpointUrl, domElement);
      return nodeResult;
    }


    async function SpecNodeCreation(e, markNodeOrigin)
    {
        var resultObject = await CreateSpecNode(e.currentTarget);
        SetBoxId(resultObject);
        await CreateRelation(markNodeOrigin.node.id, resultObject.node.id, "Spec");
        return resultObject;
    }

    //Send indhold til neo4j om at oprette en Spec-node
    async function CreateSpecNode(greenBoxElement)
    {
        var nodeType = "SPEC";
        var apiEndpointUrl = "https://localhost:44380/Node/Create/" + $.trim(greenBoxElement.innerText) + "/" + nodeType;
        var nodeResult = await httpGetAsync(apiEndpointUrl, greenBoxElement);
        return nodeResult;
    }


    async function AssNodeCreation(fromResultObject, markResultObject)
    {
        var resultObject = await CreateAssNode(fromResultObject.element, markResultObject.element.innerText);
        CreateRelation(fromResultObject.node.id, resultObject.node.id, "Ass");

        // CreateRelation(resultObject.node, nodeToRelateTo);
        /* 
           for (let nodeIndex = 0; nodeIndex < NoderMedSammeIndhold.length; nodeIndex++) 
           {
               const nodeToRelateTo = NoderMedSammeIndhold[nodeIndex];
               CreateRelation(resultObject.node, nodeToRelateTo)
           };
         */

        //CreateOutputBox(FraNoden, NoderMedSammeIndhold, ASSNoden)
    }

  //Lav en Associationsnode
  async function CreateAssNode(fromElement, selectedText)
  {
    var nodeType = "ASS";
    var apiEndpointUrl = "https://localhost:44380/Node/Create/" + $.trim(selectedText) + "/" + nodeType;
    var nodeResult = await httpGetAsync(apiEndpointUrl, fromElement)
    console.log("der er lavet en ASS-node " + "%c" + nodeResult.node.id, "color:purple;")
    return nodeResult;
  };

  async function FindNodesToAssTo(fromNode)
  {
    var apiEndPointUrl = "https://localhost:44380/Association/GetNodesToRelateTo/" + fromNode.id
  }

  async function CreateRelation(fromNodeId, toNodeId, relationType)
  {
      var apiEndpointUrl = "https://localhost:44380/Relation/Create/" + fromNodeId + "/" + toNodeId + "/" + relationType;
      var nodeResult = await httpGetAsync(apiEndpointUrl);
      return nodeResult;    
  }


  //Hent ID fra neo4j til den samme tekstfelt som netop er oprettet i UI
  function SetBoxId(resultObject)
  {
    //console.log(resultObject.element);
    $(resultObject.element).attr("id", resultObject.node.id)
  }


  //Åbner ajax-api-xmlhttprequest-xhr
  function httpGetAsync(theUrl, htmlElement)
  {
      return new Promise(function (resolve, reject)
      {
        var xmlHttp = new XMLHttpRequest();
        var element = htmlElement;
          xmlHttp.onreadystatechange = async function ()
          {
              if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              {
                console.log("readystate = 4: " + xmlHttp.responseText);
                 var jsonResult = await JSON.parse(xmlHttp.responseText);
                 var resultObject = {node: jsonResult,element: element}
                 resolve(resultObject);
                 return resultObject;
              }
              else
              {
                console.log("rejected at readystate = " + xmlHttp.readyState);
                //reject("REJECT");
              }
          }
          xmlHttp.open("GET", theUrl, true); // true for asynchronous
          xmlHttp.send();

      })
  }

  
  //Send grundnode afsted
  SendGrundNode()


    //Få start- og slutplacering af markering uanset om der er anden html-opmærkning i feltet
    function getSelectionCharacterOffsetWithin(element) {
        var start = 0;
        var end = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;

        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.startContainer, range.startOffset);
                start = preCaretRange.toString().length;
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                end = preCaretRange.toString().length;
            }
        }
        else if ((sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToStart", textRange);
            start = preCaretTextRange.text.length;
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            end = preCaretTextRange.text.length;
        }
        return { start: start, end: end };

    }



  //Marker tekst i tekstfeltet
  function SelectTextFromWindow(event)
  {
    var selectedText = window.getSelection();
    var domElement = event.target;


    //udfør kun hvis der ER markeret noget OG der ikke blot er markeret mellemrum eller et punktum
      if ((selectedText.toString().trim() != '') && (selectedText.toString().trim() != ' ') && (selectedText.toString() != '.'))
      {

      //Udvid det valgte indtil næste whitespace/mellemrum eller specialtegn    
       snapSelectionToWord(selectedText)

      //Send indholdet, hvis man har glemt at trykke ENTER
        MarkNodeCreation(selectedText, domElement)
      };
  }

    //Denne funktion skal forlænge markeringer til nærmeste whitespace hvis der er under 1 characters tilbare af ordet
  function snapSelectionToWord(selectedText)
    {
        
        var sel;

        // Check for existence of window.getSelection() and that it has a
        // modify() method. IE 9 has both selection APIs but no modify() method.
        if (selectedText && (sel = window.getSelection()).modify)
        {
          sel = selectedText;
            if (!sel.isCollapsed)
            {

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
                  if (backwards)
                  {
                  sel.modify("move", "backward", "character");
                  sel.modify("move", "forward", "word");
                  sel.extend(endNode, endOffset);
                  sel.modify("extend", "forward", "character");
                  sel.modify("extend", "backward", "word");

                  }
                  else
                  {
                  sel.modify("move", "forward", "character");
                  sel.modify("move", "backward", "word");
                  sel.extend(endNode, endOffset);
                  sel.modify("extend", "backward", "character");
                  sel.modify("extend", "forward", "word");
                  }
            }
        }
        else if ((sel = document.selection) && sel.type != "Control")
        {
          var textRange = sel.createRange();
            if (textRange.text)
            {
                textRange.expand("word");
                // Move the end back to not include the word's trailing space(s),
                // if necessary
                    while (/\s$/.test(textRange.text))
                    {
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
    //console.table([resultObject.node]);

    var selection = window.getSelection();
    var selectionRange = selection.getRangeAt(0);
    var newMarkElement = document.createElement("mark");
    resultObject.element = newMarkElement;
    selectionRange.surroundContents(newMarkElement);
    console.log("markering på: " + selectionRange.toString());
    return resultObject;
  }


  //Fjerner mark-tag fra uddybning, så man kan lave en overlappende markering
  //(det er en hack. Jeg vil foretrække at man kan markere flere gange oveni hinanden)
    function FjernMarkTag(event)
    {


        if (event.currentTarget.childElementCount > 0)
        {
            if (event.target.matches('mark')) {

                let teksten = event.currentTarget.textContent;
                let thismark = event.target;             
                thismark.remove();
                event.currentTarget.innerText = teksten
            }
            else
            {
                let marktag = document.getElementById(event.target.id).getElementsByTagName("mark");
                while (marktag.length)
                {
                    let parent = marktag[0].parentNode;
                    while (marktag[0].firstChild)
                    {
                        parent.insertBefore(marktag[0].firstChild, marktag[0]);
                    }
                    //console.log("Der fjernes " + event.currentTarget.childElementCount + " markeringer i dette felt")

                    parent.removeChild(marktag[0]);

                }
            }
          
           
        }
        else
        {
          //console.log("Der er ingen mark-tag i denne node");
        }

    }




    $('body').on("mouseup", ".greenbox", function (e)
    {
        //Vælg det markerede tekst ved mouseup
        SelectTextFromWindow(e)
        //slet eventuelle greenbox'e som ikke er blevet udfyldt   
        if (e.currentTarget.nextElementSibling != null && e.currentTarget.nextElementSibling.childNodes[1].innerHTML == "")
        {
          e.currentTarget.nextElementSibling.remove();
          //console.log("tom greenbox fjernet");
        }
        console.log("der er mouseup i .greenbox");
    })


 


});