var hr = new HanjaReqs();
var he = new HanjaExplorer(hr);

$("#resTitle").hide();
$("#about").hide();
$("#dialog").hide();
function showDialog(id) {
    $('#'+id).dialog({width: 600,
                         modal: true});
}
$(showDialog('dialog'));
$(function(){ 
    var t = null;
    $("#PrincipalSerch").keyup(function(){ 
        if (t) { 
            clearTimeout(t); 
        } 
        t = setTimeout("livesearch()", 400); 
    }); 
});

function fillInDetails(node) {
    var cont = "<h5 id='header_det'>Details of "+node.of+"</h5>"+
            "<p id='note_det'>"+node.instruction+"</p>"+
            "<p id='space_det'></li>"+
            "<p id='main_det'></li>"+
            "<p id='secondary_det'>"+node.secondary+"</p>"+
            "<p id='tertiary_det'>"+node.tertiary+"</p>";
    $("#dlist").html(cont);
    $("#main_det").html(node.main);
}
function setRootsClickEvent() {
    $("#roots a").on('click', function() {
        var root = $(this).text();
        $("#PrincipalSerch").val(root);
        he.displayRoot(root);
    });
}

function searchQueryResult() {
    console.log(hr.req.status);
    if(hr.req.readyState == 4 && hr.req.status == 200) {
        var res = eval(hr.req.responseText);
        $("#results").html("");
        $("#resTitle").show();
        var i = 0;
        $.each(res, 
               function() {
                   var cont = "<b>" +
                           this.chinese + "&emsp; " +
                           this.korean + "</b><br>" +
                           this.english +"";
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

/* Works! TODO - remove comment*/
function livesearch(){
    var q = $("#PrincipalSerch").val().toLowerCase(); 
    if (q.length == 0) { 
        //$("#results").html("");
    } else { 
        hr.searchRequest(q,searchQueryResult);
    }
};
