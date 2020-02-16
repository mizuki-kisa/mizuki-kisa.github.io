var StringCapitalizationNode = {
  name: "String Capitalization",
  category: "String Utilities",
  initialize: function () {
    this._internal.inputText = "";
    this._internal.capitalization = "";
    this._internal.resultText = "";
    this._internal.hasScheduledCapitalize = false;
  },
  inputs: {
    inputText: {
      type: 'string',
      displayName: 'Text',
      group: 'Capitalization',
      set: function(value) {
        if(this._internal.inputText === value) return;
        this._internal.inputText = value;
        this.scheduleCapitalize();
      }
    },
    capitalization: {
      type: {
        name: 'enum',
        enums: [
          {value: "large", label: "LARGE CAPS"},
          {value: "small", label: "small caps"},
          {value: "title", label: "Title Case"},
          {value: "start", label: "Start case"},
          {value: "none", label: "none"}
        ]
      },
      group: "Capitalization",
      displayName: "Capitalize",
      default: "large",
      set: function(value) {
        if(this._internal.capitalization === value) return;
        this._internal.capitalization = value;
        this.scheduleCapitalize();
        
      }
    }
  },
  outputs: {
    resultText: {
      displayName: "Result",
      type: "string",
      group: "Case",
      getter:function(){
        return this._internal.resultText;
      }
    }
  },
  prototypeExtensions: {
    scheduleCapitalize: function() {
      if(!this._internal.hasScheduledCapitalize) {
        this._internal.hasScheduledCapitalize = true;
        this.scheduleAfterInputsHaveUpdated(function() {
          this.capitalize();
          this._internal.hasScheduledCapitalize = false;
        });
      }
    },
    capitalize: function(){

      switch(this._internal.capitalization){
        case "large":
          this._internal.resultText = this._internal.inputText.toUpperCase();
          break;
        case "small":
          this._internal.resultText = this._internal.inputText.toLowerCase();
          break;
        case "title":
          this._internal.resultText = this._internal.inputText
            .toLowerCase()
            .split(' ')
            .map(function(word) {
              return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
            })
            .join(' ');
          break;
        case "start":
          this._internal.resultText = this._internal.inputText
            .toLowerCase()
            .split('.')
            .map(function(sentence) {
              var startIndex = 0;
              for(var i = 0; i < sentence.length; i++){
                if(sentence.charAt(i) != " "){
                  startIndex = i;
                  break;
                }
              }
              return sentence.replace(sentence.charAt(startIndex), sentence.charAt(startIndex).toUpperCase());

            })
            .join('.');
          break;
        case "none":
          this._internal.resultText = this._internal.inputText;
          break;
        default:
          this._internal.resultText = this._internal.inputText;
          break;
      }
      this.flagOutputDirty("resultText");
    }
  }
};

var StringLengthNode = {
  name: "String Length",
  category: "String Utilities",
  initialize: function () {
    this._internal.countText = "";
    this._internal.charCount = 0;
    this._internal.wordCount = 0;
  },
  inputs: {
    countText: {
      type: 'string',
      displayName: 'Text',
      group: 'Count',
      set: function(value) {
        if(this._internal.countText === value) return;
        this._internal.countText = value;
        this.count();
      }
    }
  },
  outputs: {
    charCount: {
      displayName: "Character count",
      type: "number",
      group: "Count",
      getter:function(){
        return this._internal.charCount;
      }
    },
    wordCount: {
      displayName: "Word count",
      type: "number",
      group: "Count",
      getter:function(){
        return this._internal.wordCount;
      }
    }
  },
  prototypeExtensions: {
    count: function(){
      this._internal.charCount = this._internal.countText.length;
      this._internal.wordCount = this._internal.countText.split(" ").length;

      this.flagOutputDirty("charCount");
      this.flagOutputDirty("wordCount");
    }
  }
};

var StringPadNode = {
  name: "String Pad",
  category: "String Utilities",
  initialize: function () {
    this._internal.inputText = "";
    this._internal.preText = "";
    this._internal.postText = "";
    this._internal.outputText = "";
  },
  inputs: {
    inputText: {
      type: 'string',
      displayName: 'Text',
      set: function(value){
        if(this._internal.inputText === value) return;
        this._internal.inputText = value;
        this.schedule(this.padText.bind(this));
      }
    },
    preText: {
      type: 'string',
      displayName: 'Before',
      set: function(value){
        if(this._internal.preText === value) return;
        this._internal.preText = value;
        this.schedule(this.padText.bind(this));
      }
    },
    postText: {
      type: 'string',
      displayName: 'After',
      set: function(value){
        if(this._internal.postText === value) return;
        this._internal.postText = value;
        this.schedule(this.padText.bind(this));
      }
    }
  },
  outputs: {
    outputText: {
      type: 'string',
      displayName: 'Result',
      getter:function(){
        return this._internal.outputText;
      }
    }
  },
  prototypeExtensions: {
    schedule: function(callback) {
      if(!this._internal.hasScheduled) {
        this._internal.hasScheduled = true;
        this.scheduleAfterInputsHaveUpdated(function() {
          callback();
          this._internal.hasScheduled = false;
        });
      }
    },
    padText: function(){
      this._internal.outputText = this._internal.preText + this._internal.inputText + this._internal.postText;
      this.flagOutputDirty("outputText");
    }
  }
};

