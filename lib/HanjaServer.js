var GraphStructure = require('./GraphStructure.js'),
    QueryProcessor = require('./QueryProcessor.js');


function HanjaServer(settings){
    this._gs = new GraphStructure(settings.graphFile);
    this._qp = new QueryProcessor({GraphStructure: this._gs});    
};

HanjaServer.prototype.handleQuery = function(request,response){
    var query = {};
    query.string = request.query.query;
    console.log("Query string is \""+query.string+"\"");
    query.response = response;
    response.writeHeader(200,{"Content-Type": "text/html; charset=utf-8"});
    this._qp.runQuery(query);
    response.end();
};

module.exports = HanjaServer;
