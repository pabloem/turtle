var hr = new HanjaReqs();
var he = new HanjaExplorer(hr);
/*$(function() {
    $("#dialog").dialog({width: 600,
                         modal: true});
});*/

$(function(){ 
    var t = null;
    $("#q").keyup(function(){ 
        if (t) { 
            clearTimeout(t); 
        } 
        t = setTimeout("livesearch()", 400); 
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
}
function setRootsClickEvent() {
    $("#det_main span").on('click', function() {
        var root = $(this).text();
        $("#q").val(root);
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
            he.showNode($(this).data(),false);
            he.fixLayout();
        });
    }
};

/* Works! TODO - remove comment*/
function livesearch(){
    var q = $("#q").val().toLowerCase(); 
    if (q.length == 0) { 
        //$("#results").html("");
    } else { 
        hr.searchRequest(q,searchQueryResult);
    }
};
hr.searchRequest('life',searchQueryResult);
