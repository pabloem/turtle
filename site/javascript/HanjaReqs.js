var HanjaReqs = function() {
  this.req = new XMLHttpRequest();
  this._base_url = "/runquery";
  this.reqInProgress = false;
  this.pending = [];
};

HanjaReqs.prototype.doneRequest = function(callback) {
  if(this.req.readyState != 4 || this.req.status != 200) return;
  callback();
  if(this.pending.length > 0) {
    this.reqInProgress = false;
    var r = this.pending.shift();
    this._request(r.url_suffix,r.callback, r.async);
  } else {
    this.reqInProgress = false;
  }
};

HanjaReqs.prototype.logRequest = function() {
};

HanjaReqs.prototype.nodeRequest = function(node_id,nodeQResult) {
    if(Array.isArray(node_id)) {
        node_id = node_id.join(" ");
    }
    this._request("?query=node "+node_id, nodeQResult,true);
};

HanjaReqs.prototype.fullNodeRequest = function(node_id,fullNodeQRes) {
    if(Array.isArray(node_id)) {
        node_id = node_id.join(" ");
    }
    this._request("?query=node "+node_id, fullNodeQRes,true);
};

HanjaReqs.prototype.searchRequest = function(search_str,searchQResult,async) {
    if("undefined" == typeof async) async = true;
    this._request("?query=search "+search_str, searchQResult,async);
};

HanjaReqs.prototype.rootRequest = function(root,rootReqResult) {
    this._request("?query=root "+root,rootReqResult,true);
};

HanjaReqs.prototype._request = function(url_suffix, callback,async) {
  if(this.reqInProgress == true) {
    this.pending.push({url_suffix:url_suffix, callback:callback, async:async});
    return ;
  }
  var url = this._base_url + url_suffix,
      _this = this;
  console.log("URL is: \"" +url+"\"");
  this.req.open("GET",url,async);
  this.req.onreadystatechange = function() {_this.doneRequest(callback); };
  this.reqInProgress = true;
  this.req.send( null );
};
