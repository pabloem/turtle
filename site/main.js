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
});

function fillInDetails(node) {
    var cont = "<li id='header_det'>Details of "+node.of+"</li>"+
            "<li id='note_det'>"+node.instruction+"</li>"+
            "<li id='space_det'></li>"+
            "<li id='main_det'></li>"+
            "<li id='secondary_det'>"+node.secondary+"</li>"+
            "<li id='tertiary_det'>"+node.tertiary+"</li>";
    $("#dlist").html(cont);
    $("#main_det").html(node.main);
}
function setRootsClickEvent() {
    $("#roots li").on('click', function() {
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
                   var cont = "<p id=\"p_ck\"><b>"+
                           this.chinese+"</b>&emsp;  " +
                           this.korean+"</p><p id=\"p_en\">"+
                           this.english +"</p>";
                   i++;
                   var litype = i%2 == 0 ? "li_odd" : "li_even";
                   $("#results").append(
                       $('<li>')
                           .attr('id',litype)
                           .data(this)
                           .append(cont));
               });
        $('#results li').on('click',function(){
            var nod = $(this).data();
            he.showNode($(this).data(),false);
        });
    }
};

function livesearch(){
    var q = $("#q").val().toLowerCase(); 
    if (q.length == 0) { 
        $("#results").html("");
    } else { 
        hr.searchRequest(q,searchQueryResult);
    }
};
