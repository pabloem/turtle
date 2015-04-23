var HanjaReqs = function() {
    this.req = new XMLHttpRequest();
    this._base_url = "/runquery";
};

HanjaReqs.prototype.nodeRequest = function(node_id,nodeQResult) {
    if(Array.isArray(node_id)) {
        node_id = node_id.join(" ");
    }
    this._request("?query=node "+node_id, nodeQResult);
};

HanjaReqs.prototype.fullNodeRequest = function(node_id,fullNodeQRes) {
    if(Array.isArray(node_id)) {
        node_id = node_id.join(" ");
    }
    this._request("?query=node "+node_id, fullNodeQRes);
};

HanjaReqs.prototype.searchRequest = function(search_str,searchQResult) {
    this._request("?query=search "+search_str, searchQResult);
};

HanjaReqs.prototype._request = function(url_suffix, callback) {
    var url = this._base_url + url_suffix;
    console.log("URL is: \"" +url+"\"");
    this.req.open("GET",url,true);
    this.req.onreadystatechange = callback;
    this.req.send( null );
};
