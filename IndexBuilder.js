var bs = require('binarysearch');

var Index = function(characters, nodes) {
    this._chars = characters;
    this._nodes = nodes;
};
Index.prototype.searchNodesBy = function(character) {
    var ind = bs.first(this._chars,character);
    if(ind == -1) return undefined;
    return this._nodes[ind];
};

var IndexBuilder = function(settings) {
    this._dictionary = {};
    this._characters = [];
    if(settings.split_per_char) {
        this._split_per_char = true;
    }
    if(settings.split_on) {
        this._split_on = settings.split_on;
    }
};

IndexBuilder.prototype.build = function() {
    this._characters.sort();
    var nodes = [];
    for(i = 0; i < this._characters.length; i++) {
        var key = this._characters[i];
        var nodarr = this._dictionary[key];
        nodes.push(nodarr.sort(function(a,b){return a-b;}));
    }
    delete this._dictionary;
    var index = new Index(this._characters, nodes);
    return index;
};

IndexBuilder.prototype._cleanChar = function(char) {
    var rem_chars = ["(", ")", ".", "/", 
                     ",", ";", "\""];
    var result = char;
    for(var cnt_i=0; cnt_i<rem_chars.length; cnt_i++){
        result = result.replace(rem_chars[cnt_i]," ");
    }
    return result;
};

IndexBuilder.prototype.addElem = function(sign,node_index) {
    var chars;
    sign = this._cleanChar(sign);
    if(this._split_per_char) {
        chars = sign.split("");
    }
    if(this._split_on) {
        chars = sign.split(this._split_on);
    }
    for(i=0;i<chars.length;i++) {
        var char = chars[i];
        if(char == "") continue;
        if(!this._dictionary[char]) {
            this._dictionary[char] = [];
            this._characters.push(char);
        }
        this._dictionary[char].push(node_index);
    }
};

module.exports = IndexBuilder;

