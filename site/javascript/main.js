var hr = new HanjaReqs();
var he = new HanjaExplorer(hr);

$(function(){ 
    var t = null;
    $("#q").keyup(function(){ 
        if (t) { 
            clearTimeout(t); 
        } 
        t = setTimeout("livesearch()", 400); 
    });
    $(document).ready(function() {
        $(window).keydown(function(event){
            if(event.keyCode == 13) {
                event.preventDefault();
                livesearch();
                return false;
            }
        });
    });
});

function fillInDetails(node) {
    var hanjas = node.main,
        res = "";
    for(var i = 0; i < hanjas.length; i++) {
        res += "<span class=\"infobox-chinese-char\">"+hanjas[i]+"</span>";
    }
    $("#det_main").html(res);
    $("#det_secondary").html(node.secondary);
    $("#det_tertiary").html(node.tertiary);
    setRootsClickEvent();
}
function setRootsClickEvent() {
    $("#det_main span").on('click', function() {
        var root = $(this).text();
        he.displayRoot(root);
    });
}

function searchQueryResult() {
    console.log(hr.req.status);
    if(hr.req.readyState == 4 && hr.req.status == 200) {
        var res = eval(hr.req.responseText);
        $("#results").html("");
        var i = 0;
        $.each(res, 
               function() {
                   var cont =
                           "<div class=\"word-list-item pure-g\">"+
                           "<div class=\"pure-u-1-2 word-list-korean\">"+this.korean+"</div>"+
                           "<div class=\"pure-u-1-2 word-list-chinese\">"+this.chinese+"</div>"+
                           "<div class=\"pure-u-1 word-list-english\">"+this.english+"</div>"+
                           "</div>";
                   $("#results").append($(cont).data(this));
               });
        $('.word-list-item').on('click',function(){
            var nod = $(this).data();
            he._apTrack.clickListAction($(this).data().id,he._details);
            he.showNode($(this).data(),false);
            he.fixLayout();
        });
    }
};

function clickBackButton() {
    he.clickBackButton();
};

function searchBoxValue(input) {
    if(input === undefined) {
        return $("#q").val().toLowerCase();
    }
    $("#q").val(input);
}

function livesearch(){
    var q = $("#q").val().toLowerCase();
    if (q.length == 0) { 
    } else { 
        hr.searchRequest(q,searchQueryResult);
    }
};

function parse(val) {
  console.log("Parsing...");
    var result,
        tmp = [];
  location.search
    //.replace ( "?", "" )
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      console.log(tmp);
      if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
    });
  return result;
}
// Regexp for chinese stuff!
var chRegexp = new RegExp("[\u4E00-\u9FFF|\u2FF0-\u2FFF|\u31C0-\u31EF|\u3200-\u9FBF|\uF900-\uFAFF]");

var query = parse('q');
if(query === undefined || query == "") query = "life";

if(chRegexp.test(query) && query.length == 1) {
  console.log("Displaying root of query!");
  he.displayRoot(query);
}

hr.searchRequest(query,searchQueryResult);
searchBoxValue(query);