var StringRangeNode = {
  name: "String Range",
  category: "String Utilities",
  initialize: function () {
    this._internal.searchText = "";
    this._internal.searchKey = "";
    this._internal.caseSensitive = false;
    this._internal.startPosition = 0;
    this._internal.endPosition = 0;
    this._internal.hasScheduledSearch = false;
  },
  inputs: {
    searchText: {
      type: 'string', // string, boolean, number, signal
      displayName: 'Text',
      group: 'Search',
      //valueChangedToTrue: function () {}
      //getter:function() {}
      set: function(value) {
        if(this._internal.searchText === value) return;
        this._internal.searchText = value;
        this.scheduleSearch();
      }
    },
    searchKey: {
      type: 'string',
      displayName: 'Find',
      group: 'Search',
      set: function(value){
        if(this._internal.searchKey === value) return;
        this._internal.searchKey = value;
        this.scheduleSearch();
      }
    },
    caseSensitive: {
      type: 'boolean',
      displayName: 'Case sensitive',
      group: 'Search',
      set: function(value){
        if(this._internal.caseSensitive === value) return;
        this._internal.caseSensitive = value;
        this.scheduleSearch();
      }
    }
  },
  outputs: {
    startPosition: {
      displayName: "Start position",
      type: "number",
      group: "Position",
      getter:function(){
        return this._internal.startPosition;
      }
    },
    endPosition: {
      displayName: "End position",
      type: "number",
      group: "Position",
      getter:function(){
        return this._internal.endPosition;
      }
    }
  },
  prototypeExtensions: {
    scheduleSearch: function() {
      if(!this._internal.hasScheduledSearch) {
        this._internal.hasScheduledSearch = true;
        this.scheduleAfterInputsHaveUpdated(function() {
          this.search();
          this._internal.hasScheduledSearch = false;
        });
      }
    },
    search: function(){
      if(this._internal.caseSensitive){
        this._internal.startPosition = this._internal.searchText.indexOf(this._internal.searchKey,0);
        if(this._internal.startPosition === -1){
          this._internal.endPosition = 0;
        } else {
          this._internal.endPosition = this._internal.startPosition + this._internal.searchKey.length;
        }
      } else {
        this._internal.startPosition = this._internal.searchText.toLowerCase().indexOf(this._internal.searchKey.toLowerCase(),0);
        if(this._internal.startPosition === -1){
          this._internal.endPosition = 0;
        } else {
          this._internal.endPosition = this._internal.startPosition + this._internal.searchKey.length;
        }
      }
      
      this.flagOutputDirty("startPosition");
      this.flagOutputDirty("endPosition");

    }
  }
};


var StringReverseNode = {
  name: "String Reverse",
  category: "String Utilities",
  initialize: function(){
    this._internal.reverseText = "";
    this._internal.resultText = "";
  },
  inputs: {
    reverseText: {
      type: 'string',
      displayName: 'Text',
      group: 'Reverse',
      set: function(value) {
        if(this._internal.reverseText === value) return;
        this._internal.reverseText = value;
        this.scheduleReverse();
      }
    }
  },
  outputs: {
    resultText: {
      displayName: "Result",
      type: "string",
      group: "Reverse",
      getter:function(){
        return this._internal.resultText;
      }
    }
  },
  prototypeExtensions: {
    scheduleReverse: function() {
      if(!this._internal.hasScheduledReverse) {
        this._internal.hasScheduledReverse = true;
        this.scheduleAfterInputsHaveUpdated(function() {
          this.reverse();
          this._internal.hasScheduledReverse = false;
        });
      }
    },
    reverse: function(){
      this._internal.resultText = reverse(this._internal.reverseText);
      this.flagOutputDirty("resultText");
    }
  }
};

