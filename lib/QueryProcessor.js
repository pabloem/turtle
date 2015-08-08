var NO_ERRORS = 0,
    NO_STRING_QUERY= 1,
    UNKNOWN_QUERY_TYPE= 2,
    NO_QUERY_TERMS= 3;
var NODE_QUERY = 0,
    SEARCH_QUERY = 1,
    ROOT_QUERY = 2;

function QueryProcessor(settings) {
    this._stages = [this._parseQuery.bind(this), 
                    this._processQuery.bind(this), 
                    this._outputQuery.bind(this)];
    this._langs = ['chinese','korean','english'];
    this._regexps = {
        'chinese':new RegExp("[\u4E00-\u9FFF|\u2FF0-\u2FFF|\u31C0-\u31EF|\u3200-\u9FBF|\uF900-\uFAFF]"),
        'korean' :new RegExp("[\u1100-\u11FF|\u3130-\u318F|\uA960-\uA97F|\uAC00-\uD7AF|\uD7B0-\uD7FF]"),
        'english':{test:function(){return true;}}};
    this._gs = settings.GraphStructure;
};

QueryProcessor.prototype.runQuery = function(query) {
    if(!this._gs) {
        console.log("No graph structure provided. Can't run queries.");
    }
    query.error = 0;
    for(var i = 0; i < this._stages.length; i++) {
        this._stages[i](query);
        if(query.error != NO_ERRORS) {
            console.log("Error found on stage #" +i+
                        " | Error code: "+query.error);
            return;
        }
    }
};

/* _parseQuery(query)
 Function to parse a string query and convert it into data for the query
 object, to be processed later on.
 Inputs
 * query - The query object. To this object we append all information
           about the query. The _parseQuery function requires the
           query.string field to be filled in properly.
 Outputs
 * The results of the _parseQuery call are contained in the query
   object. If there was an error, the query.error element will be
   non-zero. Otherwise, the query.type element, and the query.terms
   element will be filled in.
 */
QueryProcessor.prototype._parseQuery = function(query) {
    console.log("Parsing...");
    if(!query || !query.string) {
        query.error = NO_STRING_QUERY;
        return;
    }
    var stringQuery = query.string;
    var splits = stringQuery.split(" ");

    // Setting query type...
    if(splits[0] == "node") {
        query.type = NODE_QUERY;
    } else if(splits[0] == "search") {
        query.type = SEARCH_QUERY;
    } else if(splits[0] == "root") {
        query.type = ROOT_QUERY;
    } else {
        query.error = UNKNOWN_QUERY_TYPE;
        return;
    }
    console.log("Query type: "+splits[0]);

    // Obtain the terms in the query
    query.terms = [];
    for(i = 1; i < splits.length; i++) {
        if(splits[i].length == 0) {
            continue;
        }
        query.terms.push(splits[i]);
    }
    if(query.terms.length == 0) {
        query.error = NO_QUERY_TERMS;
        return;
    }
    console.log("Obtained query terms: ");
    //    console.log(query.terms);
    // Return succesfully
    return;
};
QueryProcessor.prototype._processNodeQuery = function(query) {
    var res = [];
    for(var i=0; i < query.terms.length; i++){
        res.push(this._gs.getNode(query.terms[i],true));
    }
    query.res = res;
    return;
};
QueryProcessor.prototype._processSearchQuery = function(query) {
    query.res = [];
    for(var i=0; i < query.terms.length; i++){
        this._searchTerm(query,query.terms[i]);
    }
    return;
};
QueryProcessor.prototype._processRootQuery = function(query) {
    var res = [];
    if(query.terms.length < 1) {
        query.error = NO_QUERY_TERMS;
    }
    res.push(this._gs.getRoot(query.terms[0]));
    query.res = res;
    return;
};
QueryProcessor.prototype._processQuery = function(query) {
    console.log("Processing...");
    console.log("Query type: "+query.type);
    if(query.type == NODE_QUERY) this._processNodeQuery(query);
    else if(query.type == SEARCH_QUERY) this._processSearchQuery(query);
    else if(query.type == ROOT_QUERY) this._processRootQuery(query);
    return ;
};
QueryProcessor.prototype._searchTerm = function(query,term){
    var testChar = term[0];
    for(var j = 0; j < this._langs.length; j++) {
        if(this._regexps[this._langs[j]].test(testChar)) {
            console.log("Term "+term+" is "+this._langs[j]);
            this._searchLangTerm(query,term,this._langs[j]);
            break;
        }
    }
};
QueryProcessor.prototype._searchLangTerm = function(query,term,lang) {
    var idx = this._gs._graph.index[lang];
    if(!idx) {
        console.log("WARNING - Index of lang "+lang+" was not found.");
        return;
    }
    var node_ids;
    if(lang == 'english') {
        node_ids = idx.searchNodesBy(term);
        if(!node_ids) return;
    } else { // Language is Korean or Chinese
        var strs = term.split("");
        for(var j = 0; j < strs.length; j++) {
            var temp_ids = idx.searchNodesBy(strs[j]);
            if(!node_ids) node_ids = temp_ids.slice(0);
            else node_ids = this._matchIds(node_ids,temp_ids);
        }
    }
    for(var k = 0; k<node_ids.length; k++) {
        // Getting full node no matter what.
        // Might want to change this later
        query.res.push(this._gs.getNode(node_ids[k],true));
    }
    return ;
};
QueryProcessor.prototype._matchIds = function(main,match) {
    var res = [];
    var cnt_m = 0, cnt_mtch = 0;
    while(cnt_m < main.length && cnt_mtch < match.length) {
        if(main[cnt_m] == match[cnt_mtch]) {
            res.push(main[cnt_m]);
            cnt_mtch++; cnt_m++; // Increment both
            continue;
        }
        if(main[cnt_m] > match[cnt_mtch]){
            cnt_mtch++;
            continue;
        }
        if(main[cnt_m] < match[cnt_mtch]) {
            cnt_m++;
            continue;
        }
    }
    return res;
};
QueryProcessor.prototype._outputQuery = function(query) {
    console.log("Outputing...");
    //    console.log(query.res);
    var resp = query.response;
    resp.write(JSON.stringify(query.res));
};

module.exports = QueryProcessor;
