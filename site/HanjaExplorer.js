var HanjaExplorer = function(hanjaRequester, config) {
    this._hr = hanjaRequester;
    this._r = new sigma({container: 'container',
                         settings: {
                             doubleClickEnabled: false
                         }
                        });
    this._neighbor_scale = [7,10,13,16,19,22,25,5000];
    this.refresh();

    var he = this;
    this._r.bind('clickNode', function(e) {
        var node = e.data.node;
        he._showNodeDetails(node);
    });
    this._r.bind('doubleClickNode',function(e) {
        var node_id = e.data.node.id;
        he._setFocus(node_id);
    });
};
HanjaExplorer.prototype._displayRootInfo = function() {
    if(!(this._hr.req.readyState == 4 && this._hr.req.status == 200)) return;
    var res = eval(this._hr.req.responseText);
    if(res.length == 0) return;
    res = res[0];
    var det = {};
    det.of = "the character";
    det.instruction = "(See on the left, words that use this character.)";
    det.main = res.chinese;
    det.secondary = "Radicals: <p>"+res.radicals+"</p>";
    det.tertiary = res.meaning;
    fillInDetails(det);
    this._hr.searchRequest(res.chinese,searchQueryResult,false);
};
HanjaExplorer.prototype.displayRoot = function(root) {
    this._hr.rootRequest(root,this._displayRootInfo.bind(this));
};
HanjaExplorer.prototype._showNodeDetails = function(node) {
    var det = {};
    det.of = "the word";
    det.instruction = "(Click on a character if you want to learn about it.)";
    det.main = "<lu id='roots'><li>"+
        node.chinese
        .split("")
        .join("</li><li>")
        +"</li></lu>";
    det.secondary = node.korean;
    det.tertiary = node.english;
    fillInDetails(det);
    setRootsClickEvent();
};
HanjaExplorer.prototype.showNode = function(node,neighbors) {
    if("undefined" == typeof neighbors) neighbors = true;
    this._addNode(node);
    this._showNodeDetails(node);
    this._setFocus(node.id, neighbors);
};

HanjaExplorer.prototype._addExtraEdges = function(node){
    console.log("Adding edges for nodes already in the graph.");
    var ngs = this._r.graph.nodes(node.neighbors);
    for(var i=0; i<ngs.length; i++) {
        if("undefined" == typeof ngs[i]) continue;
        var from = node.id < ngs[i].id ? node.id : ngs[i].id;
        var to = node.id >= ngs[i].id ? node.id : ngs[i].id;
        this.addEdge(from, to);
    }
};

// Ready
HanjaExplorer.prototype._addNode = function(node) {
    var gr = this._r.graph.nodes(node['id']);
    if (gr) {
        // The node is already in the graph
        return ;
    }
    // The nodes don't come with SigmaJS properties added, so we add:
    node.x = Math.random();
    node.y = Math.random();
    node.color = '#AAAAAA';
    node.size = 1;
    node.label = 
        node.korean+" - "+node.chinese+"\n"+
        node.english;
    this._r.graph.addNode(node);
    if(node.neighbors) {
        this._addExtraEdges(node);
    }
    this.refresh();
};

// Ready
HanjaExplorer.prototype._configForceAtlasTimeout = function(sig, timeout) {
    console.log("Setting layout algorithm timeout: "+timeout);
    setTimeout(function() { 
        console.log("Stopping force atlas layout algorithm");
        sig.killForceAtlas2();},timeout);
    console.log("Set up timeout for ForceAtlas layout");
};

// Ready
HanjaExplorer.prototype.fixLayout = function(timeout) {
    if(!timeout) {
        timeout = 500;
    }
    if(this._r.isForceAtlas2Running()) {
        console.log("ForceAtlas algorithm is running at the moment.");
        return;
    }
    this._r.startForceAtlas2({worker: false, barnesHutOptimize: false,
                              iterationsPerRender: 1000});
    this._configForceAtlasTimeout(this._r,timeout);
};

// Not Ready
HanjaExplorer.prototype._dropNeighbors = function (node_id) {
    console.log("Dropping neighbors of " + node_id + " - not fully implemented.");
    var nd = this._r.graph.nodes(node_id);
    var nodes_to_remove = nd.neighbors;
    for(var i = 0; i < nodes_to_remove.length; i++) {
        if (nodes_to_remove[i] == this._focus) continue;
        if(!this._r.graph.nodes(nodes_to_remove[i])) continue;
        this._r.graph.dropNode(nodes_to_remove[i]);
    }
    this.refresh();
};

HanjaExplorer.prototype._setFocus = function(node_id, neighbors) {
    if("undefined" == typeof neighbors) neighbors = true;
    var old_focus = this._focus;
    this._focus = node_id;
//    if (old_focus) this._dropNeighbors(bye_focus);
    this._focus = node_id;
    if(neighbors) {
        this._addNeighbors(node_id);
    }
};

// Ready
HanjaExplorer.prototype.addEdge = function(from,to) {
    if (this._r.graph.edges(from+" "+to) || 
        this._r.graph.edges(to+" "+from)) {
        console.log("Edge " + from + " " + to + 
                    " is already in the graph");
        return ;
    }
    console.log("Adding edge: "+from+" "+to);
    var edge = {id: from+" "+to,
                source: from, 
                target: to};
    this._r.graph.addEdge(edge);
    this.refresh();
};

HanjaExplorer.prototype._receiveAddNeighbors = function(node_id) {
    if(!(this._hr.req.readyState == 4 && this._hr.req.status == 200))
        return;
    var res = eval(this._hr.req.responseText);
    for(var i = 0; i < res.length; i++) {
        this._addNode(res[i]);
    }
    for(var j = 0; j < res.length; j++) {
        var from = node_id < res[j].id ? node_id : res[j].id;
        var to =  node_id >= res[j].id ? node_id : res[j].id;
        this.addEdge(from,to);
    }
    this.fixLayout();
};

HanjaExplorer.prototype._addNeighbors = function(node_id) {
    var nd = this._r.graph.nodes(node_id);
    if(!nd.neighbors) {
        console.log("Node has no neighbors. Can't add them.");
        return ;
    }
    var _this = this;
    if("undefined" == typeof nd.neighbor_scale) {
        nd.neighbor_scale = 0;
    }
    var nb_list = 
            nd.neighbors.slice(0,
                               this._neighbor_scale[
                                   nd.neighbor_scale]);
    if(this._neighbor_scale[nd.neighbor_scale] > nd.neighbors.length) {
        return;
    }
    nd.neighbor_scale += 1;
    this._hr.nodeRequest(nb_list, 
                         function() {
                         _this._receiveAddNeighbors.bind(_this)(node_id);
                         });
    return ;
};

HanjaExplorer.prototype.clear = function() {
    this._r.graph.clear();
    this.refresh();
};

HanjaExplorer.prototype.refresh = function() {
    this._r.refresh();
};