var StringSearchNode = {
  name: "String Search",
  category: "String Utilities",
  initialize: function () {
    this._internal.searchText = "";
    this._internal.searchKey = "";
    this._internal.caseSensitive = false;
    this._internal.matchFound = false;
    this._internal.matchesFound = 0;
    this._internal.hasScheduledSearch = false;
    // you can also setup callbacks here (just dont forget to store this as self)
  },
  inputs: {
    searchText: {
      type: 'string', // string, boolean, number, signal
      displayName: 'Text',
      group: 'Search',
      //valueChangedToTrue: function () {}
      //getter:function() {}
      set: function(value) {
        if(this._internal.searchText === value) return;
        this._internal.searchText = value;
        this.scheduleSearch();
      }
    },
    searchKey: {
      type: 'string',
      displayName: 'Find',
      group: 'Search',
      set: function(value){
        if(this._internal.searchKey === value) return;
        this._internal.searchKey = value;
        this.scheduleSearch();
      }
    },
    caseSensitive: {
      type: 'boolean',
      displayName: 'Case sensitive',
      group: 'Search',
      set: function(value){
        if(this._internal.caseSensitive === value) return;
        this._internal.caseSensitive = value;
        this.search();
      }
    }
  },
  outputs: {
    matchFound: {
      displayName: "Match found",
      type: "boolean",
      group: "Length",
      getter:function(){
        return this._internal.matchFound;
      }
    },
    matchesFound: {
      displayName: "Nr of matches",
      type: "number",
      group: "Length",
      getter:function(){
        return this._internal.matchesFound;
      }
    }
  },
  prototypeExtensions: {
    scheduleSearch: function() {
      if(!this._internal.hasScheduledSearch) {
        this._internal.hasScheduledSearch = true;
        this.scheduleAfterInputsHaveUpdated(function() {
          this.search();
          this._internal.hasScheduledSearch = false;
        });
      }
    },
    search: function(){
      if(this._internal.searchKey == "" || this._internal.searchText == ""){
        this._internal.matchFound = false;
        this._internal.matchesFound = 0;
        this.flagOutputDirty("matchFound");
        this.flagOutputDirty("matchesFound");
        return;
      }
      
      var matches;
      
      if(this._internal.caseSensitive){
        this._internal.matchFound = this._internal.searchText.includes(this._internal.searchKey, 0);
        var regExp = new RegExp(this._internal.searchKey,"g");
        matches = this._internal.searchText.match(regExp);
      } else {
        this._internal.matchFound = this._internal.searchText.toLowerCase().includes(this._internal.searchKey.toLowerCase(), 0);
        var regExp = new RegExp(this._internal.searchKey,"ig");
        matches = this._internal.searchText.match(regExp);
      }

      if(matches == null || matches == 0){
        this._internal.matchesFound = 0;
      } else {
        this._internal.matchesFound = matches.length;
      }
      
      this.flagOutputDirty("matchFound");
      this.flagOutputDirty("matchesFound");

    }
  }
};

var StringTrimNode = {
  name: "String Trim",
  category: "String Utilities",
  initialize: function () {
    this._internal.inputText = "";
    this._internal.outputText = "";
  },
  inputs: {
    inputText: {
      type: 'string',
      displayName: 'Text',
      set: function(value){
        if(this._internal.inputText === value) return;
        this._internal.inputText = value;
        this.trimInput();
      }
    }
  },
  outputs: {
    outputText: {
      type: 'string',
      displayName: 'Result',
      getter:function(){
        return this._internal.outputText;
      }
    }
  },
  prototypeExtensions: {
    trimInput: function(){
      this._internal.outputText = this._internal.inputText.trim();
      this.flagOutputDirty("outputText");
    }
  }
};


// string reverse method is credited to: https://github.com/mathiasbynens
// the orginial project Esrever can be found here: https://github.com/mathiasbynens/esrever

/*! https://mths.be/esrever v0.2.0 by @mathias */
var regexSymbolWithCombiningMarks = /([\0-\u02FF\u0370-\u1AAF\u1B00-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uE000-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])([\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+)/g;
var regexSurrogatePair = /([\uD800-\uDBFF])([\uDC00-\uDFFF])/g;

var reverse = function(string) {
  // Step 1: deal with combining marks and astral symbols (surrogate pairs)
  string = string
    // Swap symbols with their combining marks so the combining marks go first
    .replace(regexSymbolWithCombiningMarks, function($0, $1, $2) {
      // Reverse the combining marks so they will end up in the same order
      // later on (after another round of reversing)
      return reverse($2) + $1;
    })
    // Swap high and low surrogates so the low surrogates go first
    .replace(regexSurrogatePair, '$2$1');
  // Step 2: reverse the code units in the string
  var result = '';
  var index = string.length;
  while (index--) {
    result += string.charAt(index);
  }
  return result;
};


Noodl.defineModule({
  nodes:[
    StringCapitalizationNode,
    StringLengthNode,
    StringPadNode,
    StringRangeNode,
    StringReverseNode,
    StringSearchNode,
    StringTrimNode
  ],
  setup:function() {
    console.log('String Utils module loaded');
  }
});